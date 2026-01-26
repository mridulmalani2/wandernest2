const fs = require('fs');
const path = require('path');

const apiRoot = path.join(__dirname, '..', 'src', 'app', 'api');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (entry.isFile() && entry.name === 'route.ts') {
      files.push(fullPath);
    }
  }
  return files;
}

const routeFiles = walk(apiRoot);
const missingRateLimit = [];

for (const file of routeFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const hasRateLimit = content.includes('rateLimitByIp') || content.includes('rateLimitByIdentity');
  const usesWrapper = content.includes('withStudent') || content.includes('withTourist') || content.includes('withAdmin');
  if (!hasRateLimit && !usesWrapper) {
    missingRateLimit.push(path.relative(process.cwd(), file));
  }
}

if (missingRateLimit.length > 0) {
  console.error('Missing rate limiting in the following route files:');
  missingRateLimit.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

console.log('API exposure smoke check passed: rate limiting detected in all routes.');
