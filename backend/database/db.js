const initSqlJs = require('sql.js')
const fs = require('fs')
const path = require('path')

const DB_PATH = path.join(__dirname, 'barber.db')

let wrapper = null

/* ── Thin wrapper that mimics better-sqlite3's API ───────────── */
class StmtWrapper {
  constructor(db, sql) {
    this._db = db
    this._sql = sql
  }

  run(...params) {
    this._db.run(this._sql, params)
    const res = this._db.exec('SELECT last_insert_rowid()')
    persist(this._db)
    return { lastInsertRowid: res[0]?.values[0][0] ?? null }
  }

  get(...params) {
    const res = this._db.exec(this._sql, params)
    if (!res.length || !res[0].values.length) return undefined
    const { columns, values } = res[0]
    return Object.fromEntries(columns.map((c, i) => [c, values[0][i]]))
  }

  all(...params) {
    const res = this._db.exec(this._sql, params)
    if (!res.length) return []
    const { columns, values } = res[0]
    return values.map((row) => Object.fromEntries(columns.map((c, i) => [c, row[i]])))
  }
}

class DbWrapper {
  constructor(sqlDb) {
    this._db = sqlDb
  }
  prepare(sql) { return new StmtWrapper(this._db, sql) }
  exec(sql) { this._db.exec(sql); persist(this._db); return this }
}

function persist(sqlDb) {
  fs.writeFileSync(DB_PATH, Buffer.from(sqlDb.export()))
}

function getDb() {
  if (!wrapper) throw new Error('Database not initialized yet.')
  return wrapper
}

async function initDb() {
  const SQL = await initSqlJs()
  const sqlDb = fs.existsSync(DB_PATH)
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database()

  wrapper = new DbWrapper(sqlDb)

  wrapper._db.exec(`
    CREATE TABLE IF NOT EXISTS barbershops (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      email       TEXT    UNIQUE NOT NULL,
      password    TEXT    NOT NULL,
      slug        TEXT    UNIQUE NOT NULL,
      whatsapp    TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      barbershop_id INTEGER NOT NULL,
      client_name   TEXT    NOT NULL,
      client_phone  TEXT    NOT NULL,
      service       TEXT    NOT NULL,
      date          TEXT    NOT NULL,
      time          TEXT    NOT NULL,
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (barbershop_id) REFERENCES barbershops(id)
    );
  `)

  persist(sqlDb)
  console.log('✅  Banco de dados inicializado')
}

module.exports = { getDb, initDb }
