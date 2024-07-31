import { Batch, OrderLine } from '#app/domain/model.mjs'
import { generatePrismaClient } from '#app/adapters/orm/index.mjs'

type OrderLineArgs = {
  orderref: string
  sku: string
  qty: number
}
type PrismaOrderLine = OrderLineArgs & {
  id?: number
  toDomain?: () => OrderLine
}

type OrderLineRecord = OrderLineArgs & { id: number }

type BatchArgs = {
  ref: string
  sku: string
  qty: number
  eta?: Date | null
}

type PrismaBatch = BatchArgs & {
  id?: number
  toDomain?: () => Batch
  allocations?: [{
    orderline: PrismaOrderLine
  }]
}

type BatchRecord = BatchArgs & { id: number }

type AllocationArgs = {
  batchId: number
  orderlineId: number
}

type AllocationRecord = AllocationArgs & { id: number }

type PrismaClientExtended = ReturnType<typeof generatePrismaClient>

export {
  PrismaBatch,
  BatchArgs,
  BatchRecord,
  PrismaOrderLine,
  OrderLineArgs,
  OrderLineRecord,
  AllocationArgs,
  AllocationRecord,
  PrismaClientExtended
}