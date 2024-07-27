import { Prisma } from '@prisma/client'
import { Batch, OrderLine } from '#app/domain/model.mjs'
import { generatePrismaClient } from '#app/adapters/orm/index.mjs'

type PrismaOrderLine = Prisma.OrderLineGetPayload<true> & {
  toDomain: () => OrderLine
}

type OrderLineArgs = {
  orderref: string
  sku: string
  qty: number
}

type OrderLineRecord = OrderLineArgs & { id: number }

type PrismaBatch = Prisma.BatchGetPayload<true> & {
  toDomain: () => Batch
  allocations?: Array<Prisma.AllocationGetPayload<true> & {
    orderline: PrismaOrderLine
  }>
}

type BatchArgs = {
  ref: string
  sku: string
  qty: number
  eta?: Date | null
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