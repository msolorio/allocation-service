import { PrismaClientExtended, PrismaTransactionalClient } from '#app/types.mjs'
import * as repository from '#app/adapters/repository.mjs'

class PrismaUnitOfWork {
  prisma: PrismaClientExtended
  batches: repository.AbstractRepository

  constructor(prisma: PrismaClientExtended) {
    this.prisma = prisma
    this.batches = new repository.PrismaRepository({ prisma })
  }

  async transaction(callback: () => Promise<void>) {
    this.prisma.$transaction(async (tx: PrismaTransactionalClient) => {
      this.batches = new repository.PrismaRepository({ prisma: tx })
      try {
        await callback()
      } catch (e) {
        console.error(e)
      }
    })
  }

  async commit() {
    await this.batches.sync()
  }
}


export { PrismaUnitOfWork }