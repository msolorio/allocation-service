import { PrismaClientExtended, PrismaTransactionalClient } from '#app/types.mjs'
import * as repository from '#app/adapters/repository.mjs'

interface AbstractUnitOfWork {
  batches: repository.AbstractRepository
  transaction(transactionalWork: () => Promise<any>): Promise<any>
  commit(): Promise<void>
}

class PrismaUnitOfWork implements AbstractUnitOfWork {
  prisma: PrismaClientExtended
  batches: repository.AbstractRepository
  nonTransactionalBatches: repository.AbstractRepository

  constructor({ prisma }: { prisma: PrismaClientExtended }) {
    this.prisma = prisma
    this.nonTransactionalBatches = new repository.PrismaRepository({ prisma: this.prisma })
    this.batches = this.nonTransactionalBatches
  }

  async transaction(transactionalWork: () => Promise<any>): Promise<any> {
    return await this.prisma.$transaction(async (tx: PrismaTransactionalClient) => {
      this.batches = new repository.PrismaRepository({ prisma: tx })

      const result = await transactionalWork()
      this.batches = this.nonTransactionalBatches

      return result
    })
  }

  async commit(): Promise<void> {
    await this.batches.sync()
  }
}


export { AbstractUnitOfWork, PrismaUnitOfWork }