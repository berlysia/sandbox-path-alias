import { resolve } from "path";
import webpack from "webpack";

const { NormalModuleReplacementPlugin } = webpack;

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
  plugins: [
    new NormalModuleReplacementPlugin(/^##/, (resource) => {
      resource.request = resource.request.replace(
        /^##/,
        resolveFromRoot("src")
      );
    }),
    new NormalModuleReplacementPlugin(/^#deep/, (resource) => {
      resource.request = resource.request.replace(
        /^#deep/,
        resolveFromRoot("src/deep")
      );
    }),
  ],
};

export default config;
