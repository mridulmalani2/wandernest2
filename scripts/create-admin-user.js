const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
  const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User'

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('❌ Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.')
    process.exit(1)
  }

  // Use async hash to avoid blocking the event loop
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)

  // Check if admin exists first to avoid accidental role escalation on update
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: ADMIN_EMAIL }
  })

  let admin;

  if (existingAdmin) {
    // Update existing admin but DO NOT change the role
    admin = await prisma.admin.update({
      where: { email: ADMIN_EMAIL },
      data: {
        passwordHash,
        name: ADMIN_NAME,
        isActive: true,
      },
    })
    console.log(`✅ Admin account updated for ${admin.email}`)
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
    })
    console.log(`✅ New Admin account created for ${admin.email}`)
  }
}

main()
  .catch((error) => {
    console.error('❌ Failed to seed admin user');
    // Log only safe error details
    if (error.code) console.error(`   Error code: ${error.code}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
