import { Prisma } from '@prisma/client'
import { Batch, OrderLine } from '#app/domain/model.mjs'
import { generatePrismaClient } from '#app/adapters/orm/index.mjs'

type PrismaOrderLine = Prisma.OrderLineGetPayload<true> & {
  toDomain: () => OrderLine
}

type PrismaBatch = Prisma.BatchGetPayload<true> & {
  toDomain: () => Batch
  allocations?: Array<Prisma.AllocationGetPayload<true> & {
    orderline: PrismaOrderLine
  }>
}

type PrismaClientExtended = ReturnType<typeof generatePrismaClient>

export { PrismaBatch, PrismaOrderLine, PrismaClientExtended }