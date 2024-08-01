import { OrderLine, Batch } from '#app/domain/model.mjs'
import { AbstractRepository } from '#app/adapters/repository.mjs'
import * as services from '#app/services/index.mjs'

class FakeRepository implements AbstractRepository {
  private batches: Set<Batch>
  syncCalled: boolean

  constructor(batches: Array<Batch> = []) {
    this.batches = new Set(batches)
    this.syncCalled = false
  }

  add(batch: Batch): void {
    this.batches.add(batch)
  }

  get(ref: string): Promise<Batch> {
    const batch = [...this.batches].find((b) => b.ref === ref)
    return Promise.resolve(batch)
  }

  list(): Promise<Array<Batch>> {
    return Promise.resolve([...this.batches])
  }

  sync(): Promise<void> {
    this.syncCalled = true
    return Promise.resolve()
  }
}

describe('allocate service', () => {
  it('returns batchref allocated to orderline', async () => {
    const line = new OrderLine({ orderref: 'order-1', sku: 'TABLE', qty: 2 })
    const batch = new Batch({ ref: 'batch-1', sku: 'TABLE', qty: 20 })
    const repo = new FakeRepository([batch])

    const result = await services.allocate(line, repo)

    expect(result).toEqual('batch-1')
  })

  it('throws InvalidSku if sku does not exist', async () => {
    const line = new OrderLine({ orderref: 'order-1', sku: 'NON_EXISTANT_SKU', qty: 2 })
    const batch = new Batch({ ref: 'batch-1', sku: 'CHAIR', qty: 20 })
    const repo = new FakeRepository([batch])

    await expect(async () => await services.allocate(line, repo)).rejects.toThrow(services.InvalidSku)
  })

  it('syncs repository after allocation', async () => {
    const line = new OrderLine({ orderref: 'order-1', sku: 'TABLE', qty: 2 })
    const batch = new Batch({ ref: 'batch-1', sku: 'TABLE', qty: 20 })
    const repo = new FakeRepository([batch])

    await services.allocate(line, repo)

    expect(repo.syncCalled).toBe(true)
  })
})