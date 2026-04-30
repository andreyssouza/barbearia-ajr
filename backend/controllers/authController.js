const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getDb } = require('../database/db')
const { JWT_SECRET } = require('../middleware/auth')

function makeSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function uniqueSlug(db, base) {
  let slug = base
  let n = 1
  while (db.prepare('SELECT id FROM barbershops WHERE slug = ?').get(slug)) {
    slug = `${base}-${n++}`
  }
  return slug
}

async function register(req, res) {
  const { name, email, password, whatsapp, slug: rawSlug } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' })
  }

  const db = getDb()

  if (db.prepare('SELECT id FROM barbershops WHERE email = ?').get(email)) {
    return res.status(409).json({ error: 'Este email já está cadastrado' })
  }

  const baseSlug = rawSlug ? makeSlug(rawSlug) : makeSlug(name)
  const slug = uniqueSlug(db, baseSlug)

  const hashed = await bcrypt.hash(password, 12)

  const { lastInsertRowid: id } = db
    .prepare('INSERT INTO barbershops (name, email, password, slug, whatsapp) VALUES (?,?,?,?,?)')
    .run(name, email, hashed, slug, whatsapp || null)

  const token = jwt.sign({ id, name, email, slug }, JWT_SECRET, { expiresIn: '7d' })

  res.status(201).json({
    message: 'Barbearia cadastrada com sucesso!',
    token,
    barbershop: { id, name, email, slug, whatsapp: whatsapp || null },
  })
}

async function login(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' })
  }

  const db = getDb()
  const shop = db.prepare('SELECT * FROM barbershops WHERE email = ?').get(email)

  if (!shop || !(await bcrypt.compare(password, shop.password))) {
    return res.status(401).json({ error: 'Email ou senha incorretos' })
  }

  const token = jwt.sign(
    { id: shop.id, name: shop.name, email: shop.email, slug: shop.slug },
    JWT_SECRET,
    { expiresIn: '7d' },
  )

  res.json({
    message: 'Login realizado com sucesso',
    token,
    barbershop: { id: shop.id, name: shop.name, email: shop.email, slug: shop.slug, whatsapp: shop.whatsapp },
  })
}

function getMe(req, res) {
  const shop = getDb()
    .prepare('SELECT id, name, email, slug, whatsapp FROM barbershops WHERE id = ?')
    .get(req.barbershop.id)

  if (!shop) return res.status(404).json({ error: 'Barbearia não encontrada' })
  res.json(shop)
}

module.exports = { register, login, getMe }
