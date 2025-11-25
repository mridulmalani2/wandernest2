# Linting in this repo

The `npm run lint` script maps to `next lint`, which uses ESLint under the hood. A minimal ESLint configuration now lives at the repository root, so the command runs non-interactively as part of local development or CI.

## What changed
- A root `.eslintrc.js` extending `next/core-web-vitals` is committed, so ESLint has the rule set it needs without prompting for setup.
- Parser options point to the existing `tsconfig.json` to keep TypeScript-aware rules accurate.

## How to run lint
1. Ensure dependencies are installed (already present in `package.json`):
   - `eslint`
   - `eslint-config-next`
2. Run:
   ```bash
   npm run lint
   ```
   This executes ESLint with the committed config—no interactive prompt will appear.

## Temporary workaround
If you encounter environment-specific issues (e.g., missing deps in a container image), you can temporarily skip lint during CI by not running `npm run lint` or by passing `--no-eslint` to `next build`. The preferred path is to fix the environment and keep lint enabled.
