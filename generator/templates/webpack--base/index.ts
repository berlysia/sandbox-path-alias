import fs from "node:fs";
import Generator from "yeoman-generator";
import type { BaseOptions } from "yeoman-generator";
import { parseSrcSetName } from "../../srcUtils.js";
import { parseTplSetName } from "../../tplUtils.js";

const rootDirName = process.cwd();
function fromRootDir(path: string) {
  return `${rootDirName}/${path}`;
}
const currentDirName = import.meta.dirname;
function fromCurrentDir(path: string) {
  return `${currentDirName}/${path}`;
}
const srcSetNames = fs.readdirSync("src");

type Options = BaseOptions & {
  tplSetName: string;
};

export default class extends Generator<Options> {
  writing() {
    const parsedTplSetName = parseTplSetName(this.options.tplSetName);
    for (const srcSetName of srcSetNames) {
      const parsedSrcSetName = parseSrcSetName(srcSetName);
      if (
        parsedTplSetName.language &&
        parsedTplSetName.language !== parsedSrcSetName.language.value
      )
        continue;

      const pkgName = `${this.options.tplSetName}_${srcSetName}`;
      this.fs.copy(
        this.templatePath(fromRootDir(`src/${srcSetName}`)),
        this.destinationPath(fromRootDir(`generated/${pkgName}/src`))
      );

      this.fs.copyTpl(
        this.templatePath(fromCurrentDir("package.json.ejs")),
        this.destinationPath(fromRootDir(`generated/${pkgName}/package.json`)),
        {
          tplSetName: this.options.tplSetName,
          srcSetName,
          moduleType:
            parsedTplSetName.moduleType ||
            parsedSrcSetName.expectedModuleType.value,
          sourceExt: parsedSrcSetName.language.value,
          samedir: parsedTplSetName.slug.includes("samedir"),
          useImports: parsedTplSetName.slug.includes("imports"),
        }
      );

      this.fs.copyTpl(
        this.templatePath(fromCurrentDir("webpack.config.mjs.ejs")),
        this.destinationPath(
          fromRootDir(`generated/${pkgName}/webpack.config.mjs`)
        ),
        {
          isTS: parsedSrcSetName.language.isTS,
          useAlias: parsedTplSetName.slug.includes("alias"),
          useNormalPlugin: parsedTplSetName.slug.includes("plugin"),
          useTsconfig:
            parsedSrcSetName.language.isTS &&
            parsedTplSetName.slug.includes("tsconfig"),
          useTsconfigForJS:
            parsedSrcSetName.language.isJS &&
            parsedTplSetName.slug.includes("tsconfig"),
        }
      );

      if (
        parsedTplSetName.slug.includes("tsconfig") ||
        parsedSrcSetName.language.isTS
      ) {
        this.fs.copyTpl(
          this.templatePath(fromCurrentDir("tsconfig.json.ejs")),
          this.destinationPath(
            fromRootDir(`generated/${pkgName}/tsconfig.json`)
          ),
          {
            moduleType: parsedSrcSetName.language.isTS
              ? "ESNext"
              : parsedSrcSetName.language.isJS
              ? "NodeNext"
              : "ESNext",
            useTsPaths:
              parsedSrcSetName.language.isTS &&
              (parsedTplSetName.slug.includes("tsconfig") ||
                !parsedTplSetName.slug.includes("imports")),
            samedir: parsedTplSetName.slug.includes("samedir"),
          }
        );
      }
    }
  }
}
