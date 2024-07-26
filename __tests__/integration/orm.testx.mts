// import { prisma } from '#app/adapters/orm/index.mjs'
import { generatePrismaClient } from '#app/adapters/orm/index.mjs'
import { Batch, OrderLine } from '#app/domain/model.mjs'

async function deleteAll() {
  const prisma = generatePrismaClient()

  await prisma.$executeRaw`DELETE FROM "Allocation"`
  await prisma.$executeRaw`DELETE FROM "OrderLine"`
  await prisma.$executeRaw`DELETE FROM "Batch"`
}

describe('custom orm mapper', () => {
  beforeAll(async () => await deleteAll())
  afterEach(async () => await deleteAll())

  it('can return an orderline domain object', async () => {
    const prisma = generatePrismaClient()
    await prisma.$queryRaw`INSERT INTO "OrderLine" (orderref, sku, qty) VALUES ('order-1', 'LAMP', 12)`

    const orderline = (await prisma.orderLine.findUnique({
      where: { orderref_sku: { orderref: 'order-1', sku: 'LAMP' } }
    })).toDomain()

    expect(orderline).toEqual({
      orderRef: 'order-1',
      sku: 'LAMP',
      qty: 12,
    })
  })

  it('can save an orderline domain object', async () => {
    const prisma = generatePrismaClient()
    await prisma.orderLine.saveFromDomain(new OrderLine({
      orderRef: 'order-2',
      sku: 'WORKBENCH',
      qty: 20,
    }))

    const result = await prisma.$queryRaw`SELECT * FROM "OrderLine" WHERE orderref = 'order-2' AND sku = 'WORKBENCH'`

    expect(result[0]).toEqual({
      id: expect.any(Number),
      orderref: 'order-2',
      sku: 'WORKBENCH',
      qty: 20,
    })
  })

  it('can save a batch domain object with an orderline allocated to it', async () => {
    const prisma = generatePrismaClient()
    const batch = new Batch({
      ref: 'batch-1',
      sku: 'LAMP',
      qty: 20,
      eta: null,
    })
    batch.allocations = new Set([new OrderLine({ orderRef: 'order-3', sku: 'LAMP', qty: 12 })])

    await prisma.batch.saveFromDomain(batch)

    const batchRecord = await prisma.$queryRaw`SELECT * FROM "Batch" WHERE ref = 'batch-1'`
    const batchId = batchRecord[0].id
    const orderlineRecord = await prisma.$queryRaw`SELECT * FROM "OrderLine" WHERE orderref = 'order-3' AND sku = 'LAMP'`
    const orderlineId = orderlineRecord[0].id
    const allocationRecord = await prisma.$queryRaw`SELECT * FROM "Allocation" WHERE batchid = ${batchId} AND orderlineid = ${orderlineId}`

    expect(batchRecord[0]).toEqual({
      id: expect.any(Number),
      ref: 'batch-1',
      sku: 'LAMP',
      qty: 20,
      eta: null,
    })
    expect(orderlineRecord[0]).toEqual({
      id: expect.any(Number),
      orderref: 'order-3',
      sku: 'LAMP',
      qty: 12,
    })
    expect(allocationRecord[0]).toEqual({
      id: expect.any(Number),
      batchid: batchId,
      orderlineid: orderlineId,
    })
  })

  it('can return a batch domain object with orderlines allocated to it', async () => {
    const prisma = generatePrismaClient()
    await prisma.$queryRaw`INSERT INTO "Batch" (ref, sku, qty, eta) VALUES ('batch-1', 'LAMP', 20, NULL)`
    const batchId = (await prisma.$queryRaw`SELECT id FROM "Batch" WHERE ref = 'batch-1'`)[0].id
    await prisma.$queryRaw`INSERT INTO "OrderLine" (orderref, sku, qty) VALUES ('order-1', 'LAMP', 12)`
    const orderlineId = (await prisma.$queryRaw`SELECT id FROM "OrderLine" WHERE orderref = 'order-1' AND sku = 'LAMP'`)[0].id
    await prisma.$queryRaw`INSERT INTO "Allocation" (batchid, orderlineid) VALUES (${batchId}, ${orderlineId})`

    const result = (await prisma.batch.findUnique({
      where: { ref: 'batch-1' },
      include: { allocations: { include: { orderline: true } } },
    })).toDomain()

    expect(result.ref).toEqual('batch-1')
    expect(result.sku).toEqual('LAMP')
    expect(result.initialQty).toEqual(20)
    expect(result.eta).toEqual(null)
    expect(result.allocations.size).toEqual(1)
    expect(result.allocations).toContainEqual({
      orderRef: 'order-1',
      sku: 'LAMP',
      qty: 12,
    })
  })
})