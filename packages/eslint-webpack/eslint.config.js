const importPlugin = require("eslint-plugin-import");

module.exports = [
  {
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": { webpack: true },
    },
    rules: {
      "import/no-unresolved": ["error"],
    },
  },
];
