import { getApiUrl } from '#app/config.mjs'
import { deleteAllRecords, insertBatch } from '#__tests__/helpers.mjs'
import { generatePrismaClient } from '#app/adapters/orm/index.mjs'

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)
const later = new Date(today)
later.setDate(today.getDate() + 30)

beforeEach(async () => await deleteAllRecords())

describe('health endpoint', () => {
  it('returns 200 and ok', async () => {
    const response = await fetch(`${getApiUrl()}/health`)
    expect(response.status).toBe(200)
    expect(response.statusText).toBe('OK')
  })
})

describe('POST /allocation', () => {
  it('returns 201 and the batch ref on allocation', async () => {
    const prisma = generatePrismaClient()
    await insertBatch({ prisma, ref: 'batch-1', sku: 'TABLE', qty: 20, eta: null })
    await insertBatch({ prisma, ref: 'batch-2', sku: 'TABLE', qty: 20, eta: tomorrow })
    await insertBatch({ prisma, ref: 'batch-3', sku: 'TABLE', qty: 20, eta: later })

    const data = {
      orderref: 'order-1',
      sku: 'TABLE',
      qty: 2,
    }

    const response = await fetch(`${getApiUrl()}/allocation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ batchref: 'batch-1' })
  })

  it('persists allocations', async () => {
    const prisma = generatePrismaClient()
    await insertBatch({ prisma, ref: 'batch-1', sku: 'TABLE', qty: 5, eta: null })
    await insertBatch({ prisma, ref: 'batch-2', sku: 'TABLE', qty: 5, eta: today })

    const line1 = { orderref: 'order-1', sku: 'TABLE', qty: 5, }
    const line2 = { orderref: 'order-2', sku: 'TABLE', qty: 5, }

    const response1 = await fetch(`${getApiUrl()}/allocation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(line1),
    })

    expect(await response1.json()).toEqual({ batchref: 'batch-1' })

    const response2 = await fetch(`${getApiUrl()}/allocation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(line2),
    })

    expect(await response2.json()).toEqual({ batchref: 'batch-2' })
  })

  it('returns 400 message for out of stock', async () => {
    const prisma = generatePrismaClient()
    insertBatch({ prisma, ref: 'batch-1', sku: 'TABLE', qty: 5, eta: null })

    const orderline = { orderref: 'order-1', sku: 'TABLE', qty: 10, }
    const response = await fetch(`${getApiUrl()}/allocation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderline),
    })

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ message: 'Out of stock for sku: TABLE' })
  })

  it('returns 400 for invalid sku', async () => {
    const orderline = { orderref: 'order-1', sku: 'UNKNOWN_SKU', qty: 10, }
    const response = await fetch(`${getApiUrl()}/allocation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderline),
    })

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ message: `Invalid sku: UNKNOWN_SKU` })
  })
})