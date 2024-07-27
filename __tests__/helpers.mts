import { generatePrismaClient } from '#app/adapters/orm/index.mjs'

async function deleteAllRecords(): Promise<void> {
  const prisma = generatePrismaClient()
  try {
    await prisma.$executeRaw`TRUNCATE TABLE "Allocation", "Batch", "OrderLine" CASCADE;`
  } catch (error) {
    console.error('Error deleting all records:', error)
  }
  await prisma.$disconnect()
}

export { deleteAllRecords }