import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const conventions = {
  rules: {
    "no-comments": {
      meta: {
        type: "suggestion",
        messages: {
          comment: "Comments are not allowed; let names and small functions carry the intent.",
        },
      },
      create: (context) => ({
        Program() {
          for (const comment of context.sourceCode.getAllComments()) {
            if (comment.type !== "Shebang")
              context.report({ loc: comment.loc, messageId: "comment" });
          }
        },
      }),
    },
  },
};

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  prettier,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      conventions,
    },
    rules: {
      "conventions/no-comments": "error",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["error", { allow: ["error"] }],
      "prefer-const": "error",
      "object-shorthand": "error",
      eqeqeq: ["error", "always"],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
