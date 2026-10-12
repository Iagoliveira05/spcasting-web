import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, UserRoundPlus } from "lucide-react";
import { GoogleIcon } from "../../components/BrandIcons";
import { loginWithGoogle, registerWithEmail } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

export function RegisterPage() {
  const navigate = useNavigate();
  const { configured } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await registerWithEmail(name.trim(), email.trim(), password);
      navigate("/perfil");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível criar sua conta.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function googleRegister() {
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
          : "Não foi possível criar a conta com Google.",
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
          <UserRoundPlus size={19} />
        </div>
        <div className="eyebrow">FAÇA PARTE DA REDE</div>
        <h1>
          Seu talento
          <br />
          abre portas<span>.</span>
        </h1>
        <p className="auth-intro">
          Crie seu acesso e encontre trabalhos temporários na sua região.
        </p>
        <div className="required-fields-note">
          <span>Obrigatórios</span>
          Todos os campos abaixo são necessários para criar sua conta.
        </div>
        {!configured && (
          <div className="inline-notice">
            Configure o Firebase no arquivo .env para ativar o cadastro.
          </div>
        )}
        <form onSubmit={(event) => void submit(event)}>
          <label className="form-field">
            <span className="field-label"><span>Nome completo</span><small>Obrigatório</small></span>
            <input
              required
              minLength={2}
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Seu nome completo"
            />
          </label>
          <label className="form-field">
            <span className="field-label"><span>E-mail</span><small>Obrigatório</small></span>
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
            <label className="field-label" htmlFor="register-password"><span>Senha</span><small>Obrigatório</small></label>
            <span className="password-field">
              <input
                id="register-password"
                required
                type={showPassword ? "text" : "password"}
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo de 6 caracteres"
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
            <span className="field-hint">Use pelo menos 6 caracteres.</span>
          </div>
          {error && <p className="field-error">{error}</p>}
          <button
            className="primary-button"
            type="submit"
            disabled={busy || !configured}
          >
            {busy ? "Criando conta..." : "Criar minha conta"} <span>→</span>
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
          onClick={() => void googleRegister()}
        >
          <GoogleIcon size={17} /> Cadastrar com Google
        </button>
        <p className="auth-switch">
          Já tem cadastro? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </section>
  );
}
