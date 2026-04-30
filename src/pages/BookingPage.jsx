import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'

/* ── helpers ─────────────────────────────────────────────────── */
function fmtDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  return `${d} de ${months[+m - 1]} de ${y}`
}
function minDate() { return new Date().toISOString().slice(0, 10) }

const SERVICES = [
  { name: 'Corte', price: 'R$ 30', icon: 'fa-solid fa-scissors' },
  { name: 'Barba', price: 'R$ 25', icon: 'fa-solid fa-user-tie' },
  { name: 'Corte + Barba', price: 'R$ 50', icon: 'fa-solid fa-star', highlight: true },
  { name: 'Máquina', price: 'R$ 25', icon: 'fa-solid fa-sliders' },
  { name: 'Sobrancelha', price: 'R$ 10', icon: 'fa-solid fa-eye' },
  { name: 'Pigmentação', price: 'R$ 20', icon: 'fa-solid fa-droplet' },
]

/* ── CSS ─────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Barlow:wght@300;400;500;600&family=Barlow+Condensed:wght@700;800&display=swap');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --gold: #C9A84C; --gold-light: #E8C76A;
    --black: #0A0A0A; --black-soft: #111; --black-mid: #1A1A1A;
    --gray-dark: #222; --gray-mid: #555; --gray-light: #888;
    --white: #F5F0E8;
  }
  html, body { background: var(--black); color: var(--white); font-family: 'Barlow', sans-serif; }

  .booking-page { min-height: 100vh; display: flex; flex-direction: column; }

  /* ── header ── */
  .bk-header {
    background: var(--black-soft);
    border-bottom: 1px solid rgba(201,168,76,0.15);
    padding: 0 clamp(16px,5vw,64px); height: 68px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .bk-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
  .bk-logo i { color: var(--gold); font-size: 1.2rem; }
  .bk-shop-name { font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 700; color: var(--white); }
  .bk-shop-tag { font-family: 'Barlow Condensed', sans-serif; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; color: var(--gold); }
  .bk-header-admin { font-family: 'Barlow Condensed', sans-serif; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gray-light); text-decoration: none; transition: color 0.2s; }
  .bk-header-admin:hover { color: var(--gold); }

  /* ── hero strip ── */
  .bk-hero {
    background: var(--black-soft);
    border-bottom: 1px solid rgba(201,168,76,0.1);
    padding: 40px clamp(16px,5vw,64px);
    text-align: center;
    position: relative; overflow: hidden;
  }
  .bk-hero::before {
    content: '';
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%);
    pointer-events: none;
  }
  .bk-hero-tag { font-family: 'Barlow Condensed', sans-serif; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); margin-bottom: 12px; display: block; }
  .bk-hero-title { font-family: 'Playfair Display', serif; font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 900; color: var(--white); line-height: 1.1; }
  .bk-hero-title em { color: var(--gold); font-style: italic; }
  .bk-hero-sub { font-size: 0.9rem; color: var(--gray-light); margin-top: 10px; font-weight: 300; }

  /* ── steps indicator ── */
  .bk-steps {
    display: flex; align-items: center; justify-content: center;
    gap: 0; padding: 28px clamp(16px,5vw,64px);
    background: var(--black);
  }
  .bk-step { display: flex; align-items: center; gap: 0; }
  .bk-step-dot {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Barlow Condensed', sans-serif; font-size: 0.85rem; font-weight: 800;
    border: 2px solid rgba(201,168,76,0.2);
    color: var(--gray-light); transition: all 0.3s; position: relative;
  }
  .bk-step-dot.active { border-color: var(--gold); color: var(--gold); background: rgba(201,168,76,0.08); }
  .bk-step-dot.done { border-color: var(--gold); background: var(--gold); color: var(--black); }
  .bk-step-label {
    font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--gray-light); margin-left: 8px; white-space: nowrap;
    transition: color 0.3s;
  }
  .bk-step-label.active { color: var(--gold); }
  .bk-step-line { width: clamp(24px,4vw,60px); height: 1px; background: rgba(201,168,76,0.15); margin: 0 12px; }
  @media (max-width: 480px) {
    .bk-step-label { display: none; }
    .bk-step-line { width: 20px; margin: 0 6px; }
  }

  /* ── main form area ── */
  .bk-content { flex: 1; padding: 32px clamp(16px,5vw,64px) 64px; max-width: 760px; margin: 0 auto; width: 100%; }

  .bk-section-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; color: var(--white); margin-bottom: 20px; }
  .bk-section-title span { color: var(--gold); font-style: italic; }

  /* ── service grid ── */
  .service-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px; }
  .service-btn {
    background: var(--black-mid); border: 1px solid rgba(201,168,76,0.1);
    padding: 20px 16px; cursor: pointer;
    display: flex; flex-direction: column; align-items: flex-start; gap: 8px;
    transition: all 0.3s; position: relative; overflow: hidden; text-align: left;
  }
  .service-btn::after { content: ''; position: absolute; bottom: 0; left: 0; right: 100%; height: 2px; background: var(--gold); transition: right 0.35s; }
  .service-btn:hover { border-color: rgba(201,168,76,0.25); }
  .service-btn:hover::after { right: 0; }
  .service-btn.selected { border-color: var(--gold); background: rgba(201,168,76,0.07); }
  .service-btn.selected::after { right: 0; }
  .service-btn.highlight { background: rgba(201,168,76,0.06); }
  .service-btn-icon { color: var(--gold); font-size: 1.1rem; }
  .service-btn-name { font-family: 'Barlow Condensed', sans-serif; font-size: 0.9rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--white); }
  .service-btn-price { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: var(--gold); margin-top: auto; }
  .service-badge { position: absolute; top: 8px; right: 8px; font-family: 'Barlow Condensed', sans-serif; font-size: 0.55rem; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: var(--black); background: var(--gold); padding: 2px 7px; }

  /* ── date & time ── */
  .bk-date-wrap { margin-bottom: 28px; }
  .bk-label { font-family: 'Barlow Condensed', sans-serif; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 10px; display: block; }
  .bk-date-input { background: rgba(255,255,255,0.04); border: 1px solid rgba(201,168,76,0.2); color: var(--white); padding: 13px 18px; font-family: 'Barlow', sans-serif; font-size: 1rem; outline: none; transition: border-color 0.3s; border-radius: 2px; width: 100%; max-width: 260px; }
  .bk-date-input:focus { border-color: var(--gold); }
  .bk-date-input::-webkit-calendar-picker-indicator { filter: invert(0.6); }

  .slots-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .slot-btn {
    padding: 10px 18px;
    font-family: 'Barlow Condensed', sans-serif; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.1em;
    background: var(--black-mid); border: 1px solid rgba(201,168,76,0.12);
    color: var(--gray-light); cursor: pointer; transition: all 0.25s; border-radius: 2px;
  }
  .slot-btn:hover:not(:disabled) { border-color: rgba(201,168,76,0.3); color: var(--gold); }
  .slot-btn.selected { background: var(--gold); color: var(--black); border-color: var(--gold); }
  .slot-btn:disabled { opacity: 0.3; cursor: not-allowed; text-decoration: line-through; }
  .slots-loading { color: var(--gray-light); font-size: 0.85rem; display: flex; align-items: center; gap: 8px; }

  /* ── personal info form ── */
  .bk-form { display: flex; flex-direction: column; gap: 18px; }
  .bk-field { display: flex; flex-direction: column; gap: 8px; }
  .bk-input { background: rgba(255,255,255,0.04); border: 1px solid rgba(201,168,76,0.2); color: var(--white); padding: 13px 18px; font-family: 'Barlow', sans-serif; font-size: 0.95rem; outline: none; transition: border-color 0.3s; border-radius: 2px; width: 100%; }
  .bk-input::placeholder { color: var(--gray-mid); }
  .bk-input:focus { border-color: var(--gold); }

  /* ── summary card ── */
  .bk-summary { background: rgba(201,168,76,0.05); border: 1px solid rgba(201,168,76,0.15); padding: 20px 24px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 8px; }
  .bk-summary-item { display: flex; align-items: center; gap: 12px; font-size: 0.9rem; color: var(--gray-light); }
  .bk-summary-item i { color: var(--gold); width: 16px; text-align: center; }
  .bk-summary-item span { color: var(--white); }

  /* ── error ── */
  .bk-error { background: rgba(220,53,69,0.12); border: 1px solid rgba(220,53,69,0.3); color: #ff6b6b; padding: 12px 16px; font-size: 0.85rem; margin-bottom: 16px; border-radius: 2px; }

  /* ── submit button ── */
  .bk-submit {
    width: 100%; padding: 16px;
    background: var(--gold); color: var(--black);
    font-family: 'Barlow Condensed', sans-serif; font-size: 1.05rem; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase;
    border: none; cursor: pointer; transition: all 0.3s;
    display: flex; align-items: center; justify-content: center; gap: 10px; border-radius: 2px;
  }
  .bk-submit:hover:not(:disabled) { background: var(--gold-light); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(201,168,76,0.2); }
  .bk-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* ── nav buttons ── */
  .bk-nav { display: flex; gap: 12px; margin-top: 4px; }
  .bk-nav-back { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: var(--gray-light); padding: 13px 24px; font-family: 'Barlow Condensed', sans-serif; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.25s; border-radius: 2px; }
  .bk-nav-back:hover { border-color: rgba(255,255,255,0.2); color: var(--white); }
  .bk-nav-next { flex: 1; padding: 13px; background: var(--gold); color: var(--black); font-family: 'Barlow Condensed', sans-serif; font-size: 0.9rem; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; border: none; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; border-radius: 2px; }
  .bk-nav-next:hover:not(:disabled) { background: var(--gold-light); }
  .bk-nav-next:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── success screen ── */
  .bk-success {
    flex: 1; display: flex; align-items: center; justify-content: center;
    padding: 40px 24px;
  }
  .bk-success-card {
    background: var(--black-mid); border: 1px solid rgba(201,168,76,0.15);
    padding: 48px 40px; text-align: center; max-width: 460px; width: 100%;
    position: relative;
  }
  .bk-success-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--gold), var(--gold-light), var(--gold)); }
  .bk-success-icon { font-size: 3rem; color: var(--gold); margin-bottom: 16px; }
  .bk-success-title { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 900; color: var(--white); margin-bottom: 8px; }
  .bk-success-sub { font-size: 0.9rem; color: var(--gray-light); font-weight: 300; margin-bottom: 28px; line-height: 1.6; }
  .bk-success-details { background: rgba(201,168,76,0.05); border: 1px solid rgba(201,168,76,0.12); padding: 20px; margin-bottom: 28px; display: flex; flex-direction: column; gap: 10px; text-align: left; }
  .bk-success-detail { display: flex; align-items: center; gap: 12px; font-size: 0.9rem; }
  .bk-success-detail i { color: var(--gold); width: 16px; text-align: center; }
  .bk-success-detail span { color: var(--white); }
  .bk-wa-btn { width: 100%; padding: 15px; background: #25D366; color: white; font-family: 'Barlow Condensed', sans-serif; font-size: 1rem; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.3s; margin-bottom: 12px; border-radius: 2px; }
  .bk-wa-btn:hover { background: #128C7E; transform: translateY(-1px); }
  .bk-new-btn { width: 100%; padding: 13px; background: transparent; border: 1px solid rgba(201,168,76,0.2); color: var(--gold); font-family: 'Barlow Condensed', sans-serif; font-size: 0.85rem; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: all 0.3s; border-radius: 2px; }
  .bk-new-btn:hover { background: rgba(201,168,76,0.08); }

  /* ── not found ── */
  .bk-not-found { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 24px; text-align: center; }
  .bk-not-found-icon { font-size: 3rem; color: rgba(201,168,76,0.3); margin-bottom: 16px; }
  .bk-not-found-title { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: var(--white); margin-bottom: 8px; }
  .bk-not-found-sub { color: var(--gray-light); font-size: 0.9rem; font-weight: 300; }
`

export default function BookingPage() {
  const { slug } = useParams()
  const [shop, setShop] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ service: '', date: '', time: '', client_name: '', client_phone: '' })
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [booked, setBooked] = useState(null)

  useEffect(() => {
    api.get(`/barbershop/${slug}`)
      .then((res) => { setShop(res.data); setPageLoading(false) })
      .catch(() => { setNotFound(true); setPageLoading(false) })
  }, [slug])

  useEffect(() => {
    if (!form.date || !slug) return
    setSlotsLoading(true)
    api.get(`/barbershop/${slug}/slots`, { params: { date: form.date } })
      .then((res) => setSlots(res.data))
      .catch(() => {})
      .finally(() => setSlotsLoading(false))
  }, [form.date, slug])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post(`/barbershop/${slug}/appointments`, {
        client_name: form.client_name,
        client_phone: form.client_phone,
        service: form.service,
        date: form.date,
        time: form.time,
      })
      setBooked({ ...form })
      setStep(4)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar agendamento. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWhatsApp = () => {
    if (!shop?.whatsapp) return
    const phone = shop.whatsapp.replace(/\D/g, '')
    const msg = `Olá! Acabei de agendar um horário:\n✂️ Serviço: ${booked.service}\n📅 Data: ${fmtDate(booked.date)}\n⏰ Horário: ${booked.time}\n👤 Nome: ${booked.client_name}`
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const resetForm = () => {
    setForm({ service: '', date: '', time: '', client_name: '', client_phone: '' })
    setBooked(null)
    setStep(1)
    setError('')
  }

  if (pageLoading) {
    return (
      <>
        <style>{css}</style>
        <div className="booking-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--gold)', fontSize: '1.5rem' }}>
            <i className="fa-solid fa-spinner fa-spin"></i>
          </div>
        </div>
      </>
    )
  }

  if (notFound) {
    return (
      <>
        <style>{css}</style>
        <div className="booking-page">
          <header className="bk-header">
            <Link to="/" className="bk-logo">
              <i className="fa-solid fa-scissors"></i>
              <div><div className="bk-shop-name">BarberSaaS</div></div>
            </Link>
          </header>
          <div className="bk-not-found">
            <div>
              <div className="bk-not-found-icon"><i className="fa-solid fa-store-slash"></i></div>
              <div className="bk-not-found-title">Barbearia não encontrada</div>
              <div className="bk-not-found-sub">O link que você acessou não existe ou foi alterado.</div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const stepDone = (s) => step > s
  const stepActive = (s) => step === s

  return (
    <>
      <style>{css}</style>
      <div className="booking-page">
        {/* HEADER */}
        <header className="bk-header">
          <div className="bk-logo">
            <i className="fa-solid fa-scissors"></i>
            <div>
              <div className="bk-shop-name">{shop.name}</div>
              <div className="bk-shop-tag">Agendamento Online</div>
            </div>
          </div>
          <Link to="/admin/login" className="bk-header-admin">
            <i className="fa-solid fa-lock"></i> Admin
          </Link>
        </header>

        {/* SUCCESS SCREEN */}
        {step === 4 && booked && (
          <div className="bk-success">
            <div className="bk-success-card">
              <div className="bk-success-icon"><i className="fa-solid fa-circle-check"></i></div>
              <div className="bk-success-title">Agendado!</div>
              <div className="bk-success-sub">
                Seu horário foi reservado com sucesso.{shop?.whatsapp ? ' Confirme pelo WhatsApp.' : ''}
              </div>
              <div className="bk-success-details">
                <div className="bk-success-detail">
                  <i className="fa-solid fa-scissors"></i><span>{booked.service}</span>
                </div>
                <div className="bk-success-detail">
                  <i className="fa-regular fa-calendar"></i><span>{fmtDate(booked.date)}</span>
                </div>
                <div className="bk-success-detail">
                  <i className="fa-regular fa-clock"></i><span>{booked.time}</span>
                </div>
                <div className="bk-success-detail">
                  <i className="fa-solid fa-user"></i><span>{booked.client_name}</span>
                </div>
              </div>
              {shop?.whatsapp && (
                <button className="bk-wa-btn" onClick={handleWhatsApp}>
                  <i className="fa-brands fa-whatsapp"></i> Confirmar no WhatsApp
                </button>
              )}
              <button className="bk-new-btn" onClick={resetForm}>
                <i className="fa-solid fa-plus"></i> Novo Agendamento
              </button>
            </div>
          </div>
        )}

        {step < 4 && (
          <>
            {/* HERO */}
            <div className="bk-hero">
              <span className="bk-hero-tag">Agendamento Online</span>
              <h1 className="bk-hero-title">
                Reserve seu horário<br /><em>em {shop.name}</em>
              </h1>
              <p className="bk-hero-sub">Escolha o serviço, data e horário disponível</p>
            </div>

            {/* STEPS */}
            <div className="bk-steps">
              {[
                { n: 1, label: 'Serviço' },
                { n: 2, label: 'Data & Horário' },
                { n: 3, label: 'Seus Dados' },
              ].map(({ n, label }, i, arr) => (
                <div key={n} className="bk-step">
                  <div className={`bk-step-dot${stepDone(n) ? ' done' : stepActive(n) ? ' active' : ''}`}>
                    {stepDone(n) ? <i className="fa-solid fa-check" style={{ fontSize: '0.75rem' }}></i> : n}
                  </div>
                  <span className={`bk-step-label${stepActive(n) ? ' active' : ''}`}>{label}</span>
                  {i < arr.length - 1 && <div className="bk-step-line"></div>}
                </div>
              ))}
            </div>

            {/* CONTENT */}
            <div className="bk-content">
              {/* STEP 1: SERVICE */}
              {step === 1 && (
                <div>
                  <div className="bk-section-title">Escolha o <span>Serviço</span></div>
                  <div className="service-grid">
                    {SERVICES.map((s) => (
                      <button
                        key={s.name}
                        className={`service-btn${s.highlight ? ' highlight' : ''}${form.service === s.name ? ' selected' : ''}`}
                        onClick={() => { setForm((f) => ({ ...f, service: s.name })); setStep(2) }}
                      >
                        {s.highlight && <span className="service-badge">★ Combo</span>}
                        <i className={`service-btn-icon ${s.icon}`}></i>
                        <div className="service-btn-name">{s.name}</div>
                        <div className="service-btn-price">{s.price}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: DATE & TIME */}
              {step === 2 && (
                <div>
                  <div className="bk-section-title">Escolha <span>Data & Horário</span></div>

                  <div className="bk-date-wrap">
                    <label className="bk-label"><i className="fa-regular fa-calendar"></i> Data</label>
                    <input
                      type="date" className="bk-date-input"
                      value={form.date} min={minDate()}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value, time: '' }))}
                    />
                  </div>

                  {form.date && (
                    <div style={{ marginBottom: 28 }}>
                      <label className="bk-label"><i className="fa-regular fa-clock"></i> Horário Disponível</label>
                      {slotsLoading ? (
                        <div className="slots-loading">
                          <i className="fa-solid fa-spinner fa-spin"></i> Carregando horários...
                        </div>
                      ) : (
                        <div className="slots-grid">
                          {slots.map(({ time, available }) => (
                            <button
                              key={time}
                              className={`slot-btn${form.time === time ? ' selected' : ''}`}
                              disabled={!available}
                              onClick={() => setForm((f) => ({ ...f, time }))}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bk-nav">
                    <button className="bk-nav-back" onClick={() => setStep(1)}>
                      <i className="fa-solid fa-arrow-left"></i> Voltar
                    </button>
                    <button
                      className="bk-nav-next"
                      disabled={!form.date || !form.time}
                      onClick={() => setStep(3)}
                    >
                      Continuar <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PERSONAL INFO */}
              {step === 3 && (
                <form onSubmit={handleSubmit}>
                  <div className="bk-section-title">Seus <span>Dados</span></div>

                  <div className="bk-summary">
                    <div className="bk-summary-item"><i className="fa-solid fa-scissors"></i> <span>{form.service}</span></div>
                    <div className="bk-summary-item"><i className="fa-regular fa-calendar"></i> <span>{fmtDate(form.date)}</span></div>
                    <div className="bk-summary-item"><i className="fa-regular fa-clock"></i> <span>{form.time}</span></div>
                  </div>

                  {error && <div className="bk-error"><i className="fa-solid fa-triangle-exclamation"></i> {error}</div>}

                  <div className="bk-form">
                    <div className="bk-field">
                      <label className="bk-label">Seu Nome</label>
                      <input
                        type="text" className="bk-input"
                        value={form.client_name} placeholder="Ex: Rafael Silva"
                        onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="bk-field">
                      <label className="bk-label">Telefone / WhatsApp</label>
                      <input
                        type="tel" className="bk-input"
                        value={form.client_phone} placeholder="(51) 9 9999-9999"
                        onChange={(e) => setForm((f) => ({ ...f, client_phone: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="bk-nav" style={{ marginTop: 24 }}>
                    <button type="button" className="bk-nav-back" onClick={() => setStep(2)}>
                      <i className="fa-solid fa-arrow-left"></i> Voltar
                    </button>
                    <button type="submit" className="bk-submit" disabled={submitting}>
                      {submitting
                        ? <><i className="fa-solid fa-spinner fa-spin"></i> Aguarde...</>
                        : <><i className="fa-solid fa-calendar-check"></i> Confirmar Agendamento</>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
