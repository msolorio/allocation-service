import { PrismaClient } from '@prisma/client'
import { Batch, OrderLine } from '#app/domain/model.mjs'
import { PrismaBatch, PrismaOrderLine, OrderLineArgs, RepositoryPrismaClient } from '#app/types.mjs'

const generatePrismaClient = function () {
  const prismaClient = new PrismaClient()
  const prisma = prismaClient.$extends({
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
        async saveFromDomain(prisma: RepositoryPrismaClient, domainBatch: Batch) {
          const batchData = {
            ref: domainBatch.ref,
            sku: domainBatch.sku,
            qty: domainBatch.initialQty,
            eta: domainBatch.eta,
          }

          const { id: batchid } = await prisma.batch.upsert({
            where: { ref: domainBatch.ref },
            create: batchData,
            update: batchData,
          })

          for (const orderLine of domainBatch.allocations) {
            const { id: orderlineid } = await prisma.orderLine.saveFromDomain(prisma, orderLine)
            if (orderlineid) {
              const allocationData = { batchid, orderlineid }
              await prisma.allocation.upsert({
                where: { batchid: batchid, orderlineid: orderlineid },
                create: allocationData,
                update: allocationData,
              })
            }
          }
        }
      },
      orderLine: {
        async saveFromDomain(prisma: RepositoryPrismaClient, domainOrderLine: OrderLine): Promise<PrismaOrderLine> {
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

  return prisma
}

const generatedPrismaClient = generatePrismaClient()

export { generatedPrismaClient, generatePrismaClient }