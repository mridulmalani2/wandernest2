module.exports = {
  extends: ['next/core-web-vitals'],
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
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
