import fs from "node:fs";
import Generator from "yeoman-generator";
import type { BaseOptions } from "yeoman-generator";
import {
  getModuleTypeFromSrcSetName,
  isCjs,
  isJs,
  isTs,
} from "../../srcUtils.js";

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
    for (const srcSetName of srcSetNames) {
      if (!isJs(srcSetName)) continue;

      const pkgName = `${this.options.tplSetName}_${srcSetName}`;
      this.fs.copy(
        this.templatePath(fromRootDir(`src/${srcSetName}`)),
        this.destinationPath(fromRootDir(`generated/${pkgName}/src`))
      );
      const moduleType = getModuleTypeFromSrcSetName(srcSetName);
      this.fs.copyTpl(
        this.templatePath(fromCurrentDir("package.json.ejs")),
        this.destinationPath(fromRootDir(`generated/${pkgName}/package.json`)),
        {
          tplSetName: this.options.tplSetName,
          srcSetName,
          moduleType,
          sourceExt: "js",
        }
      );
      this.fs.copyTpl(
        this.templatePath(fromCurrentDir("rollup.config.mjs.ejs")),
        this.destinationPath(
          fromRootDir(`generated/${pkgName}/rollup.config.mjs`)
        ),
        {
          outputFormat: moduleType === "module" ? "esm" : "cjs",
          transformCommonJS: isCjs(srcSetName),
        }
      );
    }
  }
}
