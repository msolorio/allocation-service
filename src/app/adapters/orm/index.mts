import { PrismaClient } from '@prisma/client'
import { Batch, OrderLine } from '#app/domain/model.mjs'
import { PrismaBatch, PrismaOrderLine, OrderLineRecord, OrderLineArgs, PrismaSaveFromDomainClient } from '#app/types.mjs'

const generatePrismaClient = function () {
  const prismaClient = new PrismaClient()
  return prismaClient.$extends({
    name: 'prismaClient',
    result: { // custom methods on query results
      batch: {
        toDomain: {
          compute(prismaBatch: PrismaBatch): () => Batch {
            return () => {
              const domainBatch = new Batch({
                ref: prismaBatch.ref,
                sku: prismaBatch.sku,
                qty: prismaBatch.qty,
                eta: prismaBatch.eta,
              })
              if (!prismaBatch.allocations) {
                domainBatch.allocations = new Set()
                return domainBatch
              }

              domainBatch.allocations = new Set([
                ...prismaBatch.allocations.map((allocation) => allocation.orderline.toDomain())
              ])
              return domainBatch
            }
          }
        },
      },
      orderLine: {
        toDomain: {
          compute(prismaOrderLine: OrderLineArgs): () => OrderLine {
            return () => new OrderLine({
              orderref: prismaOrderLine.orderref,
              sku: prismaOrderLine.sku,
              qty: prismaOrderLine.qty,
            })
          }
        }
      },
    },
    model: { // custom methods on prisma.batch and prisma.orderLine
      batch: {
        async saveFromDomain(prisma: PrismaSaveFromDomainClient, domainBatch: Batch) {
          const batchData = {
            ref: domainBatch.ref,
            sku: domainBatch.sku,
            qty: domainBatch.initialQty,
            eta: domainBatch.eta,
          }

          const prismaBatch = await prisma.batch.upsert({
            where: { ref: domainBatch.ref },
            create: batchData,
            update: batchData,
            include: { allocations: { include: { orderline: true } } }
          })

          for (const orderLine of domainBatch.allocations) {
            const { id: orderlineid } = await prisma.orderLine.saveFromDomain(prisma, orderLine)
            if (orderlineid) {
              const allocationData = { batchid: prismaBatch.id, orderlineid }
              await prisma.allocation.upsert({
                where: { batchid: prismaBatch.id, orderlineid: orderlineid },
                create: allocationData,
                update: allocationData,
              })
            }
          }

          for (const allocation of prismaBatch.allocations) { // remove deleted allocations
            const prismaOrderline = allocation.orderline as PrismaOrderLine
            const domainOrderrefs = new Set([...domainBatch.allocations].map(line => line.orderref))
            if (!domainOrderrefs.has(prismaOrderline.orderref)) {
              await prisma.allocation.delete({
                where: { id: allocation.id }
              })
              await prisma.orderLine.delete({
                where: { id: prismaOrderline.id },
              })
            }
          }
        }
      },
      orderLine: {
        async saveFromDomain(prisma: PrismaSaveFromDomainClient, domainOrderLine: OrderLine): Promise<OrderLineRecord> {
          const orderlineData = {
            orderref: domainOrderLine.orderref,
            sku: domainOrderLine.sku,
            qty: domainOrderLine.qty
          }

          return await prisma.orderLine.upsert({
            where: { orderref_sku: { orderref: domainOrderLine.orderref, sku: domainOrderLine.sku } },
            create: orderlineData,
            update: orderlineData
          })
        }
      }
    }
  })
}

const generatedPrismaClient = generatePrismaClient()

export { generatedPrismaClient, generatePrismaClient }