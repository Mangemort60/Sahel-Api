module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  extends: [
    "eslint:recommended",
    "google",
    "plugin:prettier/recommended", // Assure l'intégration entre Prettier et ESLint
  ],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": [
      "error",
      {
        singleQuote: false,
        trailingComma: "es5",
        endOfLine: "auto",
      },
    ],
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    quotes: ["error", "double", { allowTemplateLiterals: true }],
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
