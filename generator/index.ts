import Generator, { BaseOptions } from "yeoman-generator";
import fs from "node:fs";

const tplSetNames = fs.readdirSync("generator/templates");
const tplTargetLibraries = Array.from(
  new Set(tplSetNames.map((x) => x.split("-")[0]))
);

export default class RootGenerator extends Generator<
  BaseOptions & { libraryName?: string }
> {
  answers!: {
    targetTplSetNames: string[];
  };

  constructor(...args: unknown[]) {
    super(...args);
    this.argument("libraryName", { type: String, required: false });
  }

  async prompting() {
    this.answers = tplTargetLibraries.includes(this.options.libraryName ?? "")
      ? this.options.libraryName
      : await this.prompt([
          {
            type: "checkbox",
            name: "targetTplSetNames",
            message: "Which template set do you want to generate?",
            choices: tplTargetLibraries,
          },
        ]);
  }
  async configuring() {
    for (const tplSetName of tplSetNames) {
      if (tplSetName.endsWith("--base")) continue;
      if (
        !this.answers.targetTplSetNames.some(
          (x) => tplSetName.startsWith(`${x}-`) || tplSetName === x
        )
      ) {
        continue;
      }
      const genPath = `./templates/${tplSetName}/index.ts`;
      const Generator = (await import(genPath)).default;
      this.composeWith(
        { Generator, path: genPath } as any,
        { tplSetName } as any
      );
    }
  }
}
