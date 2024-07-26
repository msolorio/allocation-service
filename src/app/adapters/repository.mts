// import { PrismaClient } from '@prisma/client'
import { Batch } from '#app/domain/model.mjs'

class PrismaRepository {
  transaction: any

  constructor({ transaction }) {
    this.transaction = transaction
  }

  async add(batch: Batch) {
    await this.transaction.batch.saveFromDomain(batch)
  }
}

export { PrismaRepository }