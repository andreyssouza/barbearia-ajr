import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

/* ── helpers ─────────────────────────────────────────────────── */
function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
function fmtDate(iso) {
  const [y, m, d] = iso.split('-')
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${d} ${months[+m - 1]} ${y}`
}
function isToday(iso) { return iso === todayISO() }

/* ── CSS ─────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Barlow:wght@300;400;500;600&family=Barlow+Condensed:wght@700;800&display=swap');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --gold: #C9A84C; --gold-light: #E8C76A; --gold-dark: #8B6914;
    --black: #0A0A0A; --black-soft: #111; --black-mid: #1A1A1A;
    --gray-dark: #222; --gray-mid: #444; --gray-light: #888;
    --white: #F5F0E8;
  }
  html, body { background: var(--black); color: var(--white); font-family: 'Barlow', sans-serif; }

  /* ── layout ── */
  .dash { min-height: 100vh; display: flex; flex-direction: column; }

  /* ── header ── */
  .dash-header {
    background: var(--black-soft);
    border-bottom: 1px solid rgba(201,168,76,0.15);
    padding: 0 clamp(16px,4vw,48px);
    height: 68px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 100;
  }
  .dash-logo {
    display: flex; align-items: center; gap: 12px;
    font-family: 'Playfair Display', serif; font-size: 1.1rem;
    color: var(--white); text-decoration: none;
  }
  .dash-logo i { color: var(--gold); }
  .dash-logo span { color: var(--gold); font-style: italic; }
  .dash-header-right { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .dash-shop-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.8rem; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--gray-light);
    display: flex; align-items: center; gap: 8px;
  }
  .dash-shop-name i { color: var(--gold); }

  /* buttons */
  .dash-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 18px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.78rem; font-weight: 800;
    letter-spacing: 0.15em; text-transform: uppercase;
    border: none; cursor: pointer; transition: all 0.25s; border-radius: 2px;
    text-decoration: none;
  }
  .dash-btn-gold { background: var(--gold); color: var(--black); }
  .dash-btn-gold:hover { background: var(--gold-light); }
  .dash-btn-outline { background: transparent; color: var(--gold); border: 1px solid rgba(201,168,76,0.4); }
  .dash-btn-outline:hover { background: rgba(201,168,76,0.08); }
  .dash-btn-ghost { background: transparent; color: var(--gray-light); border: 1px solid rgba(255,255,255,0.08); }
  .dash-btn-ghost:hover { color: var(--white); border-color: rgba(255,255,255,0.18); }
  .dash-btn-danger { background: transparent; color: #ff6b6b; border: 1px solid rgba(255,107,107,0.25); padding: 8px 14px; }
  .dash-btn-danger:hover { background: rgba(255,107,107,0.08); }

  /* ── copy toast ── */
  .copy-toast {
    position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%) translateY(20px);
    background: var(--gold); color: var(--black);
    padding: 10px 24px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.85rem; font-weight: 800; letter-spacing: 0.1em;
    opacity: 0; pointer-events: none;
    transition: all 0.3s; z-index: 999; white-space: nowrap;
  }
  .copy-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

  /* ── main content ── */
  .dash-main { flex: 1; padding: clamp(20px,4vw,48px) clamp(16px,4vw,48px); }

  /* ── stats row ── */
  .dash-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px; margin-bottom: 32px;
  }
  .stat-card {
    background: var(--black-mid);
    border: 1px solid rgba(201,168,76,0.1);
    padding: 20px 24px;
    position: relative; overflow: hidden;
    transition: border-color 0.3s;
  }
  .stat-card::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 100%; height: 2px;
    background: var(--gold); transition: right 0.4s;
  }
  .stat-card:hover { border-color: rgba(201,168,76,0.25); }
  .stat-card:hover::after { right: 0; }
  .stat-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.68rem; font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--gray-light); margin-bottom: 8px;
  }
  .stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 2.2rem; font-weight: 900; color: var(--gold);
    line-height: 1;
  }

  /* ── link banner ── */
  .dash-link-banner {
    background: rgba(201,168,76,0.05);
    border: 1px solid rgba(201,168,76,0.15);
    padding: 16px 20px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; flex-wrap: wrap;
    margin-bottom: 32px;
  }
  .dash-link-info { display: flex; align-items: center; gap: 12px; }
  .dash-link-icon { color: var(--gold); font-size: 1.1rem; }
  .dash-link-label { font-family: 'Barlow Condensed', sans-serif; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gray-light); margin-bottom: 2px; }
  .dash-link-url { font-size: 0.9rem; color: var(--white); }

  /* ── date nav ── */
  .dash-date-nav {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    margin-bottom: 24px;
  }
  .dash-date-nav-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem; font-weight: 700; color: var(--white);
    flex: 1; min-width: 160px;
  }
  .dash-date-nav-title span { color: var(--gold); font-style: italic; }
  .date-input {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,168,76,0.2);
    color: var(--white); padding: 9px 14px;
    font-family: 'Barlow', sans-serif; font-size: 0.85rem;
    outline: none; transition: border-color 0.3s;
    border-radius: 2px; cursor: pointer;
  }
  .date-input:focus { border-color: var(--gold); }
  .date-input::-webkit-calendar-picker-indicator { filter: invert(0.7); }
  .dash-date-pills { display: flex; gap: 8px; flex-wrap: wrap; }
  .dash-pill {
    padding: 7px 14px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.75rem; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    background: transparent; border: 1px solid rgba(255,255,255,0.08);
    color: var(--gray-light); cursor: pointer; transition: all 0.2s; border-radius: 2px;
  }
  .dash-pill:hover { border-color: rgba(201,168,76,0.3); color: var(--gold); }
  .dash-pill.active { background: var(--gold); color: var(--black); border-color: var(--gold); }

  /* ── appointment list ── */
  .appt-list { display: flex; flex-direction: column; gap: 8px; }
  .appt-card {
    background: var(--black-mid);
    border: 1px solid rgba(201,168,76,0.08);
    padding: 0;
    display: grid;
    grid-template-columns: 80px 1fr auto;
    align-items: stretch;
    transition: border-color 0.3s, transform 0.2s;
    overflow: hidden;
  }
  .appt-card:hover { border-color: rgba(201,168,76,0.2); transform: translateX(3px); }
  .appt-time {
    background: rgba(201,168,76,0.06);
    border-right: 1px solid rgba(201,168,76,0.1);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; padding: 16px 8px;
    font-family: 'Playfair Display', serif;
  }
  .appt-time-hr { font-size: 1.4rem; font-weight: 700; color: var(--gold); line-height: 1; }
  .appt-time-label { font-family: 'Barlow Condensed', sans-serif; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gray-light); margin-top: 2px; }
  .appt-info { padding: 14px 20px; display: flex; flex-direction: column; justify-content: center; gap: 4px; }
  .appt-name { font-family: 'Barlow Condensed', sans-serif; font-size: 1rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: var(--white); }
  .appt-meta { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  .appt-service { font-size: 0.85rem; color: var(--gold); display: flex; align-items: center; gap: 6px; }
  .appt-phone { font-size: 0.82rem; color: var(--gray-light); display: flex; align-items: center; gap: 6px; }
  .appt-actions { display: flex; align-items: center; padding: 0 16px; }
  .appt-delete {
    width: 36px; height: 36px;
    border: 1px solid rgba(255,107,107,0.2);
    background: transparent;
    color: rgba(255,107,107,0.6);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.25s; font-size: 0.85rem; border-radius: 2px;
    flex-shrink: 0;
  }
  .appt-delete:hover { background: rgba(255,107,107,0.1); color: #ff6b6b; border-color: rgba(255,107,107,0.4); }
  .appt-delete:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── empty state ── */
  .dash-empty {
    text-align: center; padding: 64px 24px;
    background: var(--black-mid); border: 1px solid rgba(201,168,76,0.08);
  }
  .dash-empty-icon { font-size: 3rem; color: rgba(201,168,76,0.25); margin-bottom: 16px; }
  .dash-empty-title { font-family: 'Playfair Display', serif; font-size: 1.3rem; color: var(--white); margin-bottom: 8px; }
  .dash-empty-text { font-size: 0.9rem; color: var(--gray-light); font-weight: 300; }

  /* ── skeleton ── */
  .dash-skeleton {
    display: flex; flex-direction: column; gap: 8px;
  }
  .skeleton-card {
    height: 78px;
    background: linear-gradient(90deg, var(--black-mid) 25%, rgba(201,168,76,0.05) 50%, var(--black-mid) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  @media (max-width: 640px) {
    .dash-stats { grid-template-columns: repeat(2, 1fr); }
    .appt-card { grid-template-columns: 64px 1fr; }
    .appt-actions { grid-column: 1/-1; justify-content: flex-end; padding: 0 12px 12px; }
    .dash-header-right .dash-shop-name { display: none; }
  }
`

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [shop, setShop] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [deletingId, setDeletingId] = useState(null)
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState({ today: 0, total: 0 })

  useEffect(() => {
    const raw = localStorage.getItem('barber_shop')
    if (raw) setShop(JSON.parse(raw))
  }, [])

  const fetchAppointments = useCallback(async (date) => {
    setLoading(true)
    try {
      const [dateRes, allRes] = await Promise.all([
        api.get('/appointments', { params: { date } }),
        api.get('/appointments'),
      ])
      setAppointments(dateRes.data)
      const todayCount = allRes.data.filter((a) => a.date === todayISO()).length
      setStats({ today: todayCount, total: allRes.data.length })
    } catch (err) {
      if (err.response?.status === 401) navigate('/admin/login')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => { fetchAppointments(selectedDate) }, [selectedDate, fetchAppointments])

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este agendamento?')) return
    setDeletingId(id)
    try {
      await api.delete(`/appointments/${id}`)
      setAppointments((prev) => prev.filter((a) => a.id !== id))
      setStats((s) => ({ ...s, today: Math.max(0, s.today - 1), total: Math.max(0, s.total - 1) }))
    } catch {
      alert('Erro ao excluir agendamento')
    } finally {
      setDeletingId(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('barber_token')
    localStorage.removeItem('barber_shop')
    navigate('/admin/login')
  }

  const handleCopy = () => {
    const url = `${window.location.origin}/agendar/${shop?.slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const publicUrl = `${window.location.origin}/agendar/${shop?.slug}`
  const dateLabel = isToday(selectedDate) ? <span>Hoje — <span>{fmtDate(selectedDate)}</span></span>
    : <span>{fmtDate(selectedDate)}</span>

  return (
    <>
      <style>{css}</style>

      <div className="dash">
        {/* HEADER */}
        <header className="dash-header">
          <Link to="/" className="dash-logo">
            <i className="fa-solid fa-scissors"></i>
            <span>BarberSaaS</span>
          </Link>
          <div className="dash-header-right">
            {shop && (
              <div className="dash-shop-name">
                <i className="fa-solid fa-store"></i>
                {shop.name}
              </div>
            )}
            <button className="dash-btn dash-btn-outline" onClick={handleCopy}>
              <i className="fa-solid fa-link"></i> Link Público
            </button>
            <button className="dash-btn dash-btn-ghost" onClick={handleLogout}>
              <i className="fa-solid fa-right-from-bracket"></i> Sair
            </button>
          </div>
        </header>

        <main className="dash-main">
          {/* STATS */}
          <div className="dash-stats">
            <div className="stat-card">
              <div className="stat-label">Agendamentos Hoje</div>
              <div className="stat-value">{stats.today}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Geral</div>
              <div className="stat-value">{stats.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Data Selecionada</div>
              <div className="stat-value">{appointments.length}</div>
            </div>
          </div>

          {/* PUBLIC LINK BANNER */}
          {shop && (
            <div className="dash-link-banner">
              <div className="dash-link-info">
                <i className="fa-solid fa-globe dash-link-icon"></i>
                <div>
                  <div className="dash-link-label">Link de Agendamento</div>
                  <div className="dash-link-url">{publicUrl}</div>
                </div>
              </div>
              <button className="dash-btn dash-btn-gold" onClick={handleCopy}>
                <i className={copied ? 'fa-solid fa-check' : 'fa-solid fa-copy'}></i>
                {copied ? 'Copiado!' : 'Copiar Link'}
              </button>
            </div>
          )}

          {/* DATE NAVIGATION */}
          <div className="dash-date-nav">
            <div className="dash-date-nav-title">{dateLabel}</div>
            <div className="dash-date-pills">
              <button
                className={`dash-pill${isToday(selectedDate) ? ' active' : ''}`}
                onClick={() => setSelectedDate(todayISO())}
              >Hoje</button>
              <button
                className={`dash-pill${selectedDate === addDays(todayISO(), 1) ? ' active' : ''}`}
                onClick={() => setSelectedDate(addDays(todayISO(), 1))}
              >Amanhã</button>
            </div>
            <input
              type="date" className="date-input"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            />
          </div>

          {/* APPOINTMENT LIST */}
          {loading ? (
            <div className="dash-skeleton">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton-card" />)}
            </div>
          ) : appointments.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon"><i className="fa-regular fa-calendar-xmark"></i></div>
              <div className="dash-empty-title">Nenhum agendamento</div>
              <div className="dash-empty-text">Não há agendamentos para {fmtDate(selectedDate)}.</div>
            </div>
          ) : (
            <div className="appt-list">
              {appointments.map((a) => (
                <div key={a.id} className="appt-card">
                  <div className="appt-time">
                    <div className="appt-time-hr">{a.time}</div>
                    <div className="appt-time-label">Horário</div>
                  </div>
                  <div className="appt-info">
                    <div className="appt-name">{a.client_name}</div>
                    <div className="appt-meta">
                      <span className="appt-service">
                        <i className="fa-solid fa-scissors"></i> {a.service}
                      </span>
                      <span className="appt-phone">
                        <i className="fa-solid fa-phone"></i> {a.client_phone}
                      </span>
                    </div>
                  </div>
                  <div className="appt-actions">
                    <button
                      className="appt-delete"
                      onClick={() => handleDelete(a.id)}
                      disabled={deletingId === a.id}
                      title="Excluir agendamento"
                    >
                      {deletingId === a.id
                        ? <i className="fa-solid fa-spinner fa-spin"></i>
                        : <i className="fa-solid fa-trash-can"></i>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <div className={`copy-toast${copied ? ' show' : ''}`}>
        <i className="fa-solid fa-check"></i> Link copiado!
      </div>
    </>
  )
}
