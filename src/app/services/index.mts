import * as domain from '#app/domain/model.mjs'
import { AbstractRepository } from '#app/adapters/repository.mjs'
import { InvalidSku } from '#app/errors.mjs'

const isValidSku = function (sku: string, batches: Array<domain.Batch>): boolean {
  return batches.some((batch) => batch.sku === sku)
}

async function allocate(line: domain.OrderLine, repo: AbstractRepository): Promise<string> {
  const batches = await repo.list()
  if (!isValidSku(line.sku, batches)) {
    throw new InvalidSku(`Invalid sku: ${line.sku}`)
  }
  const batchref = domain.allocate(line, batches)
  repo.sync()

  return batchref
}

export { allocate, InvalidSku }