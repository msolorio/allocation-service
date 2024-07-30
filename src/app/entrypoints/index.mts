import express from 'express'
import { getApiUrl, getPort } from '#app/config.mjs'

const app = express()

app.get('/health', (_, res) => {
  res.status(200).send('OK')
})

// app.post('/allocation', async (_, res) => {
//   res.status(201).json({ batchref: 'batch1' })
// })

app.listen(getPort(), () => {
  console.log(`Server listening at ${getApiUrl()}`)
})
