import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import { getApiUrl, getPort } from '#app/config.mjs'
import { generatePrismaClient } from '#app/adapters/orm/index.mjs'
import * as repository from '#app/adapters/repository.mjs'
import { Batch, OrderLine, allocate, OutOfStock } from '#app/domain/model.mjs'
// import { BatchRecord } from '#app/types.mjs'

const app = express()
app.use(bodyParser.json())
app.use(morgan('dev'))

app.get('/health', (_, res) => {
  res.status(200).send('OK')
})

const isValidSku = function (sku: string, batches: Array<Batch>): boolean {
  return batches.some((batch) => batch.sku === sku)
}

app.post('/allocation', async (req, res) => {
  try {
    const prisma = generatePrismaClient()
    const repo = new repository.PrismaRepository({ prisma })
    const batches = await repo.list()
    const line = new OrderLine({
      orderref: req.body.orderref,
      sku: req.body.sku,
      qty: req.body.qty,
    })
    if (!isValidSku(line.sku, batches)) {
      return res.status(400).json({ message: `Invalid sku: ${line.sku}` })
    }
    const batchref = allocate(line, batches)
    await repo.sync()
    return res.status(201).json({ batchref })
  } catch (e) {
    if (e instanceof OutOfStock) {
      return res.status(400).send({ message: e.message })
    } else {
      return res.status(500).send('Internal Server Error')
    }
  }
})

app.listen(getPort(), () => {
  console.log(`Server listening at ${getApiUrl()}`)
})
