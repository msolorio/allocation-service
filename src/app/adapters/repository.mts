import { Batch } from '#app/domain/model.mjs'
import { PrismaClientExtended } from '#app/adapters/orm/types.mjs'

class PrismaRepository {
  prisma: PrismaClientExtended

  constructor({ prisma }: { prisma: PrismaClientExtended }) {
    this.prisma = prisma
  }

  async add(batch: Batch): Promise<void> {
    await this.prisma.batch.saveFromDomain(batch)
  }

  async get(ref: string): Promise<Batch> {
    return (await this.prisma.batch.findUnique({
      where: { ref },
      include: { allocations: { include: { orderline: true } } }
    })).toDomain()
  }

  async list(): Promise<Array<Batch>> {
    return (await this.prisma.batch.findMany({
      include: { allocations: { include: { orderline: true } } }
    })).map((prismaBatch) => prismaBatch.toDomain())
  }
}

export { PrismaRepository }