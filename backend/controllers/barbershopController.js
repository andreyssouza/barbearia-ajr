const { getDb } = require('../database/db')

/* Horários disponíveis: 08:00–19:30 a cada 30 min */
function buildSlots(booked) {
  const slots = []
  for (let h = 8; h < 20; h++) {
    for (const m of ['00', '30']) {
      const time = `${String(h).padStart(2, '0')}:${m}`
      slots.push({ time, available: !booked.includes(time) })
    }
  }
  return slots
}

function getPublicInfo(req, res) {
  const shop = getDb()
    .prepare('SELECT id, name, slug, whatsapp FROM barbershops WHERE slug = ?')
    .get(req.params.slug)

  if (!shop) return res.status(404).json({ error: 'Barbearia não encontrada' })
  res.json(shop)
}

function getSlots(req, res) {
  const { date } = req.query
  if (!date) return res.status(400).json({ error: 'Parâmetro "date" é obrigatório (YYYY-MM-DD)' })

  const db = getDb()
  const shop = db.prepare('SELECT id FROM barbershops WHERE slug = ?').get(req.params.slug)
  if (!shop) return res.status(404).json({ error: 'Barbearia não encontrada' })

  const booked = db
    .prepare('SELECT time FROM appointments WHERE barbershop_id = ? AND date = ?')
    .all(shop.id, date)
    .map((r) => r.time)

  res.json(buildSlots(booked))
}

function createPublicAppointment(req, res) {
  const { client_name, client_phone, service, date, time } = req.body

  if (!client_name || !client_phone || !service || !date || !time) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
  }

  const db = getDb()
  const shop = db.prepare('SELECT id FROM barbershops WHERE slug = ?').get(req.params.slug)
  if (!shop) return res.status(404).json({ error: 'Barbearia não encontrada' })

  if (db.prepare('SELECT id FROM appointments WHERE barbershop_id=? AND date=? AND time=?').get(shop.id, date, time)) {
    return res.status(409).json({ error: 'Este horário já está reservado. Escolha outro.' })
  }

  const { lastInsertRowid: id } = db
    .prepare('INSERT INTO appointments (barbershop_id,client_name,client_phone,service,date,time) VALUES (?,?,?,?,?,?)')
    .run(shop.id, client_name, client_phone, service, date, time)

  res.status(201).json({
    message: 'Agendamento criado com sucesso!',
    appointment: { id, client_name, client_phone, service, date, time },
  })
}

module.exports = { getPublicInfo, getSlots, createPublicAppointment }
