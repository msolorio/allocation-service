import { Batch, OrderLine, allocate, OutOfStock, } from '#app/domain/model.mjs'

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)
const later = new Date(today)
later.setDate(today.getDate() + 30)


describe('allocate', () => {
  it('prefers in-stock batches to shipments', () => {
    const inStockBatch = new Batch({ ref: 'in-stock-batch', sku: 'TABLE', qty: 20, eta: null })
    const ShipmentBatch = new Batch({ ref: 'shipment-batch', sku: 'TABLE', qty: 20, eta: tomorrow })
    const orderline = new OrderLine({ orderRef: 'order-1', sku: 'TABLE', qty: 2 })

    allocate(orderline, [ShipmentBatch, inStockBatch])

    expect(inStockBatch.availableQty).toBe(18)
    expect(ShipmentBatch.availableQty).toBe(20)
  })

  it('prefers earlier batches', () => {
    const earliest = new Batch({ ref: 'earliest-batch', sku: 'TABLE', qty: 20, eta: today })
    const medium = new Batch({ ref: 'medium-batch', sku: 'TABLE', qty: 20, eta: tomorrow })
    const latest = new Batch({ ref: 'latest-batch', sku: 'TABLE', qty: 20, eta: later })
    const orderline = new OrderLine({ orderRef: 'order-1', sku: 'TABLE', qty: 2 })

    allocate(orderline, [medium, earliest, latest])

    expect(earliest.availableQty).toBe(18)
    expect(medium.availableQty).toBe(20)
    expect(latest.availableQty).toBe(20)
  })

  it('returns allocated batch ref', () => {
    const batch = new Batch({ ref: 'batch-1', sku: 'TABLE', qty: 20 })
    const orderline = new OrderLine({ orderRef: 'order-1', sku: 'TABLE', qty: 2 })

    const result = allocate(orderline, [batch])

    expect(result).toBe('batch-1')
  })

  it('raises out of stock error if cannot allocate', () => {
    const batch = new Batch({ ref: 'batch-1', sku: 'TABLE', qty: 2 })
    const orderline = new OrderLine({ orderRef: 'order-1', sku: 'TABLE', qty: 3 })

    expect(() => allocate(orderline, [batch])).toThrow(OutOfStock)
  })
})

