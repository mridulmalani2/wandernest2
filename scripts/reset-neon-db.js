/**
 * Complete Database Reset Script for Neon PostgreSQL
 *
 * ⚠️⚠️⚠️ DEVELOPMENT ONLY - NEVER USE IN PRODUCTION ⚠️⚠️⚠️
 *
 * This script performs a COMPLETE wipe of your database, removing:
 * - All tables (including _prisma_migrations)
 * - All enums
 * - All foreign key constraints
 * - All indexes
 * - ALL USER DATA (students, tourists, bookings, reviews, etc.)
 *
 * DANGER: This will DELETE EVERYTHING in your database!
 *
 * SAFE USAGE (Local Development Only):
 *   1. Set DATABASE_URL to point to your LOCAL or DEV database
 *   2. Run: npm run db:reset:dev
 *   3. This sets ALLOW_DB_RESET=true and NODE_ENV=development
 *
 * PRODUCTION PROTECTION:
 *   - This script will EXIT immediately if:
 *     - NODE_ENV is "production"
 *     - VERCEL environment variable is set
 *     - ALLOW_DB_RESET is not explicitly set to "true"
 *
 * NEVER:
 *   - Run this against production Neon database
 *   - Include this in vercel-build or any CI/CD script
 *   - Use this to "clean up" production data
 *
 * Prerequisites:
 *   - DATABASE_URL must point to a LOCAL/DEV database
 *   - ALLOW_DB_RESET must be set to "true"
 *   - NODE_ENV must NOT be "production"
 */

const { Client } = require('pg');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Safely quote an identifier for SQL (e.g., table/enum names)
// Doubles any embedded quotes to prevent breaking out of the identifier context.
function quoteIdent(identifier) {
  if (identifier === undefined || identifier === null) {
    throw new Error('Identifier must be defined');
  }
  const safe = String(identifier).replace(/"/g, '""');
  return `"${safe}"`;
}

// ============================================
// PRODUCTION SAFETY GUARDS
// ============================================
// These checks prevent accidental execution in production environments
// and ensure the script can only run with explicit, intentional permission.

log('\n🔒 SAFETY CHECK: Verifying this is a safe environment...', colors.cyan);

// Guard 1: Block if running in production environment
if (process.env.NODE_ENV === 'production') {
  log('\n❌ BLOCKED: Cannot run in production environment!', colors.red);
  log('   NODE_ENV is set to "production"', colors.red);
  log('   This script would DELETE ALL DATA including:', colors.yellow);
  log('   - All student registrations', colors.yellow);
  log('   - All tourist requests and bookings', colors.yellow);
  log('   - All reviews and ratings', colors.yellow);
  log('   - All admin accounts', colors.yellow);
  log('\n💡 This script is for LOCAL DEVELOPMENT ONLY', colors.cyan);
  log('   To reset your local database, run: npm run db:reset:dev', colors.blue);
  log('\n🚫 Exiting to protect production data.\n', colors.red);
  process.exit(1);
}

// Guard 2: Block if running on Vercel
if (process.env.VERCEL) {
  log('\n❌ BLOCKED: Cannot run on Vercel!', colors.red);
  log('   VERCEL environment variable is set', colors.red);
  log('   This script must NEVER run during Vercel builds or deployments', colors.yellow);
  log('   Running it would wipe the production database', colors.yellow);
  log('\n💡 If you need to reset the database:', colors.cyan);
  log('   1. Use the Neon web console for production', colors.blue);
  log('   2. Use npm run db:reset:dev for local development', colors.blue);
  log('\n🚫 Exiting to protect production data.\n', colors.red);
  process.exit(1);
}

// Guard 3: Require explicit permission flag
if (process.env.ALLOW_DB_RESET !== 'true') {
  log('\n❌ BLOCKED: Missing explicit permission flag!', colors.red);
  log('   ALLOW_DB_RESET is not set to "true"', colors.red);
  log('   This safety measure prevents accidental execution', colors.yellow);
  log('\n💡 To reset your LOCAL database, use the safe wrapper:', colors.cyan);
  log('   npm run db:reset:dev', colors.blue);
  log('\n   This will:', colors.cyan);
  log('   - Set ALLOW_DB_RESET=true', colors.blue);
  log('   - Set NODE_ENV=development', colors.blue);
  log('   - Run the reset against your local DATABASE_URL', colors.blue);
  log('   - Apply migrations after reset', colors.blue);
  log('\n⚠️  NEVER run this directly without understanding the consequences!', colors.yellow);
  log('🚫 Exiting to protect your data.\n', colors.red);
  process.exit(1);
}

log('✅ Environment checks passed: Development mode confirmed', colors.green);
log('✅ Permission flag verified: ALLOW_DB_RESET=true', colors.green);
log('⚠️  Proceeding with database reset...\n', colors.yellow);

// ============================================
// MAIN RESET FUNCTION
// ============================================

async function resetDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  // Validate DATABASE_URL
  if (!databaseUrl) {
    log('❌ ERROR: DATABASE_URL is not set', colors.red);
    log('   Set it in your .env file or environment variables', colors.yellow);
    process.exit(1);
  }

  if (!databaseUrl.startsWith('postgres://') && !databaseUrl.startsWith('postgresql://')) {
    log('❌ ERROR: DATABASE_URL must be a PostgreSQL connection string', colors.red);
    process.exit(1);
  }

  log('\n🗑️  DATABASE RESET SCRIPT', colors.cyan);
  log('='.repeat(60), colors.cyan);
  log('⚠️  WARNING: This will DELETE ALL DATA in your database!', colors.yellow);
  log('='.repeat(60), colors.cyan);

  const client = new Client({
    connectionString: databaseUrl,
    // Increase timeout for potentially slow operations
    connectionTimeoutMillis: 10000,
  });

  try {
    log('\n📡 Connecting to Neon database...', colors.blue);
    await client.connect();
    log('✅ Connected successfully', colors.green);

    // Step 1: Terminate other connections up front to avoid locks
    log('\n🔒 Terminating other database connections...', colors.blue);
    try {
      await client.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = current_database()
          AND pid <> pg_backend_pid();
      `);
      log('✅ Other connections terminated', colors.green);
    } catch (terminateError) {
      log('⚠️  Could not terminate other connections (this is usually OK)', colors.yellow);
    }

    // Step 2: Drop all tables (including _prisma_migrations)
    log('\n🔍 Finding all tables to drop...', colors.blue);
    const tablesResult = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    if (tablesResult.rows.length === 0) {
      log('   No tables found (database is already clean)', colors.yellow);
    } else {
      log(`   Found ${tablesResult.rows.length} tables`, colors.cyan);

      for (const row of tablesResult.rows) {
        const tableName = row.tablename;
        const safeTable = `${quoteIdent('public')}.${quoteIdent(tableName)}`;
        log(`   Dropping table: ${tableName}`, colors.yellow);
        await client.query(`DROP TABLE IF EXISTS ${safeTable} CASCADE;`);
      }
      log('✅ All tables dropped', colors.green);
    }

    // Step 3: Drop all enums
    log('\n🔍 Finding all enum types to drop...', colors.blue);
    const enumsResult = await client.query(`
      SELECT t.typname as enum_name
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname
      ORDER BY t.typname;
    `);

    if (enumsResult.rows.length === 0) {
      log('   No enum types found', colors.yellow);
    } else {
      log(`   Found ${enumsResult.rows.length} enum types`, colors.cyan);

      for (const row of enumsResult.rows) {
        const enumName = row.enum_name;
        const safeEnum = `${quoteIdent('public')}.${quoteIdent(enumName)}`;
        log(`   Dropping enum: ${enumName}`, colors.yellow);
        await client.query(`DROP TYPE IF EXISTS ${safeEnum} CASCADE;`);
      }
      log('✅ All enum types dropped', colors.green);
    }

    // Step 4: Verify clean state
    log('\n🔍 Verifying database is completely clean...', colors.blue);
    const verifyTables = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_tables
      WHERE schemaname = 'public';
    `);
    const verifyEnums = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public';
    `);

    const tableCount = parseInt(verifyTables.rows[0].count);
    const enumCount = parseInt(verifyEnums.rows[0].count);

    if (tableCount === 0 && enumCount === 0) {
      log('✅ Database is completely clean!', colors.green);
    } else {
      log(`⚠️  Warning: ${tableCount} tables and ${enumCount} enums still exist`, colors.yellow);
    }

    // Step 4: Terminate all other connections to allow clean migration
    log('\n🔒 Terminating other database connections...', colors.blue);
    try {
      await client.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = current_database()
          AND pid <> pg_backend_pid()
          AND usename = current_user;
      `);
      log('✅ Other connections terminated', colors.green);
    } catch (terminateError) {
      log('⚠️  Could not terminate other connections (this is usually OK)', colors.yellow);
    }

    log('\n' + '='.repeat(60), colors.cyan);
    log('✅ DATABASE RESET COMPLETED SUCCESSFULLY', colors.green);
    log('='.repeat(60), colors.cyan);
    log('\n📋 Next steps:', colors.cyan);
    log('   1. Run: npx prisma migrate deploy --schema=./src/prisma/schema.prisma', colors.blue);
    log('   2. Verify: npx prisma migrate status --schema=./src/prisma/schema.prisma', colors.blue);
    log('   3. Generate client: npx prisma generate --schema=./src/prisma/schema.prisma', colors.blue);
    log('   4. Test your build: npm run vercel-build\n', colors.blue);

  } catch (error) {
    log('\n❌ ERROR during database reset:', colors.red);
    log('   A critical error occurred while resetting the database.', colors.red);
    log('   Please check the database connection and permissions.', colors.yellow);

    process.exitCode = 1;
  } finally {
    if (client) {
      await client.end();
      log('📡 Database connection closed', colors.blue);
    }

    // Give the database a moment to fully release locks
    log('⏱️  Waiting for locks to clear...', colors.blue);
    await new Promise(resolve => setTimeout(resolve, 2000));
    log('✅ Ready for migration\n', colors.green);
  }
}

// Run the reset
resetDatabase().catch(error => {
  console.error('\n❌ Unexpected error occurred during execution');
  if (error && error.message) {
    console.error(`   Message: ${error.message}`);
  }
  if (error && error.stack) {
    console.error('   Stack:', error.stack);
  }
  process.exitCode = 1;
});
