import { BatchArgs, OrderLineArgs } from '#app/types.mjs'
import { OutOfStock } from '#app/errors.mjs'

class OrderLine {
  readonly orderref: string
  sku: string
  qty: number

  constructor({ orderref, sku, qty }: OrderLineArgs) {
    this.orderref = orderref
    this.sku = sku
    this.qty = qty
  }

  equals(other: OrderLine): boolean {
    return (
      this.orderref === other.orderref
      && this.sku === other.sku
      && this.qty === other.qty
    )
  }
}

class Batch {
  readonly ref: string
  sku: string
  eta: Date | null
  initialQty: number
  allocations: Set<OrderLine>

  constructor({ ref, sku, qty, eta = null }: BatchArgs) {
    this.ref = ref
    this.sku = sku
    this.initialQty = qty
    this.eta = eta
    this.allocations = new Set()
  }

  get availableQty(): number {
    return this.initialQty - this.allocatedQty
  }

  allocate(line: OrderLine): void {
    if (this.canAllocate(line)) {
      this.allocations.add(line)
    }
  }

  deallocate({ orderref, sku }: { orderref: string, sku: string }): void {
    if (this.canDeallocate({ orderref, sku })) {
      const updatedAllocations = [...this.allocations].filter(line => line.orderref !== orderref)
      this.allocations = new Set(updatedAllocations)
    }
  }

  equals(other: Batch): boolean {
    return this.ref === other.ref
  }

  canDeallocate({ orderref, sku }: { orderref: string, sku: string }): boolean {
    const orderrefs = new Set([...this.allocations].map(line => line.orderref))
    return orderrefs.has(orderref) && this.sku === sku
  }

  canAllocate(line: OrderLine): boolean {
    return line.sku === this.sku && this.availableQty >= line.qty
  }

  private get allocatedQty(): number {
    return [...this.allocations].reduce((acc, line) => acc + line.qty, 0)
  }
}

const allocate = function (orderline: OrderLine, batches: Array<Batch>): string {
  const sortedBatches = batches.sort((a, b) => {
    if (a.eta === null) {
      return -1
    } else if (b.eta === null) {
      return 1
    } else {
      return a.eta.getTime() - b.eta.getTime()
    }
  })

  for (const batch of sortedBatches) {
    if (batch.canAllocate(orderline)) {
      batch.allocate(orderline)
      return batch.ref
    }
  }

  throw new OutOfStock(`Out of stock for sku: ${orderline.sku}`)
}

const deallocate = function ({ orderref, sku, batches }: { orderref: string, sku: string, batches: Array<Batch> }) {
  batches.forEach(batch => {
    if (batch.canDeallocate({ orderref, sku })) {
      batch.deallocate({ orderref, sku })
    }
  })
}

export { Batch, OrderLine, allocate, OutOfStock, deallocate }
