import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Hypercerts Lexicon ESLint configuration.
 */
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["scripts/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: path.resolve(__dirname, "./tsconfig.json"),
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    // Ignore generated files from lex-cli (except exports.ts which we lint)
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/.rollup.cache/**",
      "**/coverage/**",
      "generated/types/**",
      "generated/lexicons.ts",
      "generated/util.ts",
      "generated/index.ts",
    ],
  },
];
