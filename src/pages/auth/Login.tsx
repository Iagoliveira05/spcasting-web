import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { GoogleIcon } from "../../components/BrandIcons";
import { loginWithEmail, loginWithGoogle } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { configured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const notice = (location.state as { message?: string } | null)?.message;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await loginWithEmail(email, password);
      navigate(
        result.isAdmin ? "/admin" : result.needsProfile ? "/perfil" : "/vagas",
      );
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Não foi possível entrar.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function googleLogin() {
    setBusy(true);
    setError("");
    try {
      const result = await loginWithGoogle();
      navigate(
        result.isAdmin ? "/admin" : result.needsProfile ? "/perfil" : "/vagas",
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível entrar com Google.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-wrap">
      <Link to="/sobre" className="back-link">
        <ArrowLeft size={15} /> Voltar para a página inicial
      </Link>
      <div className="auth-panel">
        <div className="auth-emblem">
          <LockKeyhole size={19} />
        </div>
        <div className="eyebrow">BEM-VINDA(O) DE VOLTA</div>
        <h1>
          Entre na sua
          <br />
          conta<span>.</span>
        </h1>
        <p className="auth-intro">
          Acesse suas oportunidades e acompanhe suas inscrições.
        </p>
        {(notice || !configured) && (
          <div className="inline-notice">
            {notice ||
              "O Firebase ainda não está configurado. O login ficará disponível após preencher o arquivo .env."}
          </div>
        )}
        <form onSubmit={(event) => void submit(event)}>
          <label className="form-field">
            E-mail
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@email.com"
            />
          </label>
          <div className="form-field">
            <label htmlFor="login-password">Senha</label>
            <span className="password-field">
              <input
                id="login-password"
                required
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Sua senha"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Ocultar senha" : "Visualizar senha"}
                aria-pressed={showPassword}
                title={showPassword ? "Ocultar senha" : "Visualizar senha"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </div>
          {error && <p className="field-error">{error}</p>}
          <button
            className="primary-button"
            type="submit"
            disabled={busy || !configured}
          >
            {busy ? "Entrando..." : "Entrar"} <span>→</span>
          </button>
        </form>
        <div className="auth-divider">
          <span />
          ou
          <span />
        </div>
        <button
          className="google-button"
          type="button"
          disabled={busy || !configured}
          onClick={() => void googleLogin()}
        >
          <GoogleIcon size={17} /> Continuar com Google
        </button>
        <p className="auth-switch">
          Ainda não tem conta? <Link to="/cadastro">Criar cadastro</Link>
        </p>
      </div>
    </section>
  );
}
