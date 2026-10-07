import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UserRoundPlus } from "lucide-react";
import { registerWithEmail } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

export function RegisterPage() {
  const navigate = useNavigate();
  const { configured } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <section className="auth-wrap">
      <Link to="/vagas" className="back-link">
        <ArrowLeft size={15} /> Voltar às oportunidades
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
          <label className="form-field">
            <span className="field-label"><span>Senha</span><small>Obrigatório</small></span>
            <input
              required
              type="password"
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo de 6 caracteres"
            />
            <span className="field-hint">Use pelo menos 6 caracteres.</span>
          </label>
          {error && <p className="field-error">{error}</p>}
          <button
            className="primary-button"
            type="submit"
            disabled={busy || !configured}
          >
            {busy ? "Criando conta..." : "Criar minha conta"} <span>→</span>
          </button>
        </form>
        <p className="auth-switch">
          Já tem cadastro? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </section>
  );
}
