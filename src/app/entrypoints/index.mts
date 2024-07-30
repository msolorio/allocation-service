import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import { getApiUrl, getPort } from '#app/config.mjs'
import { generatePrismaClient } from '#app/adapters/orm/index.mjs'
import * as repository from '#app/adapters/repository.mjs'
import { OrderLine, allocate } from '#app/domain/model.mjs'

const app = express()
app.use(bodyParser.json())
app.use(morgan('dev'))

app.get('/health', (_, res) => {
  res.status(200).send('OK')
})

app.post('/allocation', async (req, res) => {
  const repo = new repository.PrismaRepository({ prisma: generatePrismaClient() })
  const batches = await repo.list()
  const line = new OrderLine({
    orderref: req.body.orderref,
    sku: req.body.sku,
    qty: req.body.qty,
  })

  const batchref = allocate(line, batches)

  res.status(201).json({ batchref })
})

app.listen(getPort(), () => {
  console.log(`Server listening at ${getApiUrl()}`)
})
