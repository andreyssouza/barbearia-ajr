import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

/* ── helpers ─────────────────────────────────────────────────── */
function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
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
function fmtDateLong(iso) {
  const [y, m, d] = iso.split('-')
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  return `${parseInt(d)} de ${months[+m - 1]} de ${y}`
}
function fmtWeekDay(iso) {
  const days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
  const d = new Date(iso + 'T00:00:00')
  return days[d.getDay()]
}
function isToday(iso) { return iso === todayISO() }
function isoFromYMD(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}
function currentWeekRange() {
  const today = new Date(todayISO() + 'T00:00:00')
  const dow = today.getDay() // 0=Dom
  const start = new Date(today); start.setDate(today.getDate() - dow)
  const end = new Date(today); end.setDate(today.getDate() + (6 - dow))
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }
}
function currentTimeHHMM() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}
function fmtWhatsApp(phone) {
  const digits = phone.replace(/\D/g, '')
  return digits.startsWith('55') ? digits : `55${digits}`
}

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
    --green: #4caf7d; --green-dim: rgba(76,175,125,0.15);
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
  .stat-card-clickable { cursor: pointer; }
  .stat-card-clickable:hover { border-color: rgba(201,168,76,0.4); background: rgba(201,168,76,0.04); }
  .stat-card-hint {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.6rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
    color: rgba(201,168,76,0.5); margin-top: 6px;
    display: flex; align-items: center; gap: 4px;
  }
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

  /* ── mini calendar ── */
  .mini-cal {
    background: var(--black-mid);
    border: 1px solid rgba(201,168,76,0.15);
    padding: 16px;
    margin-bottom: 24px;
    user-select: none;
  }
  .mini-cal-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 12px;
  }
  .mini-cal-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.85rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--gold);
  }
  .mini-cal-nav {
    background: transparent; border: 1px solid rgba(201,168,76,0.2);
    color: var(--gold); width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s; border-radius: 2px; font-size: 0.75rem;
  }
  .mini-cal-nav:hover { background: rgba(201,168,76,0.1); }
  .mini-cal-weekdays {
    display: grid; grid-template-columns: repeat(7, 1fr);
    margin-bottom: 6px;
  }
  .mini-cal-wd {
    text-align: center;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--gray-light); padding: 4px 0;
  }
  .mini-cal-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
  .mini-cal-day {
    aspect-ratio: 1;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.8rem; font-weight: 700;
    color: var(--gray-light); cursor: pointer;
    border: 1px solid transparent; border-radius: 2px;
    transition: all 0.2s; position: relative; gap: 1px;
  }
  .mini-cal-day:hover { color: var(--white); border-color: rgba(201,168,76,0.2); background: rgba(201,168,76,0.05); }
  .mini-cal-day.today { color: var(--white); }
  .mini-cal-day.selected { background: var(--gold); color: var(--black); border-color: var(--gold); }
  .mini-cal-day.selected .cal-dot { background: var(--black); }
  .mini-cal-day.empty { cursor: default; pointer-events: none; }
  .mini-cal-day.other-month { opacity: 0.3; }
  .cal-dot {
    width: 4px; height: 4px; border-radius: 50%;
    background: var(--gold); flex-shrink: 0;
  }
  .mini-cal-day.selected .cal-dot { background: rgba(0,0,0,0.5); }

  /* ── appointment list ── */
  .appt-list { display: flex; flex-direction: column; gap: 8px; }

  /* ── week group ── */
  .week-group { margin-bottom: 28px; }
  .week-group-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 8px;
    display: flex; align-items: center; gap: 8px;
  }
  .week-group-label::after { content: ''; flex: 1; height: 1px; background: rgba(201,168,76,0.15); }
  .week-group-label .wg-today-badge {
    background: var(--gold); color: var(--black);
    font-size: 0.58rem; padding: 2px 6px; border-radius: 2px; letter-spacing: 0.1em;
  }

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

  /* next upcoming appointment highlight */
  .appt-card.next-up {
    border-color: rgba(201,168,76,0.4);
    box-shadow: 0 0 0 1px rgba(201,168,76,0.15), inset 3px 0 0 var(--gold);
  }
  .appt-card.next-up .appt-time { background: rgba(201,168,76,0.12); }

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
  .appt-actions { display: flex; align-items: center; gap: 8px; padding: 0 16px; }

  /* whatsapp button */
  .appt-whatsapp {
    width: 36px; height: 36px;
    border: 1px solid rgba(76,175,125,0.3);
    background: transparent;
    color: var(--green);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.25s; font-size: 0.95rem; border-radius: 2px;
    flex-shrink: 0; text-decoration: none;
  }
  .appt-whatsapp:hover { background: var(--green-dim); border-color: rgba(76,175,125,0.6); }

  /* delete button — normal and confirming states */
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

  /* inline confirm */
  .appt-confirm-wrap { display: flex; align-items: center; gap: 6px; }
  .appt-confirm-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    color: #ff6b6b; white-space: nowrap;
  }
  .appt-confirm-yes {
    width: 32px; height: 32px;
    border: 1px solid rgba(255,107,107,0.5);
    background: rgba(255,107,107,0.12);
    color: #ff6b6b;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s; font-size: 0.8rem; border-radius: 2px;
  }
  .appt-confirm-yes:hover { background: rgba(255,107,107,0.25); }
  .appt-confirm-no {
    width: 32px; height: 32px;
    border: 1px solid rgba(255,255,255,0.1);
    background: transparent; color: var(--gray-light);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s; font-size: 0.8rem; border-radius: 2px;
  }
  .appt-confirm-no:hover { color: var(--white); border-color: rgba(255,255,255,0.25); }

  /* ── empty state ── */
  .dash-empty {
    text-align: center; padding: 64px 24px;
    background: var(--black-mid); border: 1px solid rgba(201,168,76,0.08);
  }
  .dash-empty-icon { font-size: 3rem; color: rgba(201,168,76,0.25); margin-bottom: 16px; }
  .dash-empty-title { font-family: 'Playfair Display', serif; font-size: 1.3rem; color: var(--white); margin-bottom: 8px; }
  .dash-empty-text { font-size: 0.9rem; color: var(--gray-light); font-weight: 300; }

  /* ── skeleton ── */
  .dash-skeleton { display: flex; flex-direction: column; gap: 8px; }
  .skeleton-card {
    height: 78px;
    background: linear-gradient(90deg, var(--black-mid) 25%, rgba(201,168,76,0.05) 50%, var(--black-mid) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ── all appointments modal ── */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.8);
    display: flex; align-items: flex-start; justify-content: center;
    padding: 40px 16px; overflow-y: auto;
    animation: fadeIn 0.2s;
  }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  .modal-box {
    background: var(--black-soft);
    border: 1px solid rgba(201,168,76,0.2);
    width: 100%; max-width: 720px;
    animation: slideUp 0.25s;
  }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: none; opacity: 1 } }
  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(201,168,76,0.1);
  }
  .modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.3rem; font-weight: 700; color: var(--white);
  }
  .modal-title span { color: var(--gold); font-style: italic; }
  .modal-close {
    background: transparent; border: 1px solid rgba(255,255,255,0.1);
    color: var(--gray-light); width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s; border-radius: 2px;
  }
  .modal-close:hover { color: var(--white); border-color: rgba(255,255,255,0.25); }
  .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 24px; max-height: 70vh; overflow-y: auto; }
  .modal-date-group {}
  .modal-date-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 8px;
    display: flex; align-items: center; gap: 8px;
  }
  .modal-date-label::after { content: ''; flex: 1; height: 1px; background: rgba(201,168,76,0.15); }
  .modal-empty { text-align: center; padding: 40px; color: var(--gray-light); font-size: 0.9rem; }

  /* appt-card inside modal — no hover translate */
  .modal-body .appt-card:hover { transform: none; }

  @media (max-width: 640px) {
    .dash-stats { grid-template-columns: repeat(2, 1fr); }
    .appt-card { grid-template-columns: 64px 1fr; }
    .appt-actions { grid-column: 1/-1; justify-content: flex-end; padding: 0 12px 12px; }
    .dash-header-right .dash-shop-name { display: none; }
    .mini-cal-day { font-size: 0.7rem; }
    .appt-confirm-label { display: none; }
  }
`

/* ── Mini Calendar Component ────────────────────────────────── */
const WEEKDAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function MiniCalendar({ selectedDate, onSelect, bookedDates, weekMode }) {
  const today = todayISO()
  const [view, setView] = useState(() => {
    const d = new Date(selectedDate + 'T00:00:00')
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const bookedSet = useMemo(() => new Set(bookedDates), [bookedDates])

  const { start: weekStart, end: weekEnd } = currentWeekRange()

  const firstDay = new Date(view.year, view.month, 1).getDay()
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
  const daysInPrev = new Date(view.year, view.month, 0).getDate()

  const cells = []
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: daysInPrev - firstDay + 1 + i, type: 'prev' })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, type: 'cur' })
  }
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, type: 'next' })
  }

  const prevMonth = () => setView(v => {
    const d = new Date(v.year, v.month - 1, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const nextMonth = () => setView(v => {
    const d = new Date(v.year, v.month + 1, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  return (
    <div className="mini-cal">
      <div className="mini-cal-header">
        <button className="mini-cal-nav" onClick={prevMonth}><i className="fa-solid fa-chevron-left"></i></button>
        <div className="mini-cal-title">{MONTHS[view.month]} {view.year}</div>
        <button className="mini-cal-nav" onClick={nextMonth}><i className="fa-solid fa-chevron-right"></i></button>
      </div>
      <div className="mini-cal-weekdays">
        {WEEKDAYS.map(w => <div key={w} className="mini-cal-wd">{w}</div>)}
      </div>
      <div className="mini-cal-days">
        {cells.map((cell, i) => {
          if (cell.type !== 'cur') {
            return <div key={i} className="mini-cal-day empty other-month"><span>{cell.day}</span></div>
          }
          const iso = isoFromYMD(view.year, view.month, cell.day)
          const isSelected = !weekMode && iso === selectedDate
          const inWeek = weekMode && iso >= weekStart && iso <= weekEnd
          const isTod = iso === today
          const hasAppt = bookedSet.has(iso)
          return (
            <div
              key={i}
              className={`mini-cal-day${isSelected || inWeek ? ' selected' : ''}${isTod && !isSelected && !inWeek ? ' today' : ''}`}
              onClick={() => onSelect(iso)}
            >
              <span>{cell.day}</span>
              {hasAppt && <div className="cal-dot"></div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Appointment Card ───────────────────────────────────────── */
function ApptCard({ a, isNextUp, confirmId, deletingId, onAskDelete, onConfirmDelete, onCancelDelete }) {
  const isConfirming = confirmId === a.id
  const isDeleting = deletingId === a.id
  const waPhone = fmtWhatsApp(a.client_phone)

  return (
    <div className={`appt-card${isNextUp ? ' next-up' : ''}`}>
      <div className="appt-time">
        <div className="appt-time-hr">{a.time}</div>
        <div className="appt-time-label">{isNextUp ? 'Próximo' : 'Horário'}</div>
      </div>
      <div className="appt-info">
        <div className="appt-name">{a.client_name}</div>
        <div className="appt-meta">
          <span className="appt-service"><i className="fa-solid fa-scissors"></i> {a.service}</span>
          <span className="appt-phone"><i className="fa-solid fa-phone"></i> {a.client_phone}</span>
        </div>
      </div>
      <div className="appt-actions">
        <a
          className="appt-whatsapp"
          href={`https://wa.me/${waPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir WhatsApp"
        >
          <i className="fa-brands fa-whatsapp"></i>
        </a>
        {isConfirming ? (
          <div className="appt-confirm-wrap">
            <span className="appt-confirm-label">Excluir?</span>
            <button
              className="appt-confirm-yes"
              onClick={() => onConfirmDelete(a.id)}
              disabled={isDeleting}
              title="Confirmar exclusão"
            >
              {isDeleting
                ? <i className="fa-solid fa-spinner fa-spin"></i>
                : <i className="fa-solid fa-check"></i>}
            </button>
            <button className="appt-confirm-no" onClick={onCancelDelete} title="Cancelar">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        ) : (
          <button
            className="appt-delete"
            onClick={() => onAskDelete(a.id)}
            disabled={isDeleting}
            title="Excluir agendamento"
          >
            {isDeleting
              ? <i className="fa-solid fa-spinner fa-spin"></i>
              : <i className="fa-solid fa-trash-can"></i>}
          </button>
        )}
      </div>
    </div>
  )
}

/* ── All Appointments Modal ─────────────────────────────────── */
function AllAppointmentsModal({ appointments, onClose, onDelete, deletingId }) {
  const [confirmId, setConfirmId] = useState(null)

  const grouped = useMemo(() => {
    const map = {}
    for (const a of appointments) {
      if (!map[a.date]) map[a.date] = []
      map[a.date].push(a)
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, appts]) => ({
        date,
        appts: [...appts].sort((a, b) => a.time.localeCompare(b.time)),
      }))
  }, [appointments])

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title">
            Todos os Agendamentos <span>({appointments.length})</span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="modal-body">
          {grouped.length === 0 ? (
            <div className="modal-empty">Nenhum agendamento cadastrado.</div>
          ) : grouped.map(({ date, appts }) => (
            <div key={date} className="modal-date-group">
              <div className="modal-date-label">{fmtDateLong(date)}</div>
              <div className="appt-list">
                {appts.map(a => (
                  <ApptCard
                    key={a.id}
                    a={a}
                    isNextUp={false}
                    confirmId={confirmId}
                    deletingId={deletingId}
                    onAskDelete={setConfirmId}
                    onConfirmDelete={async (id) => { await onDelete(id); setConfirmId(null) }}
                    onCancelDelete={() => setConfirmId(null)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Main Dashboard ─────────────────────────────────────────── */
export default function AdminDashboard() {
  const navigate = useNavigate()
  const [shop, setShop] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [allAppointments, setAllAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [deletingId, setDeletingId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState({ today: 0, week: 0, total: 0 })
  const [showAll, setShowAll] = useState(false)
  const [weekMode, setWeekMode] = useState(false)

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
      setAllAppointments(allRes.data)
      const { start, end } = currentWeekRange()
      const todayCount = allRes.data.filter((a) => a.date === todayISO()).length
      const weekCount = allRes.data.filter((a) => a.date >= start && a.date <= end).length
      setStats({ today: todayCount, week: weekCount, total: allRes.data.length })
    } catch (err) {
      if (err.response?.status === 401) navigate('/admin/login')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => { fetchAppointments(selectedDate) }, [selectedDate, fetchAppointments])

  const bookedDates = useMemo(() => [...new Set(allAppointments.map(a => a.date))], [allAppointments])

  // sorted appointments for day view
  const sortedAppointments = useMemo(
    () => [...appointments].sort((a, b) => a.time.localeCompare(b.time)),
    [appointments]
  )

  // next upcoming appointment (today only, future time)
  const nextUpId = useMemo(() => {
    if (!isToday(selectedDate) || weekMode) return null
    const now = currentTimeHHMM()
    const next = sortedAppointments.find(a => a.time >= now)
    return next?.id ?? null
  }, [sortedAppointments, selectedDate, weekMode])

  // week view: group allAppointments by day for current week
  const weekGroups = useMemo(() => {
    const { start, end } = currentWeekRange()
    const inWeek = allAppointments.filter(a => a.date >= start && a.date <= end)
    const map = {}
    for (const a of inWeek) {
      if (!map[a.date]) map[a.date] = []
      map[a.date].push(a)
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, appts]) => ({
        date,
        appts: [...appts].sort((a, b) => a.time.localeCompare(b.time)),
      }))
  }, [allAppointments])

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await api.delete(`/appointments/${id}`)
      setAppointments(prev => prev.filter(a => a.id !== id))
      setAllAppointments(prev => prev.filter(a => a.id !== id))
      setStats(s => {
        const deleted = allAppointments.find(a => a.id === id)
        const { start, end } = currentWeekRange()
        const wasToday = deleted?.date === todayISO()
        const wasWeek = deleted?.date >= start && deleted?.date <= end
        return {
          today: wasToday ? Math.max(0, s.today - 1) : s.today,
          week: wasWeek ? Math.max(0, s.week - 1) : s.week,
          total: Math.max(0, s.total - 1),
        }
      })
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

  const handleDaySelect = (iso) => {
    setSelectedDate(iso)
    setWeekMode(false)
  }

  const publicUrl = `${window.location.origin}/agendar/${shop?.slug}`
  const { start: wStart, end: wEnd } = currentWeekRange()
  const dateLabel = weekMode
    ? <span>Semana — <span>{fmtDate(wStart)} – {fmtDate(wEnd)}</span></span>
    : isToday(selectedDate)
      ? <span>Hoje — <span>{fmtDate(selectedDate)}</span></span>
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
              <div className="stat-label">Esta Semana</div>
              <div className="stat-value">{stats.week}</div>
            </div>
            <div className="stat-card stat-card-clickable" onClick={() => setShowAll(true)}>
              <div className="stat-label">Total Geral</div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-card-hint"><i className="fa-solid fa-list"></i> Ver todos</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Data Selecionada</div>
              <div className="stat-value">{weekMode ? weekGroups.reduce((s, g) => s + g.appts.length, 0) : appointments.length}</div>
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
                className={`dash-pill${isToday(selectedDate) && !weekMode ? ' active' : ''}`}
                onClick={() => { setSelectedDate(todayISO()); setWeekMode(false) }}
              >Hoje</button>
              <button
                className={`dash-pill${selectedDate === addDays(todayISO(), 1) && !weekMode ? ' active' : ''}`}
                onClick={() => { setSelectedDate(addDays(todayISO(), 1)); setWeekMode(false) }}
              >Amanhã</button>
              <button
                className={`dash-pill${weekMode ? ' active' : ''}`}
                onClick={() => setWeekMode(true)}
              >Esta semana</button>
            </div>
          </div>

          {/* MINI CALENDAR */}
          <MiniCalendar
            selectedDate={selectedDate}
            onSelect={handleDaySelect}
            bookedDates={bookedDates}
            weekMode={weekMode}
          />

          {/* APPOINTMENT LIST */}
          {loading ? (
            <div className="dash-skeleton">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton-card" />)}
            </div>
          ) : weekMode ? (
            weekGroups.length === 0 ? (
              <div className="dash-empty">
                <div className="dash-empty-icon"><i className="fa-regular fa-calendar-xmark"></i></div>
                <div className="dash-empty-title">Nenhum agendamento esta semana</div>
                <div className="dash-empty-text">Nenhum agendamento de {fmtDate(wStart)} a {fmtDate(wEnd)}.</div>
              </div>
            ) : weekGroups.map(({ date, appts }) => (
              <div key={date} className="week-group">
                <div className="week-group-label">
                  {fmtWeekDay(date)}, {fmtDate(date)}
                  {isToday(date) && <span className="wg-today-badge">Hoje</span>}
                </div>
                <div className="appt-list">
                  {appts.map(a => (
                    <ApptCard
                      key={a.id}
                      a={a}
                      isNextUp={false}
                      confirmId={confirmId}
                      deletingId={deletingId}
                      onAskDelete={setConfirmId}
                      onConfirmDelete={async (id) => { await handleDelete(id); setConfirmId(null) }}
                      onCancelDelete={() => setConfirmId(null)}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : sortedAppointments.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon"><i className="fa-regular fa-calendar-xmark"></i></div>
              <div className="dash-empty-title">Nenhum agendamento</div>
              <div className="dash-empty-text">Não há agendamentos para {fmtDate(selectedDate)}.</div>
            </div>
          ) : (
            <div className="appt-list">
              {sortedAppointments.map((a) => (
                <ApptCard
                  key={a.id}
                  a={a}
                  isNextUp={a.id === nextUpId}
                  confirmId={confirmId}
                  deletingId={deletingId}
                  onAskDelete={setConfirmId}
                  onConfirmDelete={async (id) => { await handleDelete(id); setConfirmId(null) }}
                  onCancelDelete={() => setConfirmId(null)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <div className={`copy-toast${copied ? ' show' : ''}`}>
        <i className="fa-solid fa-check"></i> Link copiado!
      </div>

      {showAll && (
        <AllAppointmentsModal
          appointments={allAppointments}
          onClose={() => setShowAll(false)}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}
    </>
  )
}
