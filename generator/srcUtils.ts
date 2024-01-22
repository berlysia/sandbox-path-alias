export function isTs(srcSetName: string) {
  return srcSetName.startsWith("ts-");
}

export function isJs(srcSetName: string) {
  return srcSetName.startsWith("js-");
}

export function isCjs(srcSetName: string) {
  return /-cjs-/.test(srcSetName);
}

export function isEsm(srcSetName: string) {
  return /-esm-/.test(srcSetName);
}

export function getModuleTypeFromSrcSetName(srcSetName: string) {
  if (isCjs(srcSetName)) return "commonjs";
  if (isEsm(srcSetName)) return "module";
  throw new Error(`Unknown module type for ${srcSetName}`);
}

function thrower(message: string): never {
  throw new Error(message);
}

export function parseSrcSetName(srcSetName: string) {
  return {
    language: {
      value: isJs(srcSetName)
        ? "js"
        : isTs(srcSetName)
        ? "ts"
        : thrower("Unknown language"),
      get isJS() {
        return this.value === "js";
      },
      get isTS() {
        return this.value === "ts";
      },
    },
    importStyle: {
      value: isJs(srcSetName)
        ? isCjs(srcSetName)
          ? "require"
          : isEsm(srcSetName)
          ? "import"
          : null
        : isTs(srcSetName)
        ? "import"
        : null,
      get isRequire() {
        return this.value === "require";
      },
      get isImport() {
        return this.value === "import";
      },
    },
    expectedModuleType: {
      value: isJs(srcSetName)
        ? getModuleTypeFromSrcSetName(srcSetName)
        : isTs(srcSetName)
        ? "module"
        : thrower("Unknown module type"),
      get isCommonjs() {
        return this.value === "commonjs";
      },
      get isModule() {
        return this.value === "module";
      },
      get tsModule() {
        if (this.isCommonjs) return "CommonJS";
        if (this.isModule) return "NodeNext";
        thrower(`unknown module type: ${this.value}`);
      },
      get rollupOutputFormat() {
        if (this.isCommonjs) return "cjs";
        if (this.isModule) return "esm";
        thrower(`unknown module type: ${this.value}`);
      },
    },
  } as const;
}
