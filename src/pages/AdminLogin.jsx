import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Barlow:wght@300;400;500;600&family=Barlow+Condensed:wght@700;800&display=swap');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --gold: #C9A84C; --gold-light: #E8C76A;
    --black: #0A0A0A; --black-mid: #1A1A1A;
    --gray-dark: #222; --gray-mid: #555; --gray-light: #888;
    --white: #F5F0E8;
  }
  body { background: var(--black); font-family: 'Barlow', sans-serif; color: var(--white); }

  .auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: var(--black);
    position: relative;
    overflow: hidden;
  }
  .auth-page::before {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%);
    pointer-events: none;
  }
  .auth-card {
    width: 100%;
    max-width: 420px;
    background: var(--black-mid);
    border: 1px solid rgba(201,168,76,0.15);
    padding: 48px 40px;
    position: relative;
    z-index: 1;
  }
  .auth-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--gold), var(--gold-light), var(--gold));
  }
  @media (max-width: 480px) {
    .auth-card { padding: 36px 24px; }
  }
  .auth-logo {
    font-size: 2rem;
    margin-bottom: 8px;
    color: var(--gold);
    display: block;
    text-align: center;
  }
  .auth-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    font-weight: 900;
    color: var(--white);
    text-align: center;
    margin-bottom: 6px;
  }
  .auth-subtitle {
    font-size: 0.85rem;
    color: var(--gray-light);
    text-align: center;
    margin-bottom: 32px;
    font-weight: 300;
  }
  .auth-error {
    background: rgba(220,53,69,0.12);
    border: 1px solid rgba(220,53,69,0.3);
    color: #ff6b6b;
    padding: 12px 16px;
    font-size: 0.85rem;
    margin-bottom: 20px;
    border-radius: 2px;
  }
  .auth-form { display: flex; flex-direction: column; gap: 18px; }
  .auth-field { display: flex; flex-direction: column; gap: 8px; }
  .auth-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--gold);
  }
  .auth-input {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,168,76,0.2);
    color: var(--white);
    padding: 13px 16px;
    font-family: 'Barlow', sans-serif;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.3s;
    border-radius: 2px;
    width: 100%;
  }
  .auth-input::placeholder { color: var(--gray-mid); }
  .auth-input:focus { border-color: var(--gold); }
  .auth-btn {
    margin-top: 8px;
    padding: 15px;
    background: var(--gold);
    color: var(--black);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    transition: all 0.3s;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    border-radius: 2px;
  }
  .auth-btn:hover:not(:disabled) { background: var(--gold-light); transform: translateY(-1px); }
  .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .auth-footer {
    margin-top: 24px;
    font-size: 0.85rem;
    color: var(--gray-light);
    text-align: center;
  }
  .auth-link { color: var(--gold); text-decoration: none; transition: color 0.2s; }
  .auth-link:hover { color: var(--gold-light); }
  .auth-divider {
    height: 1px;
    background: rgba(201,168,76,0.1);
    margin: 20px 0 16px;
  }
  .auth-back {
    display: block;
    text-align: center;
    font-size: 0.8rem;
    color: var(--gray-mid);
    text-decoration: none;
    transition: color 0.2s;
    font-family: 'Barlow Condensed', sans-serif;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .auth-back:hover { color: var(--gold); }
  .auth-back i { margin-right: 6px; }
`

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('barber_token', res.data.token)
      localStorage.setItem('barber_shop', JSON.stringify(res.data.barbershop))
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="auth-page">
        <div className="auth-card">
          <span className="auth-logo"><i className="fa-solid fa-scissors"></i></span>
          <h1 className="auth-title">Painel Admin</h1>
          <p className="auth-subtitle">Entre para gerenciar seus agendamentos</p>

          {error && <div className="auth-error"><i className="fa-solid fa-triangle-exclamation"></i> {error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} className="auth-input"
                placeholder="seuemail@exemplo.com" required
              />
            </div>
            <div className="auth-field">
              <label className="auth-label">Senha</label>
              <input
                type="password" name="password" value={form.password}
                onChange={handleChange} className="auth-input"
                placeholder="••••••••" required
              />
            </div>
            <button type="submit" disabled={loading} className="auth-btn">
              {loading
                ? <><i className="fa-solid fa-spinner fa-spin"></i> Entrando...</>
                : <><i className="fa-solid fa-right-to-bracket"></i> Entrar no Painel</>}
            </button>
          </form>

          <p className="auth-footer">
            Não tem conta?{' '}
            <Link to="/admin/cadastro" className="auth-link">Cadastre sua barbearia</Link>
          </p>
          <div className="auth-divider" />
          <Link to="/" className="auth-back">
            <i className="fa-solid fa-arrow-left"></i> Voltar ao site
          </Link>
        </div>
      </div>
    </>
  )
}
