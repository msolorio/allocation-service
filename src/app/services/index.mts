import * as domain from '#app/domain/model.mjs'
import { AbstractRepository } from '#app/adapters/repository.mjs'
import { InvalidSku } from '#app/errors.mjs'
import { BatchArgs, OrderLineArgs } from '#app/types.mjs'

async function addBatch({ ref, sku, qty, eta = null, repo }:
  BatchArgs & { repo: AbstractRepository }
): Promise<void> {
  const batch = new domain.Batch({ ref, sku, qty, eta })
  repo.add(batch)
  repo.sync()
}

const isValidSku = function (sku: string, batches: Array<domain.Batch>): boolean {
  return batches.some((batch) => batch.sku === sku)
}

async function allocate({ orderref, sku, qty, repo }:
  OrderLineArgs & { repo: AbstractRepository }
): Promise<string> {
  const line = new domain.OrderLine({ orderref, sku, qty })
  const batches = await repo.list()
  if (!isValidSku(line.sku, batches)) {
    throw new InvalidSku(`Invalid sku: ${line.sku}`)
  }
  const batchref = domain.allocate(line, batches)
  repo.sync()

  return batchref
}

export { addBatch, allocate, InvalidSku }