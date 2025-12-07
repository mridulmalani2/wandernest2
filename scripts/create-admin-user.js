/**
 * Create or Update Admin User Script
 *
 * This script creates a new admin user or updates an existing one.
 *
 * SECURITY NOTES:
 * - Passwords are hashed using bcryptjs with cost factor 10
 * - Existing admin roles are never modified (prevents privilege escalation)
 * - Email and password are validated before processing
 * - No sensitive data is logged to console
 *
 * USAGE:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=securePassword npm run create-admin
 *
 * Environment Variables:
 *   ADMIN_EMAIL    - Required. Valid email address for the admin
 *   ADMIN_PASSWORD - Required. Password (min 12 chars, must have uppercase, lowercase, number)
 *   ADMIN_NAME     - Optional. Display name (default: 'Admin User')
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Validate password strength
 * Requirements:
 * - At least 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
function isValidPassword(password) {
  if (password.length < 12) {
    return { valid: false, reason: 'Password must be at least 12 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one number' };
  }
  return { valid: true };
}

async function main() {
  log('\n🔐 Admin User Management Script', colors.cyan);
  log('=' .repeat(50), colors.cyan);

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';

  // Validate required environment variables
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    log('\n❌ Error: Missing required environment variables', colors.red);
    log('   Required:', colors.yellow);
    log('   - ADMIN_EMAIL: The admin email address', colors.yellow);
    log('   - ADMIN_PASSWORD: The admin password', colors.yellow);
    log('\n   Example usage:', colors.cyan);
    log('   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=YourSecurePass123 npm run create-admin', colors.cyan);
    process.exit(1);
  }

  // Validate email format
  if (!isValidEmail(ADMIN_EMAIL)) {
    log('\n❌ Error: Invalid email format', colors.red);
    log(`   Provided: ${ADMIN_EMAIL}`, colors.yellow);
    process.exit(1);
  }

  // Validate password strength
  const passwordValidation = isValidPassword(ADMIN_PASSWORD);
  if (!passwordValidation.valid) {
    log('\n❌ Error: Password does not meet security requirements', colors.red);
    log(`   ${passwordValidation.reason}`, colors.yellow);
    log('\n   Password requirements:', colors.cyan);
    log('   - At least 12 characters', colors.cyan);
    log('   - At least one uppercase letter (A-Z)', colors.cyan);
    log('   - At least one lowercase letter (a-z)', colors.cyan);
    log('   - At least one number (0-9)', colors.cyan);
    process.exit(1);
  }

  log('\n✅ Input validation passed', colors.green);

  // Hash password with bcrypt
  log('🔒 Hashing password...', colors.cyan);
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // Check if admin exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: ADMIN_EMAIL },
    select: { id: true, email: true, role: true, isActive: true },
  });

  let admin;

  if (existingAdmin) {
    log(`\n📋 Existing admin found: ${existingAdmin.email}`, colors.yellow);
    log(`   Current role: ${existingAdmin.role}`, colors.yellow);
    log(`   Active: ${existingAdmin.isActive}`, colors.yellow);

    // Update existing admin but DO NOT change the role (security measure)
    admin = await prisma.admin.update({
      where: { email: ADMIN_EMAIL },
      data: {
        passwordHash,
        name: ADMIN_NAME,
        isActive: true,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    log('\n✅ Admin account updated successfully', colors.green);
    log('   ⚠️  Note: Role was NOT changed (security policy)', colors.yellow);
  } else {
    // Create new admin with SUPER_ADMIN role
    admin = await prisma.admin.create({
      data: {
        email: ADMIN_EMAIL,
        passwordHash,
        name: ADMIN_NAME,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    log('\n✅ New admin account created successfully', colors.green);
  }

  log('\n📋 Admin Details:', colors.cyan);
  log(`   Email: ${admin.email}`, colors.cyan);
  log(`   Name: ${admin.name}`, colors.cyan);
  log(`   Role: ${admin.role}`, colors.cyan);
  log('\n');
}

main()
  .catch((error) => {
    log('\n❌ Failed to manage admin user', colors.red);
    // Log only safe error details (no stack traces or sensitive info)
    if (error.code) {
      log(`   Error code: ${error.code}`, colors.yellow);
      if (error.code === 'P2002') {
        log('   A unique constraint was violated (email may already exist)', colors.yellow);
      }
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
