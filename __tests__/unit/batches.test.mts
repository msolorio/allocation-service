import { Batch, OrderLine } from '#app/domain/model.mjs'

describe('batch', () => {
  it('can allocate an orderline', () => {
    const batch = new Batch('batch-1', 'LAMP', 100)
    const orderline = new OrderLine('order-1', 'LAMP', 10)

    batch.allocate(orderline)

    expect(batch.qty).toBe(90)
  })
})
