class OrderLine {
  constructor(
    public orderRef: string,
    public sku: string,
    public qty: number,
  ) { }
}

class Batch {
  constructor(
    public ref: string,
    public sku: string,
    public qty: number,
    public eta: Date = null,
  ) { }

  allocate(line: OrderLine) {
    this.qty -= line.qty
  }
}

export { Batch, OrderLine }
