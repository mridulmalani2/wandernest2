/**
 * Prisma Migration with Direct URL
 *
 * This script ensures migrations use a direct database connection
 * instead of a pooled connection to avoid advisory lock timeouts.
 */

const { execSync } = require('child_process');

function setupDirectUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL is not set');
    process.exit(1);
  }

  // Check if DIRECT_URL is already set
  if (process.env.DIRECT_URL) {
    console.log('✅ DIRECT_URL is already set');
    return process.env.DIRECT_URL;
  }

  // Generate DIRECT_URL by removing "-pooler" from hostname
  let directUrl = databaseUrl;

  try {
    const url = new URL(databaseUrl);

    // Check if this is a Neon pooler URL
    if (url.hostname.includes('-pooler.')) {
      // Remove "-pooler" from hostname
      url.hostname = url.hostname.replace('-pooler.', '.');
      directUrl = url.toString();

      console.log('🔧 Generated DIRECT_URL from DATABASE_URL');
      console.log('   Removed -pooler from hostname for direct connection');
    } else {
      console.log('ℹ️  DATABASE_URL does not use pooler, using as-is for DIRECT_URL');
    }

  } catch (error) {
    console.error('⚠️  Error parsing DATABASE_URL:', error.message);
    console.log('⚠️  Falling back to DATABASE_URL as DIRECT_URL');
  }

  return directUrl;
}

function runMigration() {
  console.log('\n🚀 Running Prisma migrations with direct connection...\n');

  const directUrl = setupDirectUrl();

  try {
    // Run prisma migrate deploy with DIRECT_URL set
    execSync('prisma migrate deploy --schema=./src/prisma/schema.prisma', {
      stdio: 'inherit',
      env: {
        ...process.env,
        DIRECT_URL: directUrl,
      },
    });

    console.log('\n✅ Migrations completed successfully\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
runMigration();
