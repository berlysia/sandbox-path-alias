const importPlugin = require("eslint-plugin-import");

module.exports = [
  {
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": { typescript: true },
    },
    rules: {
      "import/no-unresolved": ["error"],
    },
  },
];
