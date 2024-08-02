import { Batch } from '#app/domain/model.mjs'
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

  get(ref: string): Promise<Batch | null> {
    const batch = [...this.batches].find((b) => b.ref === ref) || null
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

describe('add batch service', () => {
  it('adds a batch to the repository', async () => {
    const repo = new FakeRepository()
    services.addBatch({ ref: 'batch-1', sku: 'NIGHT_STAND', qty: 20, eta: null, repo })
    const batch = await repo.get('batch-1')
    expect(batch).not.toBeNull()
    expect(batch?.ref).toEqual('batch-1')
  })
})

describe('allocate service', () => {
  it('returns batchref allocated to orderline', async () => {
    const repo = new FakeRepository()
    await services.addBatch({ ref: 'batch-1', sku: 'TABLE', qty: 20, eta: null, repo })

    const result = await services.allocate({ orderref: 'order-1', sku: 'TABLE', qty: 2, repo })

    expect(result).toEqual('batch-1')
  })

  it('throws InvalidSku if sku does not exist', async () => {
    const repo = new FakeRepository()
    await services.addBatch({ ref: 'batch-1', sku: 'CHAIR', qty: 20, eta: null, repo })

    await expect(async () => await services.allocate({
      orderref: 'order-1',
      sku: 'NON_EXISTANT_SKU',
      qty: 2,
      repo
    })).rejects.toThrow(services.InvalidSku)
  })

  it('syncs repository after allocation', async () => {
    const repo = new FakeRepository()
    await services.addBatch({ ref: 'batch-1', sku: 'TABLE', qty: 20, repo })

    await services.allocate({ orderref: 'order-1', sku: 'TABLE', qty: 2, repo })

    expect(repo.syncCalled).toBe(true)
  })
})