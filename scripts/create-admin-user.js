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

const MAX_PASSWORD_LENGTH = 128;

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
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
  if (typeof password !== 'string') {
    return { valid: false, reason: 'Password must be a string value' };
  }
  if (password.length === 0) {
    return { valid: false, reason: 'Password cannot be empty' };
  }
  if (password.length < 12) {
    return { valid: false, reason: 'Password must be at least 12 characters long' };
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return { valid: false, reason: `Password must be at most ${MAX_PASSWORD_LENGTH} characters long` };
  }
  if (!/\p{Lu}/u.test(password)) {
    return { valid: false, reason: 'Password must contain at least one uppercase letter' };
  }
  if (!/\p{Ll}/u.test(password)) {
    return { valid: false, reason: 'Password must contain at least one lowercase letter' };
  }
  if (!/\p{Nd}/u.test(password)) {
    return { valid: false, reason: 'Password must contain at least one number' };
  }
  return { valid: true };
}

async function main() {
  let shouldExitWithError = false;

  try {
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
      shouldExitWithError = true;
      return;
    }

    const normalizedEmail = normalizeEmail(ADMIN_EMAIL);

    // Validate email format
    if (!isValidEmail(normalizedEmail)) {
      log('\n❌ Error: Invalid email format', colors.red);
      log(`   Provided: ${normalizedEmail}`, colors.yellow);
      shouldExitWithError = true;
      return;
    }

    // Validate password strength
    const passwordValidation = isValidPassword(ADMIN_PASSWORD);
    if (!passwordValidation.valid) {
      log('\n❌ Error: Password does not meet security requirements', colors.red);
      log(`   ${passwordValidation.reason}`, colors.yellow);
      log('\n   Password requirements:', colors.cyan);
      log('   - At least 12 characters', colors.cyan);
      log(`   - At most ${MAX_PASSWORD_LENGTH} characters`, colors.cyan);
      log('   - At least one uppercase letter', colors.cyan);
      log('   - At least one lowercase letter', colors.cyan);
      log('   - At least one number', colors.cyan);
      shouldExitWithError = true;
      return;
    }

    log('\n✅ Input validation passed', colors.green);

    // Hash password with bcrypt
    log('🔒 Hashing password...', colors.cyan);
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, role: true, isActive: true },
    });

    let admin;

    if (existingAdmin) {
      log(`\n📋 Existing admin found: ${existingAdmin.email}`, colors.yellow);
      log(`   Current role: ${existingAdmin.role}`, colors.yellow);
      log(`   Active: ${existingAdmin.isActive}`, colors.yellow);

      // Update existing admin but DO NOT change the role (security measure)
      admin = await prisma.admin.update({
        where: { email: normalizedEmail },
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
          email: normalizedEmail,
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
  } catch (error) {
    shouldExitWithError = true;
    log('\n❌ Failed to manage admin user', colors.red);
    if (error && error.message) {
      log(`   Message: ${error.message}`, colors.yellow);
    }
    if (error && error.code) {
      log(`   Error code: ${error.code}`, colors.yellow);
      if (error.code === 'P2002') {
        log('   A unique constraint was violated (email may already exist)', colors.yellow);
      }
    }
  } finally {
    await prisma.$disconnect();
    if (shouldExitWithError) {
      process.exit(1);
    }
  }
}

main();
