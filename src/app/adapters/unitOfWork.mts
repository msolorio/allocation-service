import { PrismaClientExtended, PrismaTransactionalClient } from '#app/types.mjs'
import * as repository from '#app/adapters/repository.mjs'

class PrismaUnitOfWork {
  prisma: PrismaClientExtended
  batches: repository.AbstractRepository
  nonTransactionalBatches: repository.AbstractRepository

  constructor(prisma: PrismaClientExtended) {
    this.prisma = prisma
    this.nonTransactionalBatches = new repository.PrismaRepository({ prisma: this.prisma })
    this.batches = this.nonTransactionalBatches
  }

  async transaction(transactionalWork: () => Promise<void>) {
    await this.prisma.$transaction(async (tx: PrismaTransactionalClient) => {
      this.batches = new repository.PrismaRepository({ prisma: tx })
      try {
        await transactionalWork()
      } catch (e) {
        console.error(e)
      }
      this.batches = this.nonTransactionalBatches
    })
  }

  async commit() {
    await this.batches.sync()
  }
}


export { PrismaUnitOfWork }