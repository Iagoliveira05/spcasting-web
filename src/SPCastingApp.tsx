import { useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  ClipboardList,
  CircleUserRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  X,
} from "lucide-react";
import { AdminRoute } from "./routes/AdminRoute";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { logout } from "./services/authService";
import { LoginPage } from "./pages/auth/Login";
import { RegisterPage } from "./pages/auth/Register";
import { JobsPage } from "./pages/freelancer/Jobs";
import { JobDetailsPage } from "./pages/freelancer/JobDetails";
import { MyApplicationsPage } from "./pages/freelancer/MyApplications";
import { ProfilePage } from "./pages/freelancer/Profile";
import { AdminDashboardPage } from "./pages/admin/Dashboard";
import { AdminJobsPage } from "./pages/admin/Jobs";
import { CreateJobPage } from "./pages/admin/CreateJob";
import { CandidatesPage } from "./pages/admin/Candidates";
import "./SPCastingApp.css";
import "./SPCastingPages.css";

const freelancerNavigation = [
  { to: "/vagas", label: "Oportunidades", icon: BriefcaseBusiness },
  { to: "/inscricoes", label: "Minhas inscrições", icon: ClipboardList },
  { to: "/perfil", label: "Meu perfil", icon: CircleUserRound },
];
const adminNavigation = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/vagas", label: "Vagas", icon: BriefcaseBusiness },
  { to: "/admin/vagas/nova", label: "Criar vaga", icon: Plus },
];

function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const { user, profile, configured } = useAuth();
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith("/admin");
  const navigation = isAdminArea ? adminNavigation : freelancerNavigation;

  async function handleLogout() {
    try {
      await logout();
      setMenuOpen(false);
    } catch (reason) {
      setLogoutError(
        reason instanceof Error ? reason.message : "Não foi possível sair.",
      );
    }
  }

  return (
    <div className="app-frame">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <Link
          className="brand"
          to={isAdminArea ? "/admin" : "/vagas"}
          onClick={() => setMenuOpen(false)}
        >
          <span className="brand-mark">SP</span>
          <span>
            SPCasting<small>REDE DE TALENTOS</small>
          </span>
        </Link>
        <div className="workspace-label">
          {isAdminArea ? "AGÊNCIA SPCasting" : "ÁREA DO FREELANCER"}
        </div>
        <nav className="side-nav" aria-label="Navegação principal">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin"}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={18} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
          {!isAdminArea && profile?.role === "admin" && (
            <NavLink to="/admin" className="nav-item">
              <LayoutDashboard size={18} />
              Painel administrativo
            </NavLink>
          )}
        </nav>
        <div className="sidebar-bottom">
          <span className={`online-dot ${configured ? "connected-dot" : ""}`} />
          {configured ? "Firebase conectado" : "Firebase não configurado"}
          {user ? (
            <button
              className="admin-link sidebar-logout"
              onClick={() => void handleLogout()}
            >
              Sair da conta <LogOut size={15} />
            </button>
          ) : (
            <NavLink to="/login" className="admin-link">
              Entrar na plataforma <ArrowRight size={15} />
            </NavLink>
          )}
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
            SPCasting <span>/</span>{" "}
            <strong>{isAdminArea ? "Administração" : "Oportunidades"}</strong>
          </div>
          {user ? (
            <button
              className="login-button"
              onClick={() => void handleLogout()}
            >
              {profile?.name?.split(" ")[0] || "Sair"} <LogOut size={15} />
            </button>
          ) : (
            <NavLink to="/login" className="login-button">
              Entrar <ArrowRight size={16} />
            </NavLink>
          )}
        </header>
        {logoutError && <div className="inline-notice">{logoutError}</div>}
        <Routes>
          <Route path="/" element={<Navigate to="/vagas" replace />} />
          <Route path="/vagas" element={<JobsPage />} />
          <Route path="/vagas/:jobId" element={<JobDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/inscricoes" element={<MyApplicationsPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/vagas" element={<AdminJobsPage />} />
            <Route path="/admin/vagas/nova" element={<CreateJobPage />} />
            <Route
              path="/admin/vagas/:jobId/editar"
              element={<CreateJobPage edit />}
            />
            <Route
              path="/admin/vagas/:jobId/candidatos"
              element={<CandidatesPage />}
            />
          </Route>
          <Route path="*" element={<Navigate to="/vagas" replace />} />
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
            end={to === "/admin"}
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

export default function SPCastingApp() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}
