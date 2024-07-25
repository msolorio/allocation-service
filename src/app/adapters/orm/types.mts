import { Prisma } from '@prisma/client'
import { Batch, OrderLine } from '#app/domain/model.mjs'

type PrismaOrderLine = Prisma.OrderLineGetPayload<true> & {
  toDomain: () => OrderLine
}

type PrismaBatchPopulated = Prisma.BatchGetPayload<true> & {
  toDomain: () => Batch
  allocations: Array<Prisma.AllocationGetPayload<true> & {
    orderline: PrismaOrderLine
  }>
}


export { PrismaBatchPopulated, PrismaOrderLine }