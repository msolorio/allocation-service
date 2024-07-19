import { Batch, OrderLine } from '#app/domain/model.mjs'

describe('batch', () => {
  it('can allocate an orderline if available greater than required', () => {
    const batch = new Batch({ ref: 'batch-1', sku: 'LAMP', qty: 100, })
    const orderline = new OrderLine({ orderRef: 'order-1', sku: 'LAMP', qty: 10 })

    batch.allocate(orderline)

    expect(batch.qty).toBe(90)
  })

  it('cannot allocate if available less than required', () => {
    const batch = new Batch({ ref: 'batch-1', sku: 'LAMP', qty: 2 })
    const orderline = new OrderLine({ orderRef: 'order-1', sku: 'LAMP', qty: 10 })

    batch.allocate(orderline)

    expect(batch.qty).toBe(2)
  })

  it('can allocate if available equal to required', () => {
    const batch = new Batch({ ref: 'batch-1', sku: 'LAMP', qty: 2 })
    const orderline = new OrderLine({ orderRef: 'order-1', sku: 'LAMP', qty: 2 })

    batch.allocate(orderline)

    expect(batch.qty).toBe(0)
  })
})
