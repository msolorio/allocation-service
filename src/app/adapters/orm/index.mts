import { PrismaClient } from '.prisma/client/default.js'
import { Batch, OrderLine } from '#app/domain/model.mjs'


const prisma = new PrismaClient().$extends({
  name: 'prismaClient',
  result: { // custom methods on query results
    batch: {
      toDomain: {
        compute(prismaBatch) {
          return () => ({
            ref: prismaBatch.ref,
            sku: prismaBatch.sku,
            initialQty: prismaBatch.qty,
            eta: prismaBatch.eta,
            allocations: new Set(),
          })
        }
      }
    },
    orderLine: {
      toDomain: {
        compute(prismaOrderLine) {
          return () => ({
            orderRef: prismaOrderLine.orderref,
            sku: prismaOrderLine.sku,
            qty: prismaOrderLine.qty,
          })
        }
      }
    }
  },
  model: {
    batch: {
      async saveFromDomain(domainBatch: Batch) {
        return await prisma.batch.create({
          data: {
            ref: domainBatch.ref,
            sku: domainBatch.sku,
            qty: domainBatch.initialQty,
            eta: domainBatch.eta
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

export { prisma }