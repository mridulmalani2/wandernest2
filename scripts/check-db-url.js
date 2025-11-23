/**
 * Safe diagnostic script to check DATABASE_URL before Prisma commands
 * This script NEVER logs secrets - only checks format and logs protocol
 *
 * Invoked by: node scripts/check-db-url.js
 * No shebang needed - invoked explicitly with node command
 */

// Defensive: ensure process.env exists
if (!process || !process.env) {
  console.error('❌ ERROR: process.env is not available')
  process.exit(1)
}

const databaseUrl = process.env.DATABASE_URL

console.log('\n🔍 DATABASE_URL Diagnostic Check')
console.log('==================================')

// Check 1: Variable exists
if (!databaseUrl) {
  console.error('❌ ERROR: DATABASE_URL is not set')
  console.error('   Please ensure DATABASE_URL is configured in Vercel Environment Variables')
  console.error('   Go to: Vercel Dashboard → Settings → Environment Variables → Production')
  process.exit(1)
}

// Check 2: Variable is a string (defensive check)
if (typeof databaseUrl !== 'string') {
  console.error('❌ ERROR: DATABASE_URL is not a string')
  console.error('   Type detected: ' + typeof databaseUrl)
  process.exit(1)
}

// Check 3: String is not empty
if (databaseUrl.trim().length === 0) {
  console.error('❌ ERROR: DATABASE_URL is an empty string')
  process.exit(1)
}

// Check 4: Extract protocol (safe to log, contains no secrets)
let protocol = 'UNKNOWN'
try {
  const protocolMatch = databaseUrl.match(/^([^:]+):\/\//)
  protocol = protocolMatch ? protocolMatch[1] : 'UNKNOWN'
} catch (error) {
  console.error('❌ ERROR: Failed to parse DATABASE_URL protocol')
  console.error('   Error:', error instanceof Error ? error.message : String(error))
  process.exit(1)
}

console.log('✅ DATABASE_URL is set')
console.log('✅ Protocol: ' + protocol + '://')

// Check 5: Validate it's a PostgreSQL URL
if (protocol !== 'postgresql' && protocol !== 'postgres') {
  console.error('❌ ERROR: DATABASE_URL must start with postgresql:// or postgres://')
  console.error('   Found protocol: ' + protocol + '://')
  console.error('   This is likely an Azure or other non-PostgreSQL connection string')
  console.error('   Please update DATABASE_URL in Vercel to use your Neon PostgreSQL URL')
  process.exit(1)
}

// Check 6: Validate URL format
try {
  // Use the URL constructor to validate format
  const urlObj = new URL(databaseUrl)

  // Additional validation: ensure critical parts exist
  if (!urlObj.hostname || urlObj.hostname.trim().length === 0) {
    throw new Error('Missing hostname in DATABASE_URL')
  }

  console.log('✅ DATABASE_URL is a valid URL format')
} catch (error) {
  console.error('❌ ERROR: DATABASE_URL is not a valid URL format')
  if (error instanceof Error) {
    console.error('   URL parsing error:', error.message)
  } else {
    console.error('   URL parsing error:', String(error))
  }
  process.exit(1)
}

console.log('✅ DATABASE_URL validation passed')
console.log('==================================\n')
process.exit(0)
