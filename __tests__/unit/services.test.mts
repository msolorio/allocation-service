import { Batch } from '#app/domain/model.mjs'
import { AbstractRepository } from '#app/adapters/repository.mjs'
import * as services from '#app/services/index.mjs'

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)
const later = new Date(today)
later.setDate(today.getDate() + 30)

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

class FakeUnitOfWork {
  batches: FakeRepository
  commited: boolean

  constructor() {
    this.batches = new FakeRepository()
    this.commited = false
  }

  async transaction(transactionalWork: () => Promise<any>): Promise<any> {
    return await transactionalWork()
  }

  async commit(): Promise<void> {
    this.commited = true
  }
}

describe('add batch service', () => {
  it('adds a batch to the repository', async () => {
    const uow = new FakeUnitOfWork()
    services.addBatch({ ref: 'batch-1', sku: 'NIGHT_STAND', qty: 20, eta: null, uow })
    const batch = await uow.batches.get('batch-1')
    expect(batch).not.toBeNull()
    expect(batch?.ref).toEqual('batch-1')
    expect(uow.commited).toBe(true)
  })
})

describe('allocate service', () => {
  it('returns batchref allocated to', async () => {
    const uow = new FakeUnitOfWork()
    await services.addBatch({ ref: 'batch-1', sku: 'TABLE', qty: 20, eta: null, uow })

    const result = await services.allocate({ orderref: 'order-1', sku: 'TABLE', qty: 2, uow })

    expect(result).toEqual('batch-1')
  })

  it('throws InvalidSku if sku does not exist', async () => {
    const uow = new FakeUnitOfWork()
    await services.addBatch({ ref: 'batch-1', sku: 'CHAIR', qty: 20, eta: null, uow })

    await expect(async () => await services.allocate({
      orderref: 'order-1',
      sku: 'NON_EXISTANT_SKU',
      qty: 2,
      uow
    })).rejects.toThrow(services.InvalidSku)
  })

  it('commits uow after allocation', async () => {
    const uow = new FakeUnitOfWork()
    await services.addBatch({ ref: 'batch-1', sku: 'TABLE', qty: 20, eta: null, uow })
    await services.allocate({ orderref: 'order-1', sku: 'TABLE', qty: 2, uow })

    expect(uow.commited).toBe(true)
  })

  it('commits uow after adding batch', async () => {
    const uow = new FakeUnitOfWork()
    await services.addBatch({ ref: 'batch-1', sku: 'TABLE', qty: 20, eta: null, uow })

    expect(uow.commited).toBe(true)
  })
})

describe('deallocate service', () => {
  it('deallocates from list of batches', async () => {
    const uow = new FakeUnitOfWork()
    await services.addBatch({ ref: 'batch-1', sku: 'LAMP', qty: 20, eta: null, uow })
    await services.addBatch({ ref: 'batch-2', sku: 'LAMP', qty: 20, eta: today, uow })

    await services.allocate({ orderref: 'order-1', sku: 'LAMP', qty: 2, uow })
    await services.allocate({ orderref: 'order-2', sku: 'LAMP', qty: 2, uow })
    let batch1 = await uow.batches.get('batch-1')
    expect(batch1?.availableQty).toBe(16)

    services.deallocate({ orderref: 'order-1', sku: 'LAMP', uow })

    batch1 = await uow.batches.get('batch-1')
    const batch2 = await uow.batches.get('batch-2')

    expect(batch1?.availableQty).toBe(18)
    expect(batch2?.availableQty).toBe(20)
  })
})