import { getApiUrl } from '#app/config.mjs'
import { deleteAllRecords, fromJsDateToStringDate } from '#__tests__/helpers.mjs'

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

describe('POST /batch', () => {
  it('persists a batch', async () => {
    const response = await fetch(`${getApiUrl()}/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: 'batch-1', sku: 'TABLE', qty: 10, eta: fromJsDateToStringDate(today) }),
    })

    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({
      ref: 'batch-1',
      sku: 'TABLE',
      qty: 10,
      eta: fromJsDateToStringDate(today)
    })
  })
})

describe('POST /allocation', () => {
  it('persists allocations', async () => {
    await fetch(`${getApiUrl()}/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: 'batch-1', sku: 'TABLE', qty: 5, eta: null }),
    })
    await fetch(`${getApiUrl()}/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: 'batch-2', sku: 'TABLE', qty: 5, eta: fromJsDateToStringDate(today) }),
    })

    const line1 = { orderref: 'order-1', sku: 'TABLE', qty: 5, }
    const line2 = { orderref: 'order-2', sku: 'TABLE', qty: 5, }

    const response1 = await fetch(`${getApiUrl()}/allocation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(line1),
    })

    expect(response1.status).toBe(201)
    expect(await response1.json()).toEqual({ batchref: 'batch-1' })

    const response2 = await fetch(`${getApiUrl()}/allocation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(line2),
    })

    expect(await response2.json()).toEqual({ batchref: 'batch-2' })
  })

  it('unhappy path returns 400 status code', async () => {
    await fetch(`${getApiUrl()}/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: 'batch-1', sku: 'TABLE', qty: 5, eta: null }),
    })

    const orderline = { orderref: 'order-1', sku: 'TABLE', qty: 10, }
    const response = await fetch(`${getApiUrl()}/allocation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderline),
    })

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ message: 'Out of stock for sku: TABLE' })
  })
})