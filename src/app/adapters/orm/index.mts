import { PrismaClient } from '.prisma/client/default.js'
import { Batch } from '#app/domain/model.mjs'


const prisma = new PrismaClient().$extends({
  name: 'prismaClient',
  result: {
    batch: {
      toDomain: { // custom method on query results
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
    }
  },
  model: {
    batch: {
      async saveFromDomain(domainBatch: Batch) { // custom method on `prisma.batch`
        return await prisma.batch.create({
          data: {
            ref: domainBatch.ref,
            sku: domainBatch.sku,
            qty: domainBatch.initialQty,
            eta: domainBatch.eta
          }
        })
      }
    }
  }
})

export { prisma }