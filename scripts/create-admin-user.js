const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

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
