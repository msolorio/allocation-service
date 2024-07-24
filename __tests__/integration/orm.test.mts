import { prisma } from '#app/adapters/orm/index.mjs'
import { Batch } from '#app/domain/model.mjs'

async function deleteAll() {
  return await prisma.$executeRaw`DELETE FROM "Batch"`
}

describe('custom orm mapper', () => {
  afterEach(async () => await deleteAll())

  it('can return a batch model object', async () => {
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

  it('can save a batch model object', async () => {
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
})
