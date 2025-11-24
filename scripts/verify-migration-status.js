/**
 * Migration Status Verification Script
 *
 * This script checks the current state of Prisma migrations and provides
 * detailed diagnostics to help troubleshoot migration issues.
 *
 * Usage:
 *   node scripts/verify-migration-status.js
 *
 * Prerequisites:
 *   - DATABASE_URL must be set in your environment
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function verifyMigrationStatus() {
  const databaseUrl = process.env.DATABASE_URL;

  // Validate DATABASE_URL
  if (!databaseUrl) {
    log('❌ ERROR: DATABASE_URL is not set', colors.red);
    process.exit(1);
  }

  log('\n🔍 PRISMA MIGRATION STATUS VERIFICATION', colors.cyan);
  log('=' .repeat(60), colors.cyan);

  // Check local migrations
  const migrationsDir = path.join(__dirname, '..', 'src', 'prisma', 'migrations');
  log('\n📁 Local Migrations:', colors.blue);

  try {
    const localMigrations = fs.readdirSync(migrationsDir)
      .filter(item => {
        const fullPath = path.join(migrationsDir, item);
        return fs.statSync(fullPath).isDirectory() && item !== 'migration_lock.toml';
      })
      .sort();

    if (localMigrations.length === 0) {
      log('   ⚠️  No local migrations found', colors.yellow);
    } else {
      log(`   Found ${localMigrations.length} local migration(s):`, colors.cyan);
      localMigrations.forEach((migration, index) => {
        log(`   ${index + 1}. ${migration}`, colors.green);
      });
    }
  } catch (error) {
    log(`   ❌ Error reading migrations directory: ${error.message}`, colors.red);
  }

  // Connect to database and check applied migrations
  const client = new Client({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 10000,
  });

  try {
    log('\n📡 Connecting to database...', colors.blue);
    await client.connect();
    log('✅ Connected successfully', colors.green);

    // Check if _prisma_migrations table exists
    const tableCheckResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = '_prisma_migrations'
      );
    `);

    const migrationsTableExists = tableCheckResult.rows[0].exists;

    if (!migrationsTableExists) {
      log('\n📋 Database Migration Status:', colors.blue);
      log('   ℹ️  _prisma_migrations table does not exist', colors.yellow);
      log('   This is normal for a fresh database', colors.yellow);
      log('\n💡 Recommendation:', colors.cyan);
      log('   Run: npx prisma migrate deploy --schema=./src/prisma/schema.prisma', colors.blue);
    } else {
      log('\n📋 Applied Migrations in Database:', colors.blue);

      const migrationsResult = await client.query(`
        SELECT
          migration_name,
          finished_at,
          applied_steps_count,
          logs
        FROM _prisma_migrations
        ORDER BY started_at;
      `);

      if (migrationsResult.rows.length === 0) {
        log('   ℹ️  No migrations recorded in database', colors.yellow);
      } else {
        log(`   Found ${migrationsResult.rows.length} applied migration(s):`, colors.cyan);
        migrationsResult.rows.forEach((row, index) => {
          const status = row.finished_at ? '✅' : '❌';
          const statusText = row.finished_at ? 'SUCCESS' : 'FAILED';
          const color = row.finished_at ? colors.green : colors.red;
          log(`   ${index + 1}. ${status} ${row.migration_name} [${statusText}]`, color);

          if (!row.finished_at) {
            log(`      ⚠️  This migration failed and is blocking further migrations`, colors.yellow);
            if (row.logs) {
              log(`      Logs: ${row.logs.substring(0, 100)}...`, colors.yellow);
            }
          }
        });
      }

      // Check for failed migrations
      const failedMigrationsResult = await client.query(`
        SELECT migration_name, logs
        FROM _prisma_migrations
        WHERE finished_at IS NULL;
      `);

      if (failedMigrationsResult.rows.length > 0) {
        log('\n⚠️  FAILED MIGRATIONS DETECTED:', colors.red);
        failedMigrationsResult.rows.forEach(row => {
          log(`   - ${row.migration_name}`, colors.red);
        });

        log('\n💡 Resolution:', colors.cyan);
        log('   Your database has failed migrations that need to be cleaned up.', colors.yellow);
        log('   Run: node scripts/reset-neon-db.js', colors.blue);
        log('   Then: npx prisma migrate deploy --schema=./src/prisma/schema.prisma', colors.blue);
      } else {
        log('\n✅ All applied migrations completed successfully', colors.green);
      }
    }

    // Check for actual tables in database
    log('\n📊 Database Tables:', colors.blue);
    const tablesResult = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    if (tablesResult.rows.length === 0) {
      log('   ℹ️  No tables found in database', colors.yellow);
    } else {
      log(`   Found ${tablesResult.rows.length} table(s):`, colors.cyan);
      tablesResult.rows.forEach((row, index) => {
        log(`   ${index + 1}. ${row.tablename}`, colors.green);
      });
    }

    log('\n' + '='.repeat(60), colors.cyan);
    log('✅ VERIFICATION COMPLETE', colors.green);
    log('='.repeat(60) + '\n', colors.cyan);

  } catch (error) {
    log('\n❌ ERROR during verification:', colors.red);
    log(`   ${error.message}`, colors.red);
    if (error.code) {
      log(`   Error code: ${error.code}`, colors.yellow);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run verification
verifyMigrationStatus().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}`, colors.red);
  process.exit(1);
});
