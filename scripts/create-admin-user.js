const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const connectionUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL

if (!connectionUrl) {
  // Surface a clear error so seeding fails fast when DATABASE_URL is missing
  throw new Error('DATABASE_URL (or NEON_DATABASE_URL) must be set to seed the admin user')
}

// Always direct Prisma to the configured Neon (or default) connection
process.env.DATABASE_URL = connectionUrl

const prisma = new PrismaClient()

// Keep the username consistent across email + name for simpler login in Neon
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'mridulmalani'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'travelbuddy16'
const ADMIN_NAME = process.env.ADMIN_NAME || 'mridulmalani'
const prisma = new PrismaClient()

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'mridulmalani'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'travelbuddy16'
const ADMIN_NAME = process.env.ADMIN_NAME || 'Mridul Malani'

async function main() {
  const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 10)

  const admin = await prisma.admin.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      passwordHash,
      name: ADMIN_NAME,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      name: ADMIN_NAME,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  })

  console.log(`Admin account ready for ${admin.email}`)
}

main()
  .catch((error) => {
    console.error('Failed to seed admin user', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
