import { PrismaClient } from '.prisma/client/default.js'
const prisma = new PrismaClient()

async function deleteAll() {
  return await prisma.$executeRaw`DELETE FROM "Batch"`
}

describe('prisma orm', () => {
  afterEach(async () => await deleteAll())

  it('can create a batch', async () => {
    await prisma.batch.create({
      data: {
        ref: 'batch-1',
        sku: 'TABLE',
        qty: 20,
        eta: null
      },
    })

    const result = await prisma.$queryRaw`SELECT * FROM "Batch"`

    expect(result[0]).toEqual({
      id: expect.any(Number),
      ref: 'batch-1',
      sku: 'TABLE',
      qty: 20,
      eta: null,
    })
  })

  it('can retrieve a batch', async () => {
    await prisma.$queryRaw`
      INSERT INTO "Batch" (ref, sku, qty, eta) VALUES ('batch-2', 'CHAIR', 20, NULL)
    `

    const batch = await prisma.batch.findUnique({
      where: { ref: 'batch-2' },
    })

    expect(batch).toEqual({
      id: expect.any(Number),
      ref: 'batch-2',
      sku: 'CHAIR',
      qty: 20,
      eta: null,
    })
  })
})
