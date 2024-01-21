import fs from "node:fs";
import Generator from "yeoman-generator";
import type { BaseOptions } from "yeoman-generator";
import { isCjs, isTs } from "../../srcUtils.js";

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
      if (!isTs(srcSetName)) continue;

      const pkgName = `${this.options.tplSetName}_${srcSetName}`;
      this.fs.copy(
        this.templatePath(fromRootDir(`src/${srcSetName}`)),
        this.destinationPath(fromRootDir(`generated/${pkgName}/src`))
      );
      const sourceExt = isTs(srcSetName) ? "ts" : "js";
      this.fs.copyTpl(
        this.templatePath(fromCurrentDir("package.json.ejs")),
        this.destinationPath(fromRootDir(`generated/${pkgName}/package.json`)),
        {
          tplSetName: this.options.tplSetName,
          srcSetName,
          moduleType: "module",
          sourceExt,
        }
      );
      this.fs.copy(
        this.templatePath(fromCurrentDir("esbuild.build.mjs")),
        this.destinationPath(
          fromRootDir(`generated/${pkgName}/esbuild.build.mjs`)
        )
      );
      this.fs.copyTpl(
        this.templatePath(fromCurrentDir("tsconfig.json.ejs")),
        this.destinationPath(fromRootDir(`generated/${pkgName}/tsconfig.json`))
      );
    }
  }
}
