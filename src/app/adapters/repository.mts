import { Batch } from '#app/domain/model.mjs'
import { PrismaClientExtended } from '#app/types.mjs'

interface AbstractRepository {
  add(batch: Batch): Promise<void>
  get(ref: string): Promise<Batch>
  list(): Promise<Array<Batch>>
}

class PrismaRepository implements AbstractRepository {
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
    const prismaBatches: Array<{ toDomain: () => Batch }> = await this.prisma.batch.findMany({
      include: { allocations: { include: { orderline: true } } }
    })

    return prismaBatches.map((prismaBatch) => prismaBatch.toDomain())
  }
}

export { PrismaRepository }