import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import { resolve } from "path";

function resolveFromRoot(...args) {
  return resolve(process.cwd(), ...args);
}

const config = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: resolveFromRoot("dist"),
    filename: "index.js",
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"],
    // Add support for TypeScripts fully qualified ESM imports.
    extensionAlias: {
      ".js": [".js", ".ts"],
      ".cjs": [".cjs", ".cts"],
      ".mjs": [".mjs", ".mts"],
    },
    plugins: [
      new TsconfigPathsPlugin({ configFile: resolveFromRoot("tsconfig.json") }),
    ],
  },
  module: {
    rules: [
      // all files with a `.ts`, `.cts`, `.mts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.([cm]?ts|tsx)$/, loader: "ts-loader" },
    ],
  },
};

export default config;
