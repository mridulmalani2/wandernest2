/**
 * Centralized ESLint config used by both app and scripts.
 * Root is set to avoid cascading configs when merging branches.
 */
module.exports = {
  root: true,
module.exports = {
  extends: ['next/core-web-vitals'],
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  rules: {
    'react/no-unescaped-entities': 'off',
    'react-hooks/exhaustive-deps': 'off',
    '@next/next/no-img-element': 'off',
  },
  settings: {
    next: {
      rootDir: ['./src', './'],
    },
  },
  rules: {
    // Allow apostrophes in JSX text without forcing HTML entities to prevent noisy lint errors
    'react/no-unescaped-entities': 'off',
  },
};
