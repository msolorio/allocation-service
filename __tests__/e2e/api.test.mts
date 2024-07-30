// import { generatePrismaClient } from '#app/adapters/orm/index.mjs'
import { getApiUrl } from '#app/config.mjs'

describe('health endpoint', () => {
  it('returns 200 and ok', async () => {
    const response = await fetch(`${getApiUrl()}/health`)
    expect(response.status).toBe(200)
    expect(response.statusText).toBe('OK')
  })
})

// describe('allocation endpoint', () => {
//   it('returns 201 and the batch reference', async () => {
//     const prisma = generatePrismaClient()
//     await prisma.$queryRaw`
//     INSERT INTO "Batch" (ref, sku, qty, eta) VALUES ('batch1', 'PHOTO_HOLDER', 100, null)
//   `

//     const data = { orderid: 'order1', sku: 'PHOTO_HOLDER', qty: 2 }

//     const response = await fetch(`${getApiUrl()}/allocation`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data),
//     })

//     expect(response.status).toBe(201)
//     expect(response.json()).toEqual({ 'batchref': 'batch1' })
//   })
// })