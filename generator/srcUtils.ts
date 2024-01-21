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

export function getModuleType(srcSetName: string) {
  if (isCjs(srcSetName)) return "commonjs";
  if (isEsm(srcSetName)) return "module";
  throw new Error(`Unknown module type for ${srcSetName}`);
}
