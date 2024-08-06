import { generatedPrismaClient as prisma } from '#app/adapters/orm/index.mjs'
import {
  BatchArgs,
  OrderLineArgs,
  AllocationArgs,
  PrismaClientExtended,
} from '#app/types.mjs'

async function deleteAllRecords(): Promise<void> {
  try {
    await prisma.$executeRaw`TRUNCATE TABLE "Allocation", "Batch", "OrderLine" CASCADE;`
  } catch (error) {
    console.error('Error deleting all records:', error)
  }
  await prisma.$disconnect()
}

function fromJsDateToStringDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

async function insertBatch({ prisma, ref, sku, qty, eta }: { prisma: PrismaClientExtended } & BatchArgs) {
  await prisma.$queryRaw`
    INSERT INTO "Batch" (ref, sku, qty, eta) VALUES (${ref}, ${sku}, ${qty}, ${eta})
  `
  const result: Array<{ id: number }> = await prisma.$queryRaw`
    SELECT id FROM "Batch" WHERE ref = ${ref}
  `
  return result[0].id
}

async function insertOrderLine({ prisma, orderref, sku, qty }: { prisma: PrismaClientExtended } & OrderLineArgs) {
  await prisma.$queryRaw`
    INSERT INTO "OrderLine" (orderref, sku, qty) VALUES (${orderref}, ${sku}, ${qty})
  `
  const result: Array<{ id: number }> = await prisma.$queryRaw`
    SELECT id FROM "OrderLine" WHERE orderref = ${orderref} AND sku = ${sku}
  `
  return result[0].id
}

async function insertAllocation({ prisma, batchId, orderlineId }: { prisma: PrismaClientExtended } & AllocationArgs) {
  await prisma.$queryRaw`
    INSERT INTO "Allocation" (batchid, orderlineid) VALUES (${batchId}, ${orderlineId})
  `
}

export {
  deleteAllRecords,
  fromJsDateToStringDate,
  insertBatch,
  insertOrderLine,
  insertAllocation,
}