# sandbox-path-alias

## requirements

- Node v20

## how to run

```
npm ci
npm run start # samples it works
npm run broken # samples it does not work
```

# what is this?

There are several ways to alias import paths. The purpose of this repository is to see how to express them, their expressiveness, and their interoperability.

## Expressiveness

| Tool and conditions                          | Prefix replacement `"@/"` -> `"./src/"` | Exact replacement `"libfoo"` -> `"libbar"` | Capture(single⚠️、multiple✅) | RegExp | note                         |
| -------------------------------------------- | --------------------------------------- | ------------------------------------------ | ----------------------------- | ------ | ---------------------------- |
| Node.js                                      | ✅[^Node]                               | ✅                                         | ⚠️                            | ❌     | -                            |
| Bun                                          | ✅                                      | ✅                                         | ⚠️                            | ❌     | tsconfig                     |
| Deno（アプリケーション）                     | ✅                                      | ✅                                         | ❌                            | ❌     | -                            |
| Deno（ライブラリ）                           | ❌                                      | ❌                                         | ❌                            | ❌     | -                            |
| TypeScript                                   | ✅                                      | ✅                                         | ⚠️                            | ❌     | -                            |
| TypeScript next(v5.4.0-dev.20240117)         | ✅[^Node]                               | ✅                                         | ⚠️                            | ❌     | Node.js (imports field)      |
| Flow                                         | ✅                                      | ✅                                         | ✅                            | ✅     | -                            |
| Webpack + resolve.alias                      | ✅                                      | ✅                                         | ❌                            | ❌     | -                            |
| Webpack + NormalModuleReplacementPlugin      | ✅                                      | ✅                                         | ✅                            | ✅     | -                            |
| Webpack + tsconfig-paths-webpack-plugin      | ✅                                      | ✅                                         | ⚠️                            | ❌     | tsconfig                     |
| Rollup + @rollup/plugin-alias                | ✅                                      | ✅                                         | ✅                            | ✅     | -                            |
| Rollup + @rollup/plugin-typescript           | ✅                                      | ✅                                         | ⚠️                            | ❌     | tsconfig                     |
| esbuild                                      | ✅                                      | ✅                                         | ⚠️                            | ❌     | tsconfig                     |
| esbuild + --alias                            | ✅                                      | ❌                                         | ❌                            | ❌     | -                            |
| SWC                                          | ✅                                      | ✅                                         | ⚠️                            | ❌     | -                            |
| Babel + babel-plugin-module-resolver         | ✅                                      | ✅                                         | ✅                            | ✅     | -                            |
| Next.js                                      | ✅                                      | ✅                                         | ⚠️                            | ❌     | tsconfig,jsconfig            |
| Vite + resolve.alias                         | ✅                                      | ✅                                         | ❌                            | ❌     | -                            |
| Vite + vite-tsconfig-paths                   | ✅                                      | ✅                                         | ⚠️                            | ❌     | tsconfig                     |
| Remix                                        | ✅                                      | ✅                                         | ⚠️                            | ❌     | tsconfig                     |
| Nuxt                                         | ✅                                      | ✅                                         | ❌                            | ❌     |                              |
| Jest                                         | ✅                                      | ✅                                         | ✅                            | ✅     | -                            |
| Vitest                                       | ✅                                      | ✅                                         | ❌                            | ❌     | see Vite                     |
| ESLint + eslint-import-resolver-alias        | ✅                                      | ✅                                         | ❌                            | ❌     | -                            |
| ESLint + eslint-import-resolver-typescript   | ✅                                      | ✅                                         | ⚠️                            | ❌     | tsconfig                     |
| ESLint + eslint-plugin-resolver-webpack      | ✅                                      | ✅                                         | ⚠️                            | ❌     | webpack + resolve.alias      |
| ESLint + eslint-import-resolver-babel-module | ✅                                      | ✅                                         | ⚠️                            | ❌     | babel-plugin-module-resolver |
| Biome Linter                                 | ❌                                      | ❌                                         | ❌                            | ❌     | -                            |
| Oxlint                                       | ❌                                      | ❌                                         | ❌                            | ❌     | -                            |
