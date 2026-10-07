import { useState, type ReactNode } from "react";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CircleUserRound,
  ClipboardList,
  Menu,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import "./SPCastingApp.css";

const navigation = [
  { to: "/vagas", label: "Oportunidades", icon: BriefcaseBusiness },
  { to: "/inscricoes", label: "Minhas inscrições", icon: ClipboardList },
  { to: "/perfil", label: "Meu perfil", icon: CircleUserRound },
];

function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-frame">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <NavLink
          className="brand"
          to="/vagas"
          onClick={() => setMenuOpen(false)}
        >
          <span className="brand-mark">SP</span>
          <span>
            SPCasting<small>REDE DE TALENTOS</small>
          </span>
        </NavLink>
        <div className="workspace-label">ÁREA DO FREELANCER</div>
        <nav className="side-nav" aria-label="Navegação principal">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={18} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="online-dot" /> Plataforma em configuração
          <NavLink to="/login" className="admin-link">
            Acesso administrativo <ArrowRight size={15} />
          </NavLink>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="scrim"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <main className="main-area">
        <header className="topbar">
          <button
            className="menu-toggle"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="breadcrumb">
            SPCasting <span>/</span> <strong>Oportunidades</strong>
          </div>
          <NavLink to="/login" className="login-button">
            Entrar <ArrowRight size={16} />
          </NavLink>
        </header>
        <Routes>
          <Route path="/" element={<Opportunities />} />
          <Route path="/vagas" element={<Opportunities />} />
          <Route
            path="/inscricoes"
            element={
              <PlaceholderPage
                title="Minhas inscrições"
                icon={<CalendarDays />}
              />
            }
          />
          <Route
            path="/perfil"
            element={
              <PlaceholderPage title="Meu perfil" icon={<CircleUserRound />} />
            }
          />
          <Route
            path="/login"
            element={
              <PlaceholderPage
                title="Acesse sua conta"
                icon={<CircleUserRound />}
              />
            }
          />
          <Route path="*" element={<Opportunities />} />
        </Routes>
        <footer className="page-footer">
          <span>SPCasting © 2026</span>
          <span>Oportunidades para quem faz acontecer.</span>
        </footer>
      </main>
      <nav className="mobile-nav" aria-label="Navegação móvel">
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) => (isActive ? "mobile-active" : "")}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function Opportunities() {
  const [search, setSearch] = useState("");

  return (
    <section className="content-wrap">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <Sparkles size={14} /> TRABALHOS TEMPORÁRIOS
          </div>
          <h1>
            Seu próximo trabalho
            <br className="desktop-break" /> começa por aqui<span>.</span>
          </h1>
          <p>Encontre oportunidades de eventos que combinam com você.</p>
        </div>
        <div className="heading-art" aria-hidden="true">
          <div className="art-circle">
            <BriefcaseBusiness size={34} strokeWidth={1.4} />
          </div>
          <span className="art-stamp">
            SP
            <br />
            CASTING
          </span>
        </div>
      </div>

      <div className="filter-row">
        <label className="search-field">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Busque por vaga ou cidade"
            aria-label="Buscar vagas"
          />
        </label>
        <span className="results-count">0 oportunidades</span>
      </div>

      <div className="setup-notice">
        <span className="notice-mark">i</span>
        <div>
          <strong>Conexão com Firebase pendente</strong>
          <p>
            Configure as variáveis de ambiente para carregar vagas e ativar os
            recursos da plataforma.
          </p>
        </div>
        <ArrowRight className="notice-arrow" size={18} />
      </div>

      <div className="empty-state">
        <div className="empty-icon">
          <BriefcaseBusiness size={23} />
        </div>
        <h2>
          {search
            ? "Nenhum resultado encontrado"
            : "Nenhuma oportunidade por enquanto"}
        </h2>
        <p>
          {search
            ? "Tente buscar por outro termo."
            : "As novas vagas aparecerão aqui assim que forem publicadas pela SPCasting."}
        </p>
        {search && (
          <button className="text-button" onClick={() => setSearch("")}>
            Limpar busca <ArrowRight size={15} />
          </button>
        )}
      </div>
      <div className="bottom-note">
        <span className="note-line" />
        <span>Novas oportunidades, direto para você.</span>
        <span className="note-line" />
      </div>
    </section>
  );
}

function PlaceholderPage({ title, icon }: { title: string; icon: ReactNode }) {
  return (
    <section className="content-wrap subpage">
      <div className="eyebrow">SPCASTING</div>
      <h1>
        {title}
        <span>.</span>
      </h1>
      <div className="setup-notice">
        <span className="notice-mark">i</span>
        <div>
          <strong>Área pronta para conectar</strong>
          <p>
            Esta página será habilitada após configurar o Firebase e concluir a
            autenticação.
          </p>
        </div>
      </div>
      <div className="subpage-icon">{icon}</div>
    </section>
  );
}

export default function SPCastingApp() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
