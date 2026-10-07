import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Chrome, LockKeyhole } from 'lucide-react'
import { loginWithEmail, loginWithGoogle } from '../../services/authService'
import { useAuth } from '../../contexts/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { configured } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const notice = (location.state as { message?: string } | null)?.message

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true); setError('')
    try { await loginWithEmail(email, password); navigate('/vagas') }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível entrar.') }
    finally { setBusy(false) }
  }

  async function googleLogin() {
    setBusy(true); setError('')
    try {
      const result = await loginWithGoogle()
      navigate(result.needsProfile ? '/perfil' : '/vagas')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível entrar com Google.') }
    finally { setBusy(false) }
  }

  return (
    <section className="auth-wrap">
      <Link to="/vagas" className="back-link"><ArrowLeft size={15} /> Voltar às oportunidades</Link>
      <div className="auth-panel">
        <div className="auth-emblem"><LockKeyhole size={19} /></div>
        <div className="eyebrow">BEM-VINDA(O) DE VOLTA</div>
        <h1>Entre na sua<br />conta<span>.</span></h1>
        <p className="auth-intro">Acesse suas oportunidades e acompanhe suas inscrições.</p>
        {(notice || !configured) && <div className="inline-notice">{notice || 'O Firebase ainda não está configurado. O login ficará disponível após preencher o arquivo .env.'}</div>}
        <form onSubmit={(event) => void submit(event)}>
          <label className="form-field">E-mail<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" /></label>
          <label className="form-field">Senha<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" /></label>
          {error && <p className="field-error">{error}</p>}
          <button className="primary-button" type="submit" disabled={busy || !configured}>{busy ? 'Entrando...' : 'Entrar'} <span>→</span></button>
        </form>
        <div className="auth-divider"><span />ou<span /></div>
        <button className="google-button" type="button" disabled={busy || !configured} onClick={() => void googleLogin()}><Chrome size={17} /> Continuar com Google</button>
        <p className="auth-switch">Ainda não tem conta? <Link to="/cadastro">Criar cadastro</Link></p>
      </div>
    </section>
  )
}
