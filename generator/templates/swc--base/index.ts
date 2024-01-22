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
            (parsedTplSetName.buildTarget.value &&
              parsedTplSetName.buildTarget.moduleType) ||
            parsedSrcSetName.expectedModuleType.value,
          sourceExt: parsedSrcSetName.language.value,
          samedir: parsedTplSetName.slug.includes("samedir"),
          useImports: parsedTplSetName.slug.includes("imports"),
        }
      );

      this.fs.copyTpl(
        this.templatePath(fromCurrentDir(".swcrc.ejs")),
        this.destinationPath(fromRootDir(`generated/${pkgName}/.swcrc`)),
        {
          moduleType: parsedTplSetName.buildTarget.value
            ? parsedTplSetName.buildTarget.swcModule
            : false,
          usePaths: !parsedTplSetName.slug.includes("noswcpaths"),
          isTS: parsedSrcSetName.language.isTS,
        }
      );

      if (
        parsedSrcSetName.language.isTS ||
        parsedTplSetName.slug.includes("tsconfig")
      ) {
        this.fs.copyTpl(
          this.templatePath(fromCurrentDir("tsconfig.json.ejs")),
          this.destinationPath(
            fromRootDir(`generated/${pkgName}/tsconfig.json`)
          ),
          {
            moduleType:
              (parsedTplSetName.buildTarget.value &&
                parsedTplSetName.buildTarget.tsModule) ||
              parsedSrcSetName.expectedModuleType.tsModule,
            useTsPaths:
              parsedSrcSetName.language.isTS &&
              (parsedTplSetName.slug.includes("tsconfig") ||
                !parsedTplSetName.slug.includes("imports")),
            samedir: parsedTplSetName.slug.includes("samedir"),
            allowJs: parsedSrcSetName.language.isJS,
          }
        );
      }
    }
  }
}
