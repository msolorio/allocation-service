import { generatePrismaClient } from '#app/adapters/orm/index.mjs'
import { Batch, OrderLine } from '#app/domain/model.mjs'
import * as repository from '#app/adapters/repository.mjs'

async function deleteAll() {
  const prisma = generatePrismaClient()

  await prisma.$executeRaw`DELETE FROM "Allocation"`
  await prisma.$executeRaw`DELETE FROM "OrderLine"`
  await prisma.$executeRaw`DELETE FROM "Batch"`
}



describe('batch repository', () => {
  beforeAll(async () => await deleteAll())
  afterEach(async () => await deleteAll())

  it('can save a batch with an allocation', async () => {
    const batch = new Batch({
      ref: 'batch-1',
      sku: 'LAMP',
      qty: 20,
      eta: null,
    })
    batch.allocate(new OrderLine({ orderRef: 'order-3', sku: 'LAMP', qty: 12 }))

    const repo = new repository.PrismaRepository({ transaction: generatePrismaClient() })
    await repo.add(batch)

    const prisma = generatePrismaClient()

    const batchRows = await prisma.$queryRaw`SELECT * FROM "Batch" WHERE ref = 'batch-1'`
    expect(batchRows).toHaveLength(1)
    expect(batchRows[0]).toEqual({
      id: expect.any(Number),
      ref: 'batch-1',
      sku: 'LAMP',
      qty: 20,
      eta: null,
    })

    const orderLinesRows = await prisma.$queryRaw`SELECT * FROM "OrderLine" WHERE orderref = 'order-3'`
    expect(orderLinesRows).toHaveLength(1)
    expect(orderLinesRows[0]).toEqual({
      id: expect.any(Number),
      orderref: 'order-3',
      sku: 'LAMP',
      qty: 12,
    })

    const allocationsRows = await prisma.$queryRaw`SELECT * FROM "Allocation"`
    expect(allocationsRows).toHaveLength(1)
    expect(allocationsRows[0]).toEqual({
      id: expect.any(Number),
      batchid: expect.any(Number),
      orderlineid: expect.any(Number),
    })
  })

  // it('can retrieve a batch with its allocation', async () => {
  //   const prisma = generatePrismaClient()
  //   await prisma.$queryRaw`INSERT INTO "Batch" (ref, sku, qty, eta) VALUES ('batch-1', 'LAMP', 20, NULL)`
  //   const batchId = (await prisma.$queryRaw`SELECT id FROM "Batch" WHERE ref = 'batch-1'`)[0].id
  //   await prisma.$queryRaw`INSERT INTO "OrderLine" (orderref, sku, qty) VALUES ('order-1', 'LAMP', 12)`
  //   const orderlineId = (await prisma.$queryRaw`SELECT id FROM "OrderLine" WHERE orderref = 'order-1' AND sku = 'LAMP'`)[0].id
  //   await prisma.$queryRaw`INSERT INTO "Allocation" (batchid, orderlineid) VALUES (${batchId}, ${orderlineId})`

  //   const repo = new repository.PrismaRepository({ transaction: generatePrismaClient() })
  //   const batch = await repo.get('batch-1')

  //   expect(batch.ref).toEqual('batch-1')
  //   expect(batch.sku).toEqual('LAMP')
  //   expect(batch.qty).toEqual(20)
  //   expect(batch.eta).toBeNull()
  //   expect(batch.allocations).toHaveLength(1)
  //   expect(batch.allocations[0]).toContainEqual(new OrderLine({ orderRef: 'order-1', sku: 'LAMP', qty: 12 }))
  // })
})

