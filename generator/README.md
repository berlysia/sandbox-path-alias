| variableName | domain          | default                                | description                 |
| ------------ | --------------- | -------------------------------------- | --------------------------- |
| lang         | js, ts          | none -> rotation                       | language of the source code |
| style        | import, require | lang=js -> rotation, lang=ts -> import | syntax of the import        |
| type         | esm, cjs        | same as `style`                        | `package.json#type`         |
| target       | esm, cjs        | same as `type`                         | bundle or transpile output  |
