module.exports = {
  root: true,
  extends: [
    'next',
    'next/core-web-vitals',
    'next/typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  env: {
    node: true,
    jest: true,
  },
  rules: {
    indent: 'off',
  },
};
