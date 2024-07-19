import { Batch, OrderLine } from '#app/domain/model.mjs'

const createBatchAndLine = function ({ sku, batchQty, lineQty }) {
  const batch = new Batch({ ref: 'batch-1', sku, qty: batchQty })
  const orderline = new OrderLine({ orderRef: 'order-1', sku, qty: lineQty })

  return { batch, orderline }
}

describe('batch', () => {
  it('can allocate an orderline if available greater than required', () => {
    const { batch, orderline } = createBatchAndLine({ sku: 'LAMP', batchQty: 100, lineQty: 10 })

    batch.allocate(orderline)

    expect(batch.availableQty).toBe(90)
  })

  it('cannot allocate if available less than required', () => {
    const { batch, orderline } = createBatchAndLine({ sku: 'LAMP', batchQty: 2, lineQty: 10 })

    batch.allocate(orderline)

    expect(batch.availableQty).toBe(2)
  })

  it('can allocate if available equal to required', () => {
    const { batch, orderline } = createBatchAndLine({ sku: 'LAMP', batchQty: 2, lineQty: 2 })

    batch.allocate(orderline)

    expect(batch.availableQty).toBe(0)
  })

  it('cannot allocate if skus do not match', () => {
    const batch = new Batch({ ref: 'batch-1', sku: 'LAMP', qty: 2 })
    const orderline = new OrderLine({ orderRef: 'order-1', sku: 'TABLE', qty: 2 })

    batch.allocate(orderline)

    expect(batch.availableQty).toBe(2)
  })

  it('cannot allocate line if already allocated', () => {
    const { batch, orderline } = createBatchAndLine({ sku: 'LAMP', batchQty: 20, lineQty: 2 })

    batch.allocate(orderline)
    batch.allocate(orderline)

    expect(batch.availableQty).toBe(18)
  })

  it('can deallocate an allocated line', () => {
    const { batch, orderline } = createBatchAndLine({ sku: 'LAMP', batchQty: 20, lineQty: 2 })

    batch.allocate(orderline)
    expect(batch.availableQty).toBe(18)
    batch.deallocate(orderline)

    expect(batch.availableQty).toBe(20)
  })

  it('cannot deallocate an unallocated line', () => {
    const { batch, orderline } = createBatchAndLine({ sku: 'LAMP', batchQty: 20, lineQty: 2 })

    batch.deallocate(orderline)

    expect(batch.availableQty).toBe(20)
  })
})
