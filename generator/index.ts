import Generator from "yeoman-generator";
import fs from "node:fs";

const tplSetNames = fs.readdirSync("generator/templates");
const tplTargetLibraries = Array.from(
  new Set(tplSetNames.map((x) => x.split("-")[0]))
);

export default class RootGenerator extends Generator {
  answers!: {
    targetTplSetNames: string[];
  };

  async prompting() {
    this.answers = await this.prompt([
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
      if (
        !this.answers.targetTplSetNames.some((x) =>
          tplSetName.startsWith(`${x}-`)
        )
      ) {
        continue;
      }
      const genPath = `./templates/${tplSetName}/index.ts`;
      this.composeWith(
        { Generator: (await import(genPath)).default, path: genPath } as any,
        { tplSetName } as any
      );
    }
  }
}
