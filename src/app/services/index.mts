import * as domain from '#app/domain/model.mjs'
import { AbstractUnitOfWork } from '#app/adapters/unitOfWork.mjs'
import { InvalidSku } from '#app/errors.mjs'
import { BatchArgs, OrderLineArgs } from '#app/types.mjs'

async function addBatch({ ref, sku, qty, eta = null, uow }:
  BatchArgs & { uow: AbstractUnitOfWork }
): Promise<void> {
  await uow.transaction(async () => {
    const batch = new domain.Batch({ ref, sku, qty, eta })
    uow.batches.add(batch)
    await uow.commit()
  })
}

const isValidSku = function (sku: string, batches: Array<domain.Batch>): boolean {
  return batches.some((batch) => batch.sku === sku)
}

async function allocate({ orderref, sku, qty, uow }:
  OrderLineArgs & { uow: AbstractUnitOfWork }
): Promise<string> {
  return await uow.transaction(async () => {
    const line = new domain.OrderLine({ orderref, sku, qty })
    const batches = await uow.batches.list()
    if (!isValidSku(line.sku, batches)) {
      throw new InvalidSku(`Invalid sku: ${line.sku}`)
    }
    const batchref = domain.allocate(line, batches)
    await uow.commit()

    return batchref
  })
}

export { addBatch, allocate, InvalidSku }