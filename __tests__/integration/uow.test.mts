import { generatedPrismaClient as prisma } from '#app/adapters/orm/index.mjs'
import { deleteAllRecords, insertBatch } from '#__tests__/helpers.mjs'
import * as unitOfWork from '#app/adapters/unitOfWork.mjs'
import { Batch, OrderLine } from '#app/domain/model.mjs'

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)
const later = new Date(today)
later.setDate(today.getDate() + 30)

beforeEach(async () => await deleteAllRecords())

async function getBatchAllocatedTo({ prisma, orderref }) {
  const result = await prisma.$queryRaw`
    SELECT b.ref FROM "Allocation" a JOIN "Batch" b ON a.batchId = b.id JOIN "OrderLine" o ON a.orderlineId = o.id
    WHERE o.orderref = ${orderref}
  `
  return result[0].ref
}

describe('Unit of Work', () => {
  it('can retrieve a batch and allocate to it', async () => {

    await insertBatch({ prisma, ref: 'batch1', sku: 'sku1', qty: 100, eta: null })

    const uow = new unitOfWork.PrismaUnitOfWork(prisma)
    await uow.transaction(async () => {
      const batch = await uow.batches.get('batch1')
      const line = new OrderLine({ orderref: 'order1', sku: 'sku1', qty: 10 })
      batch && batch.allocate(line)
      await uow.commit()
    })

    const [{ orderref }]: [{ orderref: string }] = await prisma.$queryRaw`SELECT orderref from "OrderLine"`
    expect(orderref).toEqual('order1')
    const batchref = await getBatchAllocatedTo({ prisma, orderref })
    expect(batchref).toEqual('batch1')
  })

  it('does not commit without explicit commit', async () => {
    const uow = new unitOfWork.PrismaUnitOfWork(prisma)
    await uow.transaction(async () => {
      const batch = new Batch({ ref: 'batch1', sku: 'sku1', qty: 100, eta: null })
      uow.batches.add(batch)
    })

    const result: [] = await prisma.$queryRaw`SELECT ref from "Batch"`
    expect(result).toHaveLength(0)
  })
})
