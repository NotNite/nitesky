import js from "@eslint/js";
import prettier from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
import globals from "globals";
import ts from "typescript-eslint";

export default [
  prettier,
  js.configs.recommended,
  ...ts.configs.recommended,

  {
    languageOptions: {
      globals: {
        ...globals.browser
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        ecmaVersion: "latest",
        sourceType: "module"
      }
    },
    plugins: {
      react
    },
    settings: {
      react: {
        version: "18.2"
      }
    }
  },

  {
    rules: {
      indent: "off",
      eqeqeq: [
        "error",
        "always",
        {
          null: "ignore"
        }
      ],
      quotes: [
        "error",
        "double",
        { avoidEscape: true, allowTemplateLiterals: true }
      ],

      "@typescript-eslint/no-unused-vars": [
        "error",
        { args: "none", varsIgnorePattern: "^_" }
      ],
      "no-console": "error",
      "no-debugger": "error",

      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-require-imports": "off",
      "no-unused-labels": "off"
    }
  }
];
