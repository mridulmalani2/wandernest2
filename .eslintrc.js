/**
 * Centralized ESLint config used by both app and scripts.
 * Root is set to avoid cascading configs when merging branches.
 */
module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  rules: {
    // Allow apostrophes in JSX text without forcing HTML entities to prevent noisy lint errors
    'react/no-unescaped-entities': 'off',
    'react-hooks/exhaustive-deps': 'off',
    '@next/next/no-img-element': 'off',
    // Guard against accidental duplicate imports that broke the student auth landing build
    'no-duplicate-imports': 'error',
  },
  settings: {
    next: {
      rootDir: ['./src', './'],
    },
  },
};
