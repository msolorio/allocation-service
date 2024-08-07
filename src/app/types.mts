import { Batch, OrderLine } from '#app/domain/model.mjs'
import { generatePrismaClient } from '#app/adapters/orm/index.mjs'
import { PrismaClient } from '@prisma/client'

type OrderLineArgs = {
  orderref: string
  sku: string
  qty: number
}

type OrderLineRecord = OrderLineArgs & { id: number }
type PrismaOrderLine = OrderLineRecord & { toDomain: () => OrderLine }


type BatchArgs = {
  ref: string
  sku: string
  qty: number
  eta?: Date | null
}

type BatchRecord = BatchArgs & { id: number }

type PrismaBatch = BatchRecord & {
  toDomain?: () => Batch
  allocations?: [{
    orderline: PrismaOrderLine
  }]
}


type AllocationArgs = {
  batchId: number
  orderlineId: number
}

type AllocationRecord = AllocationArgs & { id: number }

type PrismaClientExtended = ReturnType<typeof generatePrismaClient>

type PrismaTransactionalClient = Parameters<
  Parameters<
    PrismaClientExtended['$transaction']
  >[0]
>[0]

type RepositoryPrismaClient = PrismaClientExtended | PrismaTransactionalClient

type PrismaSaveFromDomainClient = PrismaClient & {
  batch: {
    saveFromDomain: (prisma: PrismaSaveFromDomainClient, domainBatch: Batch) => Promise<void>
  }
  orderLine: {
    saveFromDomain: (prisma: PrismaSaveFromDomainClient, domainOrderLine: OrderLine) => Promise<OrderLineRecord>
  }
}

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
  PrismaSaveFromDomainClient,
}