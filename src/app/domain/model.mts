class OrderLine {
  orderRef: string
  sku: string
  qty: number

  constructor({ orderRef, sku, qty }: OrderLine) {
    this.orderRef = orderRef
    this.sku = sku
    this.qty = qty
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

  private canAllocate(line: OrderLine) {
    return line.sku === this.sku && this.availableQty >= line.qty
  }

  private get allocatedQty() {
    return [...this.allocations].reduce((acc, line) => acc + line.qty, 0)
  }
}

export { Batch, OrderLine }
