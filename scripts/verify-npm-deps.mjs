import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const packageJsonPath = resolve(process.cwd(), 'package.json')
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

const deps = {
  ...(packageJson.dependencies || {}),
  ...(packageJson.devDependencies || {}),
}

const packageNames = Object.keys(deps).sort()
const now = Date.now()
const sevenDaysMs = 7 * 24 * 60 * 60 * 1000

const failures = []

function getPackageMetadata(name) {
  try {
    const raw = execSync(`npm view ${name} --json`, { stdio: ['ignore', 'pipe', 'pipe'] })
    return JSON.parse(raw.toString('utf-8'))
  } catch (error) {
    return { error }
  }
}

for (const name of packageNames) {
  const metadata = getPackageMetadata(name)

  if (metadata.error) {
    failures.push({ name, reason: 'Package not found or registry lookup failed' })
    continue
  }

  const time = metadata.time
  if (!time || !time.created) {
    failures.push({ name, reason: 'Missing publish time metadata' })
    continue
  }

  const createdAt = Date.parse(time.created)
  if (Number.isNaN(createdAt)) {
    failures.push({ name, reason: 'Invalid publish time metadata' })
    continue
  }

  if (now - createdAt < sevenDaysMs) {
    failures.push({ name, reason: 'Package appears newly published (under 7 days)' })
  }
}

if (failures.length > 0) {
  console.error('❌ npm dependency verification failed:')
  for (const failure of failures) {
    console.error(`- ${failure.name}: ${failure.reason}`)
  }
  process.exit(1)
}

console.log('✅ npm dependency verification passed.')
