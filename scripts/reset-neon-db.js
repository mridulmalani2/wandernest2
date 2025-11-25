/**
 * Complete Database Reset Script for Neon PostgreSQL
 *
 * This script performs a COMPLETE wipe of your Neon database, removing:
 * - All tables (including _prisma_migrations)
 * - All enums
 * - All foreign key constraints
 * - All indexes
 *
 * USE WITH CAUTION: This will delete ALL data in your database.
 *
 * Usage:
 *   node scripts/reset-neon-db.js
 *
 * Prerequisites:
 *   - DATABASE_URL must be set in your environment
 *   - You must have a Neon PostgreSQL database connection
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
  log('=' .repeat(60), colors.cyan);
  log('⚠️  WARNING: This will DELETE ALL DATA in your database!', colors.yellow);
  log('=' .repeat(60), colors.cyan);

  const client = new Client({
    connectionString: databaseUrl,
    // Increase timeout for potentially slow operations
    connectionTimeoutMillis: 10000,
  });

  try {
    log('\n📡 Connecting to Neon database...', colors.blue);
    await client.connect();
    log('✅ Connected successfully', colors.green);

    // Step 1: Drop all tables (including _prisma_migrations)
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
        log(`   Dropping table: ${tableName}`, colors.yellow);
        await client.query(`DROP TABLE IF EXISTS "public"."${tableName}" CASCADE;`);
      }
      log('✅ All tables dropped', colors.green);
    }

    // Step 2: Drop all enums
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
        log(`   Dropping enum: ${enumName}`, colors.yellow);
        await client.query(`DROP TYPE IF EXISTS "public"."${enumName}" CASCADE;`);
      }
      log('✅ All enum types dropped', colors.green);
    }

    // Step 3: Verify clean state
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
    log(`   ${error.message}`, colors.red);
    if (error.stack) {
      log(`\nStack trace:`, colors.yellow);
      log(error.stack, colors.yellow);
    }
    process.exit(1);
  } finally {
    await client.end();
    log('📡 Database connection closed', colors.blue);

    // Give the database a moment to fully release locks
    log('⏱️  Waiting for locks to clear...', colors.blue);
    await new Promise(resolve => setTimeout(resolve, 2000));
    log('✅ Ready for migration\n', colors.green);
  }
}

// Run the reset
resetDatabase().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}`, colors.red);
  process.exit(1);
});
