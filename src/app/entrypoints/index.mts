import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import { getApiUrl, getPort } from '#app/config.mjs'
import { generatePrismaClient } from '#app/adapters/orm/index.mjs'
import * as repository from '#app/adapters/repository.mjs'
import { OrderLine } from '#app/domain/model.mjs'
import * as services from '#app/services/index.mjs'
import { BadRequestError } from '#app/errors.mjs'

const app = express()
app.use(bodyParser.json())
app.use(morgan('dev'))

app.get('/health', (_, res) => {
  res.status(200).send('OK')
})

app.post('/allocation', async (req, res) => {
  try {
    const repo = new repository.PrismaRepository({ prisma: generatePrismaClient() })
    const line = new OrderLine({
      orderref: req.body.orderref,
      sku: req.body.sku,
      qty: req.body.qty,
    })
    const batchref = await services.allocate(line, repo)
    return res.status(201).json({ batchref })
  } catch (e) {
    if (e instanceof BadRequestError) {
      return res.status(400).json({ message: e.message })
    } else {
      return res.status(500).json({ message: 'Internal Server Error' })
    }
  }
})

app.listen(getPort(), () => {
  console.log(`Server listening at ${getApiUrl()}`)
})
