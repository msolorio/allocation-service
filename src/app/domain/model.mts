type OrderLineArgs = {
  orderRef: string
  sku: string
  qty: number
}

class OrderLine {
  orderRef: string
  sku: string
  qty: number

  constructor({ orderRef, sku, qty }: OrderLineArgs) {
    this.orderRef = orderRef
    this.sku = sku
    this.qty = qty
  }

  equals(other: OrderLine) {
    return (
      this.orderRef === other.orderRef
      && this.sku === other.sku
      && this.qty === other.qty
    )
  }
}

type batchArgs = {
  ref: string
  sku: string
  qty: number
  eta?: Date | null
}

class Batch {
  ref: string
  sku: string
  eta: Date | null
  private initialQty: number
  private allocations: Set<OrderLine>

  constructor({ ref, sku, qty, eta = null }: batchArgs) {
    this.ref = ref
    this.sku = sku
    this.initialQty = qty
    this.eta = eta
    this.allocations = new Set()
  }

  get availableQty() {
    return this.initialQty - this.allocatedQty
  }

  allocate(line: OrderLine) {
    if (this.canAllocate(line)) {
      this.allocations.add(line)
    }
  }

  deallocate(line: OrderLine) {
    this.allocations.delete(line)
  }

  equals(other: Batch) {
    return this.ref === other.ref
  }

  canAllocate(line: OrderLine) {
    return line.sku === this.sku && this.availableQty >= line.qty
  }

  private get allocatedQty() {
    return [...this.allocations].reduce((acc, line) => acc + line.qty, 0)
  }
}

class OutOfStock extends Error {
  constructor() {
    super('Out of stock')
    this.name = 'OutOfStock'
  }
}

function allocate(orderline: OrderLine, batches: Array<Batch>) {
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

  throw new OutOfStock()
}

export { Batch, OrderLine, allocate, OutOfStock, }
