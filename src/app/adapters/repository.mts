import { Batch } from '#app/domain/model.mjs'
import { PrismaClientExtended } from '#app/types.mjs'

interface AbstractRepository {
  add(batch: Batch): void
  get(ref: string): Promise<Batch>
  list(): Promise<Array<Batch>>
}

class PrismaRepository implements AbstractRepository {
  private prisma: PrismaClientExtended
  private seen: Set<Batch>

  constructor({ prisma }: { prisma: PrismaClientExtended }) {
    this.prisma = prisma
    this.seen = new Set()
  }

  add(batch: Batch): void {
    this.seen.add(batch)
  }

  async get(ref: string): Promise<Batch> {
    const batch = (await this.prisma.batch.findUnique({
      where: { ref },
      include: { allocations: { include: { orderline: true } } }
    })).toDomain()
    this.seen.add(batch)

    return batch
  }

  async list(): Promise<Array<Batch>> {
    const prismaBatches: Array<{ toDomain: () => Batch }> = await this.prisma.batch.findMany({
      include: { allocations: { include: { orderline: true } } }
    })
    const batches = prismaBatches.map((prismaBatch) => prismaBatch.toDomain())
    batches.forEach((batch) => this.seen.add(batch))

    return batches
  }

  async sync(): Promise<void> {
    for (const batch of this.seen) {
      await this.save(batch)
    }
  }

  private async save(batch: Batch) {
    await this.prisma.batch.saveFromDomain(batch)
  }
}

export { PrismaRepository }