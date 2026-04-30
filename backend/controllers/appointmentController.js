const { getDb } = require('../database/db')

function list(req, res) {
  const db = getDb()
  const { date } = req.query
  const shopId = req.barbershop.id

  const base = 'SELECT * FROM appointments WHERE barbershop_id = ?'
  const appointments = date
    ? db.prepare(base + ' AND date = ? ORDER BY time ASC').all(shopId, date)
    : db.prepare(base + ' ORDER BY date ASC, time ASC').all(shopId)

  res.json(appointments)
}

function create(req, res) {
  const { client_name, client_phone, service, date, time } = req.body
  const shopId = req.barbershop.id

  if (!client_name || !client_phone || !service || !date || !time) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
  }

  const db = getDb()

  if (db.prepare('SELECT id FROM appointments WHERE barbershop_id=? AND date=? AND time=?').get(shopId, date, time)) {
    return res.status(409).json({ error: 'Este horário já está reservado' })
  }

  const { lastInsertRowid: id } = db
    .prepare('INSERT INTO appointments (barbershop_id,client_name,client_phone,service,date,time) VALUES (?,?,?,?,?,?)')
    .run(shopId, client_name, client_phone, service, date, time)

  res.status(201).json({
    message: 'Agendamento criado com sucesso',
    appointment: { id, barbershop_id: shopId, client_name, client_phone, service, date, time },
  })
}

function remove(req, res) {
  const { id } = req.params
  const db = getDb()

  const row = db.prepare('SELECT id FROM appointments WHERE id=? AND barbershop_id=?').get(id, req.barbershop.id)
  if (!row) return res.status(404).json({ error: 'Agendamento não encontrado' })

  db.prepare('DELETE FROM appointments WHERE id=?').run(id)
  res.json({ message: 'Agendamento excluído com sucesso' })
}

module.exports = { list, create, remove }
