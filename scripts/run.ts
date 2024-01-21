import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import colors from "colors-cli/safe";

const rootDirName = process.cwd();
const reset = "\x1b[0m";

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
      stdio: ["ignore", "pipe", "pipe"],
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

async function main() {
  const generatedDirs = await fs.readdir("generated");

  const promises = generatedDirs.map(async (generated) => {
    const cwd = `generated/${generated}`;
    const generatedRootDirName = `${rootDirName}/${cwd}`;
    const resultEntries: Array<[string, string]> = [];
    const buildResult = await spawnP("npm", ["run", "build"], { cwd });
    const isBuildSkipped =
      buildResult.code === 0 &&
      buildResult.stdout.trim().split("\n").at(-1)?.trim() === "skipskipskip";

    if (isBuildSkipped) {
      resultEntries.push([colors.cyan_b.underline(generated) + ":build", "⬇"]);
    } else if (buildResult.code !== 0) {
      return [
        [
          colors.cyan_b.underline(generated) + ":build",
          "❌" +
            formatStderr(buildResult.stderr, generatedRootDirName) +
            formatStdout(buildResult.stdout, generatedRootDirName),
        ],
      ];
    } else {
      resultEntries.push([colors.cyan_b.underline(generated) + ":build", "✅"]);
    }

    if (isBuildSkipped) {
      resultEntries.push([colors.cyan_b.underline(generated) + ":check", "⬇"]);
    } else {
      const distDir = generatedRootDirName.includes("-samedir")
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
        resultEntries.push([
          colors.cyan_b.underline(generated) + ":check",
          "✅",
        ]);
      } else {
        resultEntries.push([
          colors.cyan_b.underline(generated) + ":check",
          "❌" + formatStderr(checkResult.stderr, generatedRootDirName),
        ]);
      }
    }

    const startResult = await spawnP("npm", ["run", "start"], {
      cwd,
    });
    if (startResult.code === 0) {
      return [
        ...resultEntries,
        [
          colors.cyan_b.underline(generated) + ":start",
          "✅" + formatStdout(startResult.stdout, generatedRootDirName),
        ],
      ];
    }

    return [
      ...resultEntries,
      [
        colors.cyan_b.underline(generated) + ":start",
        "❌" + formatStderr(startResult.stderr, generatedRootDirName),
      ],
    ];
  });

  const results = await Promise.all(promises);

  for (const entry of results.flat()) {
    console.log(...entry);
  }
}

main().catch(console.error);
