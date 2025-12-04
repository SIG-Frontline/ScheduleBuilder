/* eslint-disable @typescript-eslint/no-require-imports */
// CommonJS flat config for ESLint (keeps compatibility with current deps).
const tsParser = require('@typescript-eslint/parser');
const globals = require('globals');
const js = require('@eslint/js');
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = [
  // Ignore build outputs and deps
  {
    ignores: ['.next/**', 'node_modules/**'],
  },

  // Spread shareable configs converted by FlatCompat
  ...compat.extends('next', 'next/core-web-vitals', 'next/typescript'),

  // JS-only files: don't use the TypeScript parser/project
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },

  // TypeScript files: enable the parser with project references
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      indent: 'off',
    },
  },
];
// /* eslint-disable @typescript-eslint/no-require-imports */
// // `eslint/config` is an ESM-only export in newer ESLint releases.
// // Use `FlatCompat` to include shareable configs, then append our custom
// // flat-config object. Keep this file CommonJS so Node's `require()` works.

// const tsParser = require('@typescript-eslint/parser');
// const globals = require('globals');
// const js = require('@eslint/js');

// const { FlatCompat } = require('@eslint/eslintrc');

// const compat = new FlatCompat({
//   baseDirectory: __dirname,
//   recommendedConfig: js.configs.recommended,
//   allConfig: js.configs.all,
// });

// module.exports = [
//   // Ignore build outputs and deps
//   {
//     ignores: ['.next/**', 'node_modules/**'],
//   },

//   // Spread shareable configs converted by FlatCompat
//   ...compat.extends('next', 'next/core-web-vitals', 'next/typescript'),

//   // JS-only files: don't use the TypeScript parser/project
//   {
//     files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
//     languageOptions: {
//       globals: {
//         ...globals.node,
//         ...globals.jest,
//       },
//     },
//   },

//   // TypeScript files: enable the parser with project references
//   {
//     files: ['**/*.ts', '**/*.tsx'],
//     languageOptions: {
//       parser: tsParser,
//       parserOptions: {
//         tsconfigRootDir: __dirname,
//         project: ['./tsconfig.json'],
//       },
//       globals: {
//         ...globals.node,
//         ...globals.jest,
//       },
//     },
//     rules: {
//       indent: 'off',
//     },
//   },
// ];
