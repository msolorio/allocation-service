import { generatePrismaClient } from '#app/adapters/orm/index.mjs'
import {
  deleteAllRecords,
  insertBatch,
  insertOrderLine,
  insertAllocation
} from '#__tests__/helpers.mjs'
import { Batch, OrderLine, allocate } from '#app/domain/model.mjs'
import * as repository from '#app/adapters/repository.mjs'
import {
  BatchRecord,
  OrderLineRecord,
  AllocationRecord,
} from '#app/types.mjs'

beforeEach(async () => await deleteAllRecords())

describe('batch repository', () => {
  it('can save a batch with an allocation', async () => {
    const batch = new Batch({
      ref: 'batch-1',
      sku: 'LAMP',
      qty: 20,
      eta: null,
    })
    batch.allocations = new Set([new OrderLine({ orderref: 'order-3', sku: 'LAMP', qty: 12 })])


    const prisma = generatePrismaClient()
    const repo = new repository.PrismaRepository({ prisma })
    repo.add(batch)
    await repo.sync()

    const batchRows: Array<BatchRecord> = await prisma.$queryRaw`SELECT * FROM "Batch" WHERE ref = 'batch-1'`
    expect(batchRows).toHaveLength(1)
    expect(batchRows[0]).toEqual({
      id: expect.any(Number),
      ref: 'batch-1',
      sku: 'LAMP',
      qty: 20,
      eta: null,
    })

    const orderLinesRows: Array<OrderLineRecord> = await prisma.$queryRaw`SELECT * FROM "OrderLine" WHERE orderref = 'order-3'`
    expect(orderLinesRows).toHaveLength(1)
    expect(orderLinesRows[0]).toEqual({
      id: expect.any(Number),
      orderref: 'order-3',
      sku: 'LAMP',
      qty: 12,
    })

    const allocationsRows: Array<AllocationRecord> = await prisma.$queryRaw`SELECT * FROM "Allocation"`
    expect(allocationsRows).toHaveLength(1)
    expect(allocationsRows[0]).toEqual({
      id: expect.any(Number),
      batchid: batchRows[0].id,
      orderlineid: orderLinesRows[0].id,
    })
  })

  it('can retrieve a batch with its allocation', async () => {
    const prisma = generatePrismaClient()
    const batchId = await insertBatch({ prisma, ref: 'batch-1', sku: 'LAMP', qty: 20, eta: null })
    const orderlineId = await insertOrderLine({ prisma, orderref: 'order-1', sku: 'LAMP', qty: 12 })
    await insertAllocation({ prisma, batchId, orderlineId })
    const repo = new repository.PrismaRepository({ prisma })

    const batch = await repo.get('batch-1')

    expect(batch.ref).toEqual('batch-1')
    expect(batch.sku).toEqual('LAMP')
    expect(batch.initialQty).toEqual(20)
    expect(batch.eta).toBeNull()
    expect(batch.allocations.size).toEqual(1)
    const allocated = [...batch.allocations][0]
    expect(allocated.orderref).toEqual('order-1')
    expect(allocated.sku).toEqual('LAMP')
    expect(allocated.qty).toEqual(12)
  })

  it('can update a batch with an allocation', async () => {
    const prisma = generatePrismaClient()
    const batchid = await insertBatch({ prisma, ref: 'batch-1', sku: 'LAMP', qty: 20, eta: null })
    const repo = new repository.PrismaRepository({ prisma })
    const batches = await repo.list()

    expect(batches[0]).toBeInstanceOf(Batch)
    expect(batches[0].allocations.size).toEqual(0)
    const line = new OrderLine({ orderref: 'order-1', sku: 'LAMP', qty: 12 })

    allocate(line, batches)
    await repo.sync()

    const allocations: Array<{ batchid: number }> = await prisma.$queryRaw`SELECT batchid FROM "Allocation"`
    expect(allocations).toHaveLength(1)
    expect(allocations[0]).toEqual({ batchid })
    const orderlines: Array<{ orderref: string }> = await prisma.$queryRaw`SELECT orderref FROM "OrderLine"`
    expect(orderlines[0]).toEqual({ orderref: 'order-1' })
  })

  it('can retrieve list of batches with their allocations', async () => {
    const prisma = generatePrismaClient()
    const batchId1 = await insertBatch({ prisma, ref: 'batch-1', sku: 'LAMP', qty: 20, eta: null })
    await insertBatch({ prisma, ref: 'batch-2', sku: 'SOFA', qty: 20, eta: null })
    const orderlineId1 = await insertOrderLine({ prisma, orderref: 'order-1', sku: 'LAMP', qty: 12 })
    await insertAllocation({ prisma, batchId: batchId1, orderlineId: orderlineId1 })
    const repo = new repository.PrismaRepository({ prisma })

    const batches = await repo.list()

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

    expect(batches[1].ref).toEqual('batch-2')
    expect(batches[1].sku).toEqual('SOFA')
    expect(batches[1].initialQty).toEqual(20)
    expect(batches[1].eta).toBeNull()
  })
})

