import { resolve } from "path";
import alias from "@rollup/plugin-alias";

export default {
  input: "src/index.js",
  output: {
    dir: "dist",
    format: "esm",
  },
  plugins: [
    alias({
      entries: [
        { find: "##", replacement: resolve(process.cwd(), "./src") },
        { find: "#deep", replacement: resolve(process.cwd(), "./src/deep") },
      ],
    }),
  ],
};
