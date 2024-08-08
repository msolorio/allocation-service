import { generatedPrismaClient as prisma } from '#app/adapters/orm/index.mjs'
import { PrismaClientExtended } from '#app/types.mjs'
import { deleteAllRecords, insertBatch, insertOrderLine, insertAllocation } from '#__tests__/helpers.mjs'
import * as unitOfWork from '#app/adapters/unitOfWork.mjs'
import { Batch, OrderLine } from '#app/domain/model.mjs'

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)
const later = new Date(today)
later.setDate(today.getDate() + 30)

beforeEach(async () => await deleteAllRecords())

async function getBatchAllocatedTo({ prisma, orderref }: { prisma: PrismaClientExtended, orderref: string }): Promise<string> {
  const result: [{ ref: string }] = await prisma.$queryRaw`
    SELECT b.ref FROM "Allocation" a JOIN "Batch" b ON a.batchId = b.id JOIN "OrderLine" o ON a.orderlineId = o.id
    WHERE o.orderref = ${orderref}
  `
  return result[0].ref
}

describe('Unit of Work', () => {
  it('can save a batch with allocations', async () => {
    const uow = new unitOfWork.PrismaUnitOfWork({ prisma })
    await uow.transaction(async () => {
      const batch = new Batch({ ref: 'batch1', sku: 'sku1', qty: 100, eta: null })
      const line = new OrderLine({ orderref: 'order1', sku: 'sku1', qty: 10 })
      batch.allocate(line)
      uow.batches.add(batch)
      await uow.commit()
    })

    const [{ ref }]: Array<{ ref: string }> = await prisma.$queryRaw`SELECT ref from "Batch"`
    expect(ref).toEqual('batch1')
    const [{ orderref }]: Array<{ orderref: string }> = await prisma.$queryRaw`
      SELECT orderref from "OrderLine" o JOIN "Allocation" a ON o.id = a.orderlineId
    `
    expect(orderref).toEqual('order1')
  })

  it('can retrieve a batch and allocate to it', async () => {
    await insertBatch({ prisma, ref: 'batch1', sku: 'sku1', qty: 100, eta: null })

    const uow = new unitOfWork.PrismaUnitOfWork({ prisma })
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

  it('can retrieve a list of batches', async () => {
    const batchId1 = await insertBatch({ prisma, ref: 'batch-1', sku: 'LAMP', qty: 20, eta: null })
    await insertBatch({ prisma, ref: 'batch-2', sku: 'SOFA', qty: 20, eta: null })
    const orderlineId1 = await insertOrderLine({ prisma, orderref: 'order-1', sku: 'LAMP', qty: 12 })
    await insertAllocation({ prisma, batchId: batchId1, orderlineId: orderlineId1 })

    const uow = new unitOfWork.PrismaUnitOfWork({ prisma })
    await uow.transaction(async () => {
      const batches = await uow.batches.list()

      expect(batches).toHaveLength(2)
      expect(batches[0].ref).toEqual('batch-1')
      expect(batches[0].sku).toEqual('LAMP')
      expect(batches[0].initialQty).toEqual(20)
      expect(batches[0].eta).toBeNull()
      expect(batches[0].allocations.size).toEqual(1)

      const allocated = [...batches[0].allocations][0]
      expect(allocated.orderref).toEqual('order-1')
      expect(allocated.sku).toEqual('LAMP')
      expect(allocated.qty).toEqual(12)
    })
  })


  it('returns null for batch that doesnt exist', async () => {
    const uow = new unitOfWork.PrismaUnitOfWork({ prisma })
    await uow.transaction(async () => {
      const batch = await uow.batches.get('batch1')
      expect(batch).toBeNull()
    })
  })

  it('does not commit without explicit commit', async () => {
    const uow = new unitOfWork.PrismaUnitOfWork({ prisma })
    await uow.transaction(async () => {
      const batch = new Batch({ ref: 'batch1', sku: 'sku1', qty: 100, eta: null })
      uow.batches.add(batch)
    })

    const result: [] = await prisma.$queryRaw`SELECT ref from "Batch"`
    expect(result).toHaveLength(0)
  })
})
