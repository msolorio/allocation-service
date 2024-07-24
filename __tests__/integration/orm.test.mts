import { prisma } from '#app/adapters/orm/index.mjs'
import { Batch, OrderLine } from '#app/domain/model.mjs'

async function deleteAll() {
  await prisma.$executeRaw`DELETE FROM "Batch"`
  await prisma.$executeRaw`DELETE FROM "OrderLine"`
}

describe('custom orm mapper', () => {
  afterEach(async () => await deleteAll())

  it('can return a batch domain object', async () => {
    await prisma.$queryRaw`INSERT INTO "Batch" (ref, sku, qty, eta) VALUES ('batch-3', 'LAMP', 20, NULL)`

    const batch = (await prisma.batch.findUnique({ where: { ref: 'batch-3' } })).toDomain()

    expect(batch).toEqual({
      ref: 'batch-3',
      sku: 'LAMP',
      initialQty: 20,
      eta: null,
      allocations: new Set(),
    })
  })

  it('can save a batch domain object', async () => {
    await prisma.batch.saveFromDomain(new Batch({
      ref: 'batch-4',
      sku: 'DESK',
      qty: 20,
      eta: null,
    }))

    const result = await prisma.$queryRaw`SELECT * FROM "Batch" WHERE ref = 'batch-4'`

    expect(result[0]).toEqual({
      id: expect.any(Number),
      ref: 'batch-4',
      sku: 'DESK',
      qty: 20,
      eta: null,
    })
  })

  it('can return an orderline domain object', async () => {
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
})