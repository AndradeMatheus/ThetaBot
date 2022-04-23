module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  rules: {
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
    "ban-ts-comment": "warn",
  },
};
