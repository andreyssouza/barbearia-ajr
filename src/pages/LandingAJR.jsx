import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import logoAJR from "../assets/perfil_barbearia_ajr.jpg";
import gal1 from "../assets/ajrgaleria (1).jpg";
import gal2 from "../assets/ajrgaleria (2).jpg";
import gal3 from "../assets/ajrgaleria (3).jpg";
import gal4 from "../assets/ajrgaleria (4).jpg";
import gal5 from "../assets/ajrgaleria (5).jpg";
import gal6 from "../assets/ajrgaleria (6).jpg";
import galVideo from "../assets/ajrgaleria (1).mp4";

const WHATSAPP_URL =
  "https://wa.me/5551999999999?text=Olá!%20Vim%20pelo%20site%20e%20quero%20saber%20mais%20sobre%20os%20serviços.";

const BOOKING_URL = "/agendar/ajr-barbearia";

/* ─── GLOBAL STYLES ─── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Barlow:wght@300;400;500;600&family=Barlow+Condensed:wght@700;800&display=swap');
    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --gold: #C9A84C;
      --gold-light: #E8C76A;
      --gold-dark: #8B6914;
      --black: #0A0A0A;
      --black-soft: #111111;
      --black-mid: #1A1A1A;
      --gray-dark: #222222;
      --gray-mid: #444444;
      --gray-light: #888888;
      --white: #F5F0E8;
      --white-pure: #FFFFFF;
      --section-pad: clamp(60px, 10vw, 120px);
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: 'Barlow', sans-serif;
      background: var(--black);
      color: var(--white);
      overflow-x: hidden;
    }

    ::selection { background: var(--gold); color: var(--black); }

    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 900;
      color: var(--white);
      line-height: 1.1;
    }
    .section-title span { color: var(--gold); font-style: italic; }

    .gold-line {
      display: block;
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, var(--gold), transparent);
      margin: 1rem 0 2rem;
    }

    .reveal {
      opacity: 0;
      transform: translateY(32px);
      transition: opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1);
    }
    .reveal.visible { opacity: 1; transform: translateY(0); }

    .btn-gold {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 14px 32px;
      background: var(--gold);
      color: var(--black);
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 1rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      text-decoration: none;
      border: none;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .btn-gold::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--gold-light);
      transform: translateX(-100%);
      transition: transform 0.35s ease;
    }
    .btn-gold:hover::before { transform: translateX(0); }
    .btn-gold > * { position: relative; z-index: 1; }
    .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(201,168,76,0.35); }

    .btn-outline {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 13px 30px;
      background: transparent;
      color: var(--gold);
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 0.9rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      text-decoration: none;
      border: 1px solid var(--gold);
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn-outline:hover { background: var(--gold); color: var(--black); }

    @media (max-width: 768px) {
      .btn-gold, .btn-outline { font-size: 0.9rem; padding: 12px 24px; }
    }
  `}</style>
);

/* ─── HOOK: SCROLL REVEAL ─── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          obs.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── NAVBAR ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { label: "Serviços", href: "#servicos" },
    { label: "Galeria", href: "#galeria" },
    { label: "Depoimentos", href: "#depoimentos" },
    { label: "Localização", href: "#localizacao" },
  ];

  return (
    <>
      <style>{`
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          padding: 0 clamp(16px, 5vw, 64px); height: 72px;
          display: flex; align-items: center; justify-content: space-between;
          transition: background 0.4s ease, backdrop-filter 0.4s ease, box-shadow 0.4s ease;
        }
        .navbar.scrolled {
          background: rgba(10,10,10,0.97);
          backdrop-filter: blur(12px);
          box-shadow: 0 1px 0 rgba(201,168,76,0.15);
        }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-icon { width: 48px; height: 48px; border-radius: 50%; overflow: hidden; border: 1.5px solid var(--gold); flex-shrink: 0; }
        .nav-logo-icon img { width: 100%; height: 100%; object-fit: cover; }
        .nav-logo-text { display: flex; flex-direction: column; line-height: 1; }
        .nav-logo-text strong { font-family: 'Playfair Display', serif; font-size: 1.2rem; color: var(--white); letter-spacing: 0.05em; }
        .nav-logo-text span { font-family: 'Barlow Condensed', sans-serif; font-size: 0.6rem; color: var(--gold); letter-spacing: 0.3em; text-transform: uppercase; }
        .nav-links { display: flex; align-items: center; gap: 40px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gray-light); text-decoration: none; position: relative; transition: color 0.3s; }
        .nav-links a::after { content: ''; position: absolute; bottom: -4px; left: 0; right: 100%; height: 1px; background: var(--gold); transition: right 0.3s ease; }
        .nav-links a:hover { color: var(--gold); }
        .nav-links a:hover::after { right: 0; }
        .nav-right { display: flex; align-items: center; gap: 12px; }
        .nav-book-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 20px;
          background: var(--gold); color: var(--black);
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.82rem; font-weight: 800;
          letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none;
          border: none; cursor: pointer;
          transition: all 0.3s; position: relative; overflow: hidden;
        }
        .nav-book-btn::before { content: ''; position: absolute; inset: 0; background: var(--gold-light); transform: translateX(-100%); transition: transform 0.3s; }
        .nav-book-btn:hover::before { transform: translateX(0); }
        .nav-book-btn > * { position: relative; z-index: 1; }
        .hamburger { display: none; background: none; border: none; color: var(--white); font-size: 1.3rem; cursor: pointer; padding: 4px; }
        .mobile-menu { display: none; position: fixed; top: 72px; left: 0; right: 0; background: rgba(10,10,10,0.98); backdrop-filter: blur(12px); padding: 24px; z-index: 999; border-top: 1px solid rgba(201,168,76,0.2); transform: translateY(-100%); opacity: 0; transition: all 0.35s ease; }
        .mobile-menu.open { transform: translateY(0); opacity: 1; }
        .mobile-menu a { display: block; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--white); text-decoration: none; padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 1.1rem; transition: color 0.2s; }
        .mobile-menu a:hover { color: var(--gold); }
        .mobile-menu .btn-gold { margin-top: 20px; width: 100%; justify-content: center; }
        .nav-admin-link { font-family: 'Barlow Condensed', sans-serif; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gray-mid); text-decoration: none; transition: color 0.2s; }
        .nav-admin-link:hover { color: var(--gold); }
        @media (max-width: 900px) {
          .nav-links, .nav-right .btn-outline, .nav-right .nav-book-btn { display: none; }
          .hamburger { display: block; }
          .mobile-menu { display: block; }
        }
      `}</style>
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <a href="#" className="nav-logo">
          <div className="nav-logo-icon"><img src={logoAJR} alt="Logo Barbearia AJR" /></div>
          <div className="nav-logo-text">
            <strong>Barbearia AJR</strong>
            <span>Porto Alegre</span>
          </div>
        </a>
        <ul className="nav-links">
          {links.map((l) => (
            <li key={l.href}><a href={l.href}>{l.label}</a></li>
          ))}
        </ul>
        <div className="nav-right">
          <Link to={BOOKING_URL} className="nav-book-btn">
            <i className="fa-solid fa-calendar-check"></i>
            <span>Agendar</span>
          </Link>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-outline">
            <i className="fa-brands fa-whatsapp"></i> WhatsApp
          </a>
          <button className="hamburger" onClick={() => setMenuOpen((o) => !o)}>
            <i className={menuOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
          </button>
        </div>
      </nav>
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
        ))}
        <Link to={BOOKING_URL} className="btn-gold" onClick={() => setMenuOpen(false)}>
          <i className="fa-solid fa-calendar-check"></i> Agendar Online
        </Link>
      </div>
    </>
  );
}

/* ─── HERO ─── */
function Hero() {
  return (
    <>
      <style>{`
        .hero { width: 100%; min-height: 100vh; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; background-image: url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1800&q=80'); background-size: cover; background-position: center center; background-repeat: no-repeat; filter: grayscale(40%); z-index: 0; }
        .hero-overlay { position: absolute; inset: 0; z-index: 1; background: linear-gradient(105deg, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.85) 50%, rgba(10,10,10,0.4) 100%); }
        .hero-grain { position: absolute; inset: 0; z-index: 1; opacity: 0.03; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 200px; }
        .hero-content { position: relative; z-index: 2; width: 100%; max-width: 780px; padding: 120px clamp(16px, 6vw, 96px) 80px; }
        .hero-tag { display: inline-flex; align-items: center; gap: 10px; font-family: 'Barlow Condensed', sans-serif; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); margin-bottom: 24px; opacity: 0; animation: fadeUp 0.7s 0.2s ease forwards; }
        .hero-tag::before, .hero-tag::after { content: ''; width: 24px; height: 1px; background: var(--gold); }
        .hero-headline { font-family: 'Playfair Display', serif; font-size: clamp(3rem, 8vw, 6.5rem); font-weight: 900; line-height: 0.95; color: var(--white); margin-bottom: 28px; opacity: 0; animation: fadeUp 0.8s 0.4s ease forwards; }
        .hero-headline em { color: var(--gold); font-style: italic; display: block; }
        .hero-sub { font-size: clamp(1rem, 2.5vw, 1.2rem); color: rgba(245,240,232,0.65); font-weight: 300; line-height: 1.7; max-width: 480px; margin-bottom: 40px; opacity: 0; animation: fadeUp 0.8s 0.6s ease forwards; }
        .hero-badges { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 40px; opacity: 0; animation: fadeUp 0.8s 0.7s ease forwards; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border: 1px solid rgba(201,168,76,0.3); font-size: 0.78rem; font-weight: 600; letter-spacing: 0.05em; color: var(--gold); background: rgba(201,168,76,0.05); }
        .hero-cta { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; opacity: 0; animation: fadeUp 0.8s 0.8s ease forwards; }
        .hero-scroll { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px; color: rgba(201,168,76,0.5); font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase; animation: pulse 2s infinite; }
        .hero-scroll i { font-size: 1rem; }
        .hero-decor { position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: min(40vw, 500px); height: min(40vw, 500px); border: 1px solid rgba(201,168,76,0.08); border-radius: 50%; pointer-events: none; z-index: 2; }
        .hero-decor::before { content: ''; position: absolute; inset: 40px; border: 1px solid rgba(201,168,76,0.06); border-radius: 50%; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 0.5; transform: translateX(-50%) translateY(0); } 50% { opacity: 1; transform: translateX(-50%) translateY(6px); } }
      `}</style>
      <section className="hero" id="inicio">
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <div className="hero-grain"></div>
        <div className="hero-decor"></div>
        <div className="hero-content">
          <div className="hero-tag">Barbearia AJR — Porto Alegre</div>
          <h1 className="hero-headline">
            Seu estilo
            <br />
            <em>começa aqui.</em>
          </h1>
          <p className="hero-sub">
            Cortes precisos, barba impecável e um acabamento que faz diferença.
            Rapidez, qualidade e preço justo — sem enrolação.
          </p>
          <div className="hero-badges">
            <span className="hero-badge">
              <i className="fa-solid fa-bolt"></i> Atendimento rápido
            </span>
            <span className="hero-badge">
              <i className="fa-solid fa-calendar-check"></i> Agendamento online
            </span>
          </div>
          <div className="hero-cta">
            <Link to={BOOKING_URL} className="btn-gold">
              <i className="fa-solid fa-calendar-check"></i>
              <span>Agendar Online</span>
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-outline">
              <i className="fa-brands fa-whatsapp"></i>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
        <div className="hero-scroll">
          <span>Explorar</span>
          <i className="fa-solid fa-chevron-down"></i>
        </div>
      </section>
    </>
  );
}

/* ─── SERVICES ─── */
const services = [
  { icon: "fa-solid fa-scissors", name: "Corte", price: "R$ 30" },
  { icon: "fa-solid fa-sliders", name: "Máquina", price: "R$ 25" },
  { icon: "fa-solid fa-user-tie", name: "Barba", price: "R$ 25" },
  { icon: "fa-solid fa-star", name: "Corte + Barba", price: "R$ 50", highlight: true },
  { icon: "fa-solid fa-eye", name: "Sobrancelha", price: "R$ 10" },
  { icon: "fa-solid fa-wand-magic-sparkles", name: "Reflexo / Luzes", price: "R$ 90" },
  { icon: "fa-solid fa-snowflake", name: "Nevou / Platinado", price: "R$ 110" },
  { icon: "fa-solid fa-palette", name: "Coloração", price: "R$ 130" },
  { icon: "fa-solid fa-droplet", name: "Pigmentação", price: "R$ 20" },
  { icon: "fa-solid fa-spa", name: "Limpeza de Pele", price: "R$ 25" },
];

function Services() {
  const ref = useReveal();
  return (
    <>
      <style>{`
        .services-section { padding: var(--section-pad) clamp(16px, 6vw, 96px); background: var(--black-soft); position: relative; overflow: hidden; }
        .services-section::before { content: 'SERVIÇOS'; position: absolute; right: -20px; top: 50%; transform: translateY(-50%) rotate(90deg); font-family: 'Playfair Display', serif; font-size: clamp(4rem, 10vw, 8rem); font-weight: 900; color: rgba(201,168,76,0.03); letter-spacing: 0.2em; pointer-events: none; white-space: nowrap; }
        .services-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.1); margin-top: 3rem; }
        @media (max-width: 900px) { .services-grid { grid-template-columns: repeat(2, 1fr); } }
        .service-card { background: var(--black-soft); padding: 32px 24px; display: flex; flex-direction: column; align-items: flex-start; gap: 12px; position: relative; overflow: hidden; cursor: default; transition: background 0.3s ease; }
        .service-card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 100%; height: 2px; background: var(--gold); transition: right 0.4s ease; }
        .service-card:hover { background: var(--gray-dark); }
        .service-card:hover::after { right: 0; }
        .service-card.highlight { background: rgba(201,168,76,0.07); }
        .service-card.highlight::after { right: 0; }
        .service-icon { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(201,168,76,0.25); color: var(--gold); font-size: 1.1rem; flex-shrink: 0; transition: all 0.3s ease; }
        .service-card:hover .service-icon { background: var(--gold); color: var(--black); border-color: var(--gold); }
        .service-name { font-family: 'Barlow Condensed', sans-serif; font-size: 1rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--white); }
        .service-price { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: var(--gold); margin-top: auto; }
        .service-badge { position: absolute; top: 12px; right: 12px; font-family: 'Barlow Condensed', sans-serif; font-size: 0.6rem; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: var(--black); background: var(--gold); padding: 3px 8px; }
      `}</style>
      <section className="services-section" id="servicos">
        <div className="reveal" ref={ref}>
          <h2 className="section-title">Nossos <span>Serviços</span></h2>
          <span className="gold-line"></span>
        </div>
        <div className="services-grid">
          {services.map((s, i) => (
            <div key={i} className={`service-card${s.highlight ? " highlight" : ""}`}>
              {s.highlight && <span className="service-badge">★ Combo</span>}
              <div className="service-icon"><i className={s.icon}></i></div>
              <p className="service-name">{s.name}</p>
              <p className="service-price">{s.price}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ─── FEATURES ─── */
const features = [
  { icon: "fa-solid fa-bolt", title: "Atendimento Rápido", desc: "Sem filas intermináveis. Chegou, já vai sendo chamado." },
  { icon: "fa-solid fa-medal", title: "Profissionais Experientes", desc: "Anos de prática e técnica apurada em cada serviço." },
  { icon: "fa-solid fa-couch", title: "Ambiente Confortável", desc: "Espaço pensado para você relaxar e se sentir em casa." },
  { icon: "fa-solid fa-tag", title: "Preço Justo", desc: "Qualidade premium sem pesar no bolso. Simples assim." },
  { icon: "fa-solid fa-location-dot", title: "Localização Acessível", desc: "No coração de Porto Alegre, fácil de chegar e estacionar." },
];

function Features() {
  const ref = useReveal();
  return (
    <>
      <style>{`
        .features-section { padding: var(--section-pad) clamp(16px, 6vw, 96px); background: var(--black); display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .features-img-wrap { position: relative; aspect-ratio: 4/5; overflow: hidden; }
        .features-img-wrap img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(30%); transition: transform 0.8s ease; }
        .features-img-wrap:hover img { transform: scale(1.04); }
        .features-img-border { position: absolute; inset: 16px -16px -16px 16px; border: 1px solid rgba(201,168,76,0.2); pointer-events: none; z-index: -1; }
        .feature-item { display: flex; gap: 20px; padding: 24px 0; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: flex-start; transition: padding-left 0.3s ease; }
        .feature-item:hover { padding-left: 8px; }
        .feature-icon { width: 48px; height: 48px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: var(--gold); font-size: 1.1rem; border: 1px solid rgba(201,168,76,0.2); margin-top: 2px; transition: all 0.3s ease; }
        .feature-item:hover .feature-icon { background: var(--gold); color: var(--black); border-color: var(--gold); }
        .feature-title { font-family: 'Barlow Condensed', sans-serif; font-size: 1.1rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--white); margin-bottom: 6px; }
        .feature-desc { font-size: 0.9rem; color: var(--gray-light); line-height: 1.6; font-weight: 300; }
        @media (max-width: 900px) { .features-section { grid-template-columns: 1fr; gap: 48px; } .features-img-wrap { aspect-ratio: 16/9; } .features-img-border { display: none; } }
      `}</style>
      <section className="features-section" id="diferenciais">
        <div className="features-left reveal" ref={ref}>
          <div className="features-img-wrap">
            <img src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=900&q=80" alt="Barbeiro trabalhando" />
            <div className="features-img-border"></div>
          </div>
        </div>
        <div className="features-right">
          <h2 className="section-title">Por que a <span>AJR?</span></h2>
          <span className="gold-line"></span>
          {features.map((f, i) => (
            <div key={i} className="feature-item">
              <div className="feature-icon"><i className={f.icon}></i></div>
              <div>
                <p className="feature-title">{f.title}</p>
                <p className="feature-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ─── GALLERY ─── */
const galleryItems = [
  { type: "image", src: gal1, alt: "Corte AJR" },
  { type: "image", src: gal2, alt: "Barba AJR" },
  { type: "video", src: galVideo, alt: "Barbearia AJR" },
  { type: "image", src: gal3, alt: "Fade AJR" },
  { type: "image", src: gal4, alt: "Acabamento AJR" },
  { type: "image", src: gal5, alt: "Estilo AJR" },
  { type: "image", src: gal6, alt: "Corte clássico AJR" },
];

function Gallery() {
  const ref = useReveal();
  return (
    <>
      <style>{`
        .gallery-section { padding: var(--section-pad) clamp(16px, 6vw, 96px); background: var(--black-soft); }
        .gallery-header { margin-bottom: 3rem; }
        .gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: auto; gap: 3px; }
        .gallery-item { position: relative; overflow: hidden; aspect-ratio: 1; cursor: pointer; }
        .gallery-item:first-child { grid-column: span 2; grid-row: span 2; aspect-ratio: unset; }
        .gallery-item img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(20%); transition: transform 0.6s cubic-bezier(.22,1,.36,1), filter 0.4s ease; }
        .gallery-item:hover img { transform: scale(1.06); filter: grayscale(0%); }
        .gallery-item-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10,10,10,0.7) 0%, transparent 50%); opacity: 0; transition: opacity 0.4s ease; display: flex; align-items: flex-end; padding: 20px; }
        .gallery-item:hover .gallery-item-overlay { opacity: 1; }
        .gallery-item-label { font-family: 'Barlow Condensed', sans-serif; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold); }
        @media (max-width: 640px) { .gallery-grid { grid-template-columns: repeat(2, 1fr); } .gallery-item:first-child { grid-column: span 2; aspect-ratio: 16/9; } }
      `}</style>
      <section className="gallery-section" id="galeria">
        <div className="gallery-header reveal" ref={ref}>
          <h2 className="section-title">Nosso <span>Trabalho</span></h2>
          <span className="gold-line"></span>
        </div>
        <div className="gallery-grid">
          {galleryItems.map((item, i) => (
            <div key={i} className="gallery-item">
              {item.type === "video" ? (
                <video src={item.src} autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <img src={item.src} alt={item.alt} loading="lazy" />
              )}
              <div className="gallery-item-overlay">
                <span className="gallery-item-label">{item.alt}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ─── TESTIMONIALS ─── */
const testimonials = [
  { name: "Rafael Mendes", role: "Cliente há 2 anos", stars: 5, text: "Melhor barbearia que já fui em Porto Alegre. O corte dura semanas e o atendimento é rápido demais. Nunca precisei esperar muito.", initials: "RM" },
  { name: "Diego Alves", role: "Cliente há 1 ano", stars: 5, text: "Fiz coloração e platinado aqui e o resultado foi incrível. Profissionais que realmente entendem do que fazem. Virou minha barbearia fixa.", initials: "DA" },
  { name: "Gustavo Torres", role: "Cliente frequente", stars: 5, text: "Preço super justo para a qualidade que entregam. O ambiente é confortável, a conversa é boa e o resultado é sempre impecável.", initials: "GT" },
];

function Testimonials() {
  const ref = useReveal();
  return (
    <>
      <style>{`
        .testimonials-section { padding: var(--section-pad) clamp(16px, 6vw, 96px); background: var(--black); position: relative; overflow: hidden; }
        .testimonials-section::before { content: '"'; position: absolute; left: clamp(16px, 4vw, 64px); top: 80px; font-family: 'Playfair Display', serif; font-size: 25rem; line-height: 1; color: rgba(201,168,76,0.04); pointer-events: none; }
        .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; margin-top: 3rem; }
        .testimonial-card { background: var(--black-mid); border: 1px solid rgba(201,168,76,0.1); padding: 36px 32px; position: relative; transition: border-color 0.3s, transform 0.3s; }
        .testimonial-card::before { content: ''; position: absolute; top: 0; left: 0; width: 0; height: 2px; background: var(--gold); transition: width 0.5s ease; }
        .testimonial-card:hover { border-color: rgba(201,168,76,0.3); transform: translateY(-4px); }
        .testimonial-card:hover::before { width: 100%; }
        .testimonial-stars { display: flex; gap: 4px; margin-bottom: 20px; color: var(--gold); font-size: 0.85rem; }
        .testimonial-text { font-size: 0.95rem; line-height: 1.75; color: rgba(245,240,232,0.7); font-weight: 300; margin-bottom: 28px; font-style: italic; }
        .testimonial-author { display: flex; align-items: center; gap: 14px; }
        .testimonial-avatar { width: 44px; height: 44px; border-radius: 50%; background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.25); display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 0.9rem; font-weight: 700; color: var(--gold); flex-shrink: 0; }
        .testimonial-name { font-family: 'Barlow Condensed', sans-serif; font-size: 1rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--white); }
        .testimonial-role { font-size: 0.78rem; color: var(--gray-light); font-weight: 300; margin-top: 2px; }
      `}</style>
      <section className="testimonials-section" id="depoimentos">
        <div className="reveal" ref={ref}>
          <h2 className="section-title">O que dizem <span>sobre nós</span></h2>
          <span className="gold-line"></span>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-stars">
                {Array.from({ length: t.stars }).map((_, j) => <i key={j} className="fa-solid fa-star"></i>)}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.initials}</div>
                <div>
                  <p className="testimonial-name">{t.name}</p>
                  <p className="testimonial-role">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ─── LOCATION ─── */
function Location() {
  const ref = useReveal();
  return (
    <>
      <style>{`
        .location-section { padding: var(--section-pad) clamp(16px, 6vw, 96px); background: var(--black-soft); display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start; }
        .location-map { position: relative; overflow: hidden; border: 1px solid rgba(201,168,76,0.15); }
        .location-map iframe { width: 100%; height: 420px; border: none; display: block; filter: grayscale(30%) invert(5%); }
        .location-detail { display: flex; align-items: flex-start; gap: 16px; margin-top: 24px; padding: 20px; border: 1px solid rgba(201,168,76,0.08); background: rgba(255,255,255,0.02); transition: border-color 0.3s; }
        .location-detail:hover { border-color: rgba(201,168,76,0.2); }
        .location-detail-icon { width: 40px; height: 40px; flex-shrink: 0; border: 1px solid rgba(201,168,76,0.25); display: flex; align-items: center; justify-content: center; color: var(--gold); font-size: 1rem; }
        .location-detail-label { font-family: 'Barlow Condensed', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 4px; }
        .location-detail-value { font-size: 0.95rem; color: var(--white); font-weight: 400; line-height: 1.5; }
        @media (max-width: 900px) { .location-section { grid-template-columns: 1fr; gap: 40px; } .location-map iframe { height: 300px; } }
      `}</style>
      <section className="location-section" id="localizacao">
        <div className="location-info">
          <div className="reveal" ref={ref}>
            <h2 className="section-title">Nos <span>Encontre</span></h2>
            <span className="gold-line"></span>
          </div>
          <div className="location-detail">
            <div className="location-detail-icon"><i className="fa-solid fa-location-dot"></i></div>
            <div>
              <p className="location-detail-label">Endereço</p>
              <p className="location-detail-value">Rua Gomes de Freitas<br />Porto Alegre – RS</p>
            </div>
          </div>
          <div className="location-detail">
            <div className="location-detail-icon"><i className="fa-solid fa-clock"></i></div>
            <div>
              <p className="location-detail-label">Horário de Funcionamento</p>
              <p className="location-detail-value">Seg – Sex: 9h às 20h<br />Sábado: 9h às 18h</p>
            </div>
          </div>
          <div className="location-detail">
            <div className="location-detail-icon"><i className="fa-brands fa-whatsapp"></i></div>
            <div>
              <p className="location-detail-label">WhatsApp</p>
              <p className="location-detail-value">(51) 9 9999-9999</p>
            </div>
          </div>
          <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
            <Link to={BOOKING_URL} className="btn-gold">
              <i className="fa-solid fa-calendar-check"></i>
              <span>Agendar Online</span>
            </Link>
          </div>
        </div>
        <div className="location-map">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3453.5123456789!2d-51.2177!3d-30.0346!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95199c7b7db9c3c1%3A0x0!2sRua+Gomes+de+Freitas%2C+Porto+Alegre+-+RS!5e0!3m2!1spt!2sbr!4v1699900000000"
            allowFullScreen="" loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localização Barbearia AJR"
          ></iframe>
        </div>
      </section>
    </>
  );
}

/* ─── CTA FINAL ─── */
function FinalCTA() {
  const ref = useReveal();
  return (
    <>
      <style>{`
        .cta-section { padding: var(--section-pad) clamp(16px, 6vw, 96px); background: var(--black); text-align: center; position: relative; overflow: hidden; }
        .cta-section::before { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%); pointer-events: none; }
        .cta-section::after { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 1px; height: 80px; background: linear-gradient(to bottom, transparent, rgba(201,168,76,0.4)); }
        .cta-inner { position: relative; z-index: 1; max-width: 640px; margin: 0 auto; }
        .cta-eyebrow { font-family: 'Barlow Condensed', sans-serif; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.35em; text-transform: uppercase; color: var(--gold); margin-bottom: 24px; display: block; }
        .cta-headline { font-family: 'Playfair Display', serif; font-size: clamp(2.2rem, 5vw, 4rem); font-weight: 900; line-height: 1.1; color: var(--white); margin-bottom: 20px; }
        .cta-headline span { color: var(--gold); font-style: italic; }
        .cta-sub { font-size: 1rem; color: var(--gray-light); font-weight: 300; margin-bottom: 40px; line-height: 1.6; }
        .cta-btn-wrap { display: flex; justify-content: center; align-items: center; gap: 16px; flex-wrap: wrap; }
        .btn-gold-lg { padding: 18px 48px; font-size: 1.05rem; }
      `}</style>
      <section className="cta-section">
        <div className="cta-inner reveal" ref={ref}>
          <span className="cta-eyebrow">— Reserve agora —</span>
          <h2 className="cta-headline">
            Vem dar um trato<br />no <span>visual hoje.</span>
          </h2>
          <p className="cta-sub">
            Agende online em segundos ou fale direto no WhatsApp. A AJR tá esperando você.
          </p>
          <div className="cta-btn-wrap">
            <Link to={BOOKING_URL} className="btn-gold btn-gold-lg">
              <i className="fa-solid fa-calendar-check"></i>
              <span>Agendar Online</span>
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-outline" style={{ padding: '17px 40px' }}>
              <i className="fa-brands fa-whatsapp"></i>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <>
      <style>{`
        .footer { background: var(--black-soft); border-top: 1px solid rgba(201,168,76,0.1); padding: 40px clamp(16px, 6vw, 96px); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
        .footer-copy { font-size: 0.8rem; color: var(--gray-mid); font-weight: 300; }
        .footer-copy strong { color: var(--gold); font-weight: 600; }
        .footer-socials { display: flex; gap: 16px; align-items: center; }
        .footer-social { width: 36px; height: 36px; border: 1px solid rgba(201,168,76,0.2); display: flex; align-items: center; justify-content: center; color: var(--gray-light); font-size: 0.9rem; text-decoration: none; transition: all 0.3s ease; }
        .footer-social:hover { background: var(--gold); color: var(--black); border-color: var(--gold); }
        .footer-admin-link { font-family: 'Barlow Condensed', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.15); text-decoration: none; transition: color 0.2s; }
        .footer-admin-link:hover { color: var(--gold); }
      `}</style>
      <footer className="footer">
        <p className="footer-copy">© 2025 <strong>Barbearia AJR</strong>. Todos os direitos reservados.</p>
        <div className="footer-socials">
          <a href="#" className="footer-social"><i className="fa-brands fa-instagram"></i></a>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="footer-social"><i className="fa-brands fa-whatsapp"></i></a>
          <Link to="/admin/login" className="footer-admin-link">Painel</Link>
        </div>
      </footer>
    </>
  );
}

/* ─── WHATSAPP FLOAT ─── */
function WhatsAppFloat() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return (
    <>
      <style>{`
        .wa-float { position: fixed; bottom: 32px; right: 32px; z-index: 900; width: 58px; height: 58px; background: #25D366; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; text-decoration: none; box-shadow: 0 4px 24px rgba(37,211,102,0.4); opacity: 0; transform: scale(0.8); pointer-events: none; transition: all 0.4s cubic-bezier(.22,1,.36,1); }
        .wa-float.visible { opacity: 1; transform: scale(1); pointer-events: all; }
        .wa-float:hover { transform: scale(1.08); box-shadow: 0 8px 32px rgba(37,211,102,0.5); }
        .wa-float::before { content: ''; position: absolute; inset: -6px; border: 1px solid rgba(37,211,102,0.3); animation: ripple 2.5s infinite; }
        @keyframes ripple { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1.4); opacity: 0; } }
        @media (max-width: 600px) { .wa-float { bottom: 20px; right: 20px; width: 52px; height: 52px; font-size: 1.3rem; } }
      `}</style>
      <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className={`wa-float${visible ? " visible" : ""}`}>
        <i className="fa-brands fa-whatsapp"></i>
      </a>
    </>
  );
}

/* ─── APP ─── */
export default function LandingAJR() {
  return (
    <>
      <GlobalStyles />
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Features />
        <Gallery />
        <Testimonials />
        <Location />
        <FinalCTA />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
