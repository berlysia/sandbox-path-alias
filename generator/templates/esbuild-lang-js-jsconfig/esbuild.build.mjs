import esbuild from "esbuild";

esbuild.build({
  entryPoints: ["src/index.js"],
  outdir: "dist",
  bundle: true,
});
