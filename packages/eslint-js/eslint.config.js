const importPlugin = require("eslint-plugin-import");

module.exports = [
  {
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        alias: {
          map: [
            ["##/", "./src/js/"],
            ["#deep/", "./src/js/deep/"],
          ],
        },
      },
    },
    rules: {
      "import/no-unresolved": ["error"],
    },
  },
];
