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
  qty: number
  eta: Date | null

  constructor({ ref, sku, qty, eta = null }: batchArgs) {
    this.ref = ref
    this.sku = sku
    this.qty = qty
    this.eta = eta
  }

  allocate(line: OrderLine) {
    if (line.qty > this.qty) {
      return
    }
    this.qty -= line.qty
  }
}

export { Batch, OrderLine }
