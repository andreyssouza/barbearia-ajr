require('dotenv').config()

const express = require('express')
const cors = require('cors')

const { initDb } = require('./database/db')
const authRoutes = require('./routes/auth')
const appointmentRoutes = require('./routes/appointments')
const barbershopRoutes = require('./routes/barbershop')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/barbershop', barbershopRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Erro interno do servidor' })
})

async function start() {
  await initDb()
  app.listen(PORT, () => {
    console.log(`🚀  Backend rodando em http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error('Falha ao iniciar o servidor:', err)
  process.exit(1)
})
