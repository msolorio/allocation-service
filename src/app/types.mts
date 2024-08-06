import { Batch, OrderLine } from '#app/domain/model.mjs'


type OrderLineArgs = {
  orderref: string
  sku: string
  qty: number
}
type PrismaOrderLine = OrderLineArgs & {
  id?: number
  toDomain: () => OrderLine
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


type PrismaClientExtended = any // temporarily setting until fixed

interface AnyFunction {
  (...args: Array<any>): any
}

type PrismaTransactionalClient = Parameters<
  AnyFunction & Parameters< // prisma doesn't infer the type of the callback
    PrismaClientExtended['$transaction']
  >[0]
>[0]

type RepositoryPrismaClient = PrismaClientExtended | PrismaTransactionalClient

export {
  PrismaBatch,
  BatchArgs,
  BatchRecord,
  PrismaOrderLine,
  OrderLineArgs,
  OrderLineRecord,
  AllocationArgs,
  AllocationRecord,
  PrismaClientExtended,
  PrismaTransactionalClient,
  RepositoryPrismaClient,
}