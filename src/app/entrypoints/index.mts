import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import { getApiUrl, getPort } from '#app/config.mjs'
import { generatedPrismaClient as prisma } from '#app/adapters/orm/index.mjs'
import { PrismaUnitOfWork } from '#app/adapters/unitOfWork.mjs'
import * as services from '#app/services/index.mjs'
import { BadRequestError } from '#app/errors.mjs'

const app = express()
app.use(bodyParser.json())
app.use(morgan('dev'))

app.get('/health', (_, res) => {
  res.status(200).send('OK')
})

app.post('/batch', async (req, res) => {
  try {
    const uow = new PrismaUnitOfWork({ prisma })
    const { ref, sku, qty, eta } = req.body
    const etaDate = eta ? new Date(eta) : null
    await services.addBatch({ ref, sku, qty, eta: etaDate, uow })
    return res.status(201).json({ ref, sku, qty, eta })
  } catch (e) {
    return res.status(500).json({ message: 'Internal Server Error' })
  }
})

app.post('/allocation', async (req, res) => {
  try {
    const uow = new PrismaUnitOfWork({ prisma })
    const { orderref, sku, qty } = req.body
    const batchref = await services.allocate({ orderref, sku, qty, uow })
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
