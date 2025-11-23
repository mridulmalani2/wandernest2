console.log('🚨 DATABASE_URL:', process.env.DATABASE_URL);
const dbUrl = process.env.DATABASE_URL || '';
const protocol = dbUrl.split(':')[0];
console.log('🚨 Extracted protocol:', protocol);



#!/usr/bin/env node
/**
 * Safe diagnostic script to check DATABASE_URL before Prisma commands
 * This script NEVER logs secrets - only checks format and logs protocol
 */

const databaseUrl = process.env.DATABASE_URL

console.log('\n🔍 DATABASE_URL Diagnostic Check')
console.log('==================================')

if (!databaseUrl) {
  console.error('❌ ERROR: DATABASE_URL is not set')
  console.error('   Please ensure DATABASE_URL is configured in Vercel Environment Variables')
  console.error('   Go to: Vercel Dashboard → Settings → Environment Variables → Production')
  process.exit(1)
}

if (typeof databaseUrl !== 'string') {
  console.error('❌ ERROR: DATABASE_URL is not a string')
  process.exit(1)
}

if (databaseUrl.trim().length === 0) {
  console.error('❌ ERROR: DATABASE_URL is an empty string')
  process.exit(1)
}

// Extract and log only the protocol (safe to log, contains no secrets)
const protocolMatch = databaseUrl.match(/^([^:]+):\/\//)
const protocol = protocolMatch ? protocolMatch[1] : 'UNKNOWN'

console.log(`✅ DATABASE_URL is set`)
console.log(`✅ Protocol: ${protocol}://`)

// Validate it's a PostgreSQL URL
if (protocol !== 'postgresql' && protocol !== 'postgres') {
  console.error(`❌ ERROR: DATABASE_URL must start with postgresql:// or postgres://`)
  console.error(`   Found protocol: ${protocol}://`)
  console.error('   This is likely an Azure or other non-PostgreSQL connection string')
  console.error('   Please update DATABASE_URL in Vercel to use your Neon PostgreSQL URL')
  process.exit(1)
}

// Try to parse as URL to validate format
try {
  new URL(databaseUrl)
  console.log('✅ DATABASE_URL is a valid URL format')
} catch (error) {
  console.error('❌ ERROR: DATABASE_URL is not a valid URL format')
  console.error('   URL parsing error:', error.message)
  process.exit(1)
}

console.log('✅ DATABASE_URL validation passed')
console.log('==================================\n')
process.exit(0)
