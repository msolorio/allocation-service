import { Batch } from '#app/domain/model.mjs'
import { PrismaClientExtended } from '#app/adapters/orm/types.mjs'

class PrismaRepository {
  prisma: PrismaClientExtended

  constructor({ prisma }) {
    this.prisma = prisma
  }

  async add(batch: Batch) {
    await this.prisma.batch.saveFromDomain(batch)
  }

  async get(ref: string) {
    return (await this.prisma.batch.findUnique({
      where: { ref },
      include: { allocations: { include: { orderline: true } } }
    })).toDomain()
  }
}

export { PrismaRepository }