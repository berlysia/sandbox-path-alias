import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import colors from "colors-cli/safe";
import { parseTplSetName } from "../generator/tplUtils.js";

const rootDirName = process.cwd();
const reset = "\x1b[0m";
const short = true;

function spawnP(
  command: string,
  args: string[],
  options?: {
    cwd?: string;
  }
): Promise<{
  code: number;
  stdout: string;
  stderr: string;
}> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: short ? ["ignore", "pipe", "ignore"] : ["ignore", "pipe", "pipe"],
      ...options,
    });
    let stdoutBuffer = "";
    child.stdout?.on("data", (data) => {
      stdoutBuffer += data;
    });
    let stderrBuffer = "";
    child.stderr?.on("data", (data) => {
      stderrBuffer += data;
    });
    child.on("close", (code: number) => {
      resolve({
        code,
        stdout: stdoutBuffer,
        stderr: stderrBuffer,
      });
    });
    child.on("error", reject);
  });
}

function formatStdout(stdout: string, rootDirName: string) {
  return (
    "\n    " +
    stdout
      .split("\n")
      .filter((x) => !x.trimStart().startsWith(">") && x.trim().length > 0)
      .map((x) => x.replaceAll(rootDirName, "<rootDir>"))
      .slice(0, 10)
      .join("\n    ") +
    reset +
    "\n"
  );
}

function formatStderr(stderr: string, rootDirName: string) {
  const errLines = stderr.split("\n");

  return (
    "\n    " +
    (errLines
      .find(
        (x) =>
          x.includes("Cannot find module") ||
          x.includes("Could not resolve") ||
          x.includes("Module not found")
      )
      ?.replaceAll(rootDirName, "<rootDir>")
      .substring(0, 100) ??
      errLines
        .slice(0, 15)
        .map((x) => x.replaceAll(rootDirName, "<rootDir>"))
        .join("\n    ")) +
    reset +
    "\n"
  );
}

const STATUS = {
  SUCCESS: "✅",
  FAILURE: "❌",
  SKIPPED: "⬇",
} as const;

async function main() {
  const generatedDirs = await fs.readdir("generated");

  const promises = generatedDirs.map(async (generated) => {
    const cwd = `generated/${generated}`;
    const [tplSetName, srcSetName] = generated.split("_");
    const parsedTplSetName = parseTplSetName(tplSetName);
    const generatedRootDirName = `${rootDirName}/${cwd}`;
    const resultEntries: Array<[string, string]> = [];
    const buildResult = await spawnP("npm", ["run", "build"], { cwd });
    const isBuildSkipped =
      buildResult.code === 0 &&
      buildResult.stdout.trim().split("\n").at(-1)?.trim() === "skipskipskip";
    const markedFileName = colors.cyan_bt.underline(cwd);

    if (isBuildSkipped) {
      resultEntries.push([markedFileName + ":build", STATUS.SKIPPED]);
    } else if (buildResult.code !== 0) {
      return [
        [
          markedFileName + " :build",
          STATUS.FAILURE +
            formatStderr(buildResult.stderr, generatedRootDirName) +
            formatStdout(buildResult.stdout, generatedRootDirName),
        ],
      ];
    } else {
      resultEntries.push([markedFileName + ":build", STATUS.SUCCESS]);
    }

    if (isBuildSkipped) {
      resultEntries.push([markedFileName + ":check", STATUS.SKIPPED]);
    } else {
      const distDir = parsedTplSetName.slug.includes("samedir")
        ? "src"
        : "dist";
      const checkResult = await spawnP(
        "npx",
        [
          "tsx",
          "./scripts/checkResolved.ts",
          `${generatedRootDirName}/${distDir}/index.js`,
        ],
        { cwd: rootDirName }
      );
      if (checkResult.code === 0) {
        resultEntries.push([markedFileName + ":check", STATUS.SUCCESS]);
      } else {
        resultEntries.push([
          markedFileName + ":check",
          STATUS.FAILURE +
            formatStderr(checkResult.stderr, generatedRootDirName),
        ]);
      }
    }

    const startResult = await spawnP("npm", ["run", "start"], {
      cwd,
    });
    if (startResult.code === 0) {
      resultEntries.push([markedFileName + ":start", STATUS.SUCCESS + "\n"]);
    } else {
      resultEntries.push([
        markedFileName + ":start",
        STATUS.FAILURE + formatStderr(startResult.stderr, generatedRootDirName),
      ]);
    }

    if (
      short ||
      resultEntries.every(
        (e) =>
          e[1].startsWith(STATUS.SKIPPED) || e[1].startsWith(STATUS.SUCCESS)
      )
    ) {
      return [
        [markedFileName, resultEntries.map((e) => e[1][0]).join("") + "\n"],
      ];
    }

    return resultEntries;
  });

  promises.reduce<Promise<void>>(async (p, c) => {
    await p;
    const result = await c;
    console.log(...result.flat());
  }, Promise.resolve());
}

main().catch(console.error);
