import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import functional from "eslint-plugin-functional";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

const projectFiles = ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.ts"];
const pureDomainFiles = ["lib/domain/**/*.ts"];

export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  {
    files: projectFiles,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      import: importPlugin,
      functional,
    },
    rules: {
      "no-var": "error",
      "prefer-const": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "VariableDeclaration[kind='let']",
          message: "let 대신 const를 사용하세요.",
        },
        {
          selector: "IfStatement[alternate]",
          message: "else를 사용하지 말고 early return을 사용하세요.",
        },
      ],
      "max-depth": ["error", 1],
      "max-params": ["error", 2],
      "no-ternary": "error",
      "no-else-return": "error",
      "id-denylist": ["error", "req", "res", "ctx", "err", "msg", "num", "str", "obj", "arr"],
      "no-param-reassign": "error",
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        {
          accessibility: "explicit",
          overrides: {
            constructors: "no-public",
          },
        },
      ],
    },
  },
  {
    files: ["lib/**/*.ts"],
    rules: {
      "max-lines-per-function": [
        "error",
        {
          max: 10,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  {
    files: ["app/**/route.ts", "app/**/page.tsx", "app/layout.tsx", "components/**/*.tsx"],
    rules: {
      "max-lines-per-function": "off",
    },
  },
  {
    files: pureDomainFiles,
    rules: {
      "functional/no-let": "error",
      "functional/immutable-data": "error",
      "functional/no-expression-statements": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/components/*", "next", "next/*", "react", "react/*"],
              message: "domain 계층에서는 App Router, UI, Next/React 런타임을 import하지 마세요.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "dist/**", "node_modules/**", "next-env.d.ts"]),
]);
