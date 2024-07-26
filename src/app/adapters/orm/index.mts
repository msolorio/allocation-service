import { PrismaClient } from '.prisma/client/default.js'
import { Batch, OrderLine } from '#app/domain/model.mjs'
import { PrismaBatch, PrismaOrderLine } from '#app/adapters/orm/types.mjs'

const generatePrismaClient = function () {
  const prisma = new PrismaClient().$extends({
    name: 'prismaClient',
    result: { // custom methods on query results
      batch: {
        toDomain: {
          compute(prismaBatch: PrismaBatch) {
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
          compute(prismaOrderLine: PrismaOrderLine) {
            return () => new OrderLine({
              orderRef: prismaOrderLine.orderref,
              sku: prismaOrderLine.sku,
              qty: prismaOrderLine.qty,
            })
          }
        }
      },
    },
    model: { // custom methods on prisma.batch and prisma.orderLine
      batch: {
        async saveFromDomain(domainBatch: Batch) {
          return await prisma.batch.create({
            data: {
              ref: domainBatch.ref,
              sku: domainBatch.sku,
              qty: domainBatch.initialQty,
              eta: domainBatch.eta,
              allocations: {
                create: [...domainBatch.allocations].map((orderLine) => ({
                  orderline: {
                    create: {
                      orderref: orderLine.orderRef,
                      sku: orderLine.sku,
                      qty: orderLine.qty
                    }
                  }
                }))
              }
            }
          })
        }
      },
      orderLine: {
        async saveFromDomain(domainOrderLine: OrderLine) {
          return await prisma.orderLine.create({
            data: {
              orderref: domainOrderLine.orderRef,
              sku: domainOrderLine.sku,
              qty: domainOrderLine.qty
            }
          })
        }
      }
    }
  })

  return prisma
}

export { generatePrismaClient }