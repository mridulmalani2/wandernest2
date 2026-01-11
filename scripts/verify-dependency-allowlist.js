const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const packageJsonPath = path.join(repoRoot, 'package.json');
const allowlistPath = path.join(__dirname, 'dependency-allowlist.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function collectDependencies(pkg) {
  return {
    dependencies: Object.keys(pkg.dependencies || {}),
    devDependencies: Object.keys(pkg.devDependencies || {}),
    optionalDependencies: Object.keys(pkg.optionalDependencies || {}),
    peerDependencies: Object.keys(pkg.peerDependencies || {}),
    overrides: Object.keys(pkg.overrides || {}),
  };
}

function compareLists({ name, current, allowed, errors }) {
  const allowedSet = new Set(allowed || []);
  const disallowed = current.filter((dep) => !allowedSet.has(dep));
  if (disallowed.length > 0) {
    errors.push(
      `Disallowed ${name}: ${disallowed.join(', ')}. ` +
        `Update scripts/dependency-allowlist.json if these are approved.`
    );
  }
}

function run() {
  if (!fs.existsSync(packageJsonPath)) {
    console.error('package.json not found.');
    process.exit(1);
  }

  if (!fs.existsSync(allowlistPath)) {
    console.error('Dependency allowlist not found at scripts/dependency-allowlist.json.');
    process.exit(1);
  }

  const pkg = readJson(packageJsonPath);
  const allowlist = readJson(allowlistPath);
  const deps = collectDependencies(pkg);

  const errors = [];

  compareLists({
    name: 'dependencies',
    current: deps.dependencies,
    allowed: allowlist.dependencies,
    errors,
  });

  compareLists({
    name: 'devDependencies',
    current: deps.devDependencies,
    allowed: allowlist.devDependencies,
    errors,
  });

  compareLists({
    name: 'optionalDependencies',
    current: deps.optionalDependencies,
    allowed: allowlist.optionalDependencies || [],
    errors,
  });

  compareLists({
    name: 'peerDependencies',
    current: deps.peerDependencies,
    allowed: allowlist.peerDependencies || [],
    errors,
  });

  compareLists({
    name: 'overrides',
    current: deps.overrides,
    allowed: allowlist.overrides,
    errors,
  });

  if (errors.length > 0) {
    console.error('Dependency allowlist check failed:\n');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log('Dependency allowlist check passed.');
}

run();
