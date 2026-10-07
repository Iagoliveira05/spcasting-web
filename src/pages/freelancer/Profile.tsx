import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronLeft, Save } from "lucide-react";
import { CityPicker } from "../../components/profile/CityPicker";
import { CompositeUpload } from "../../components/profile/CompositeUpload";
import { useAuth } from "../../contexts/AuthContext";
import { saveUserProfile } from "../../services/userService";
import type { City } from "../../types/City";
import type { CompositeType } from "../../types/User";

export function ProfilePage() {
  const { user, profile, refreshProfile, configured } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [birthDate, setBirthDate] = useState(profile?.birthDate || "");
  const [instagram, setInstagram] = useState(profile?.instagram || "");
  const [cities, setCities] = useState<City[]>(profile?.cities || []);
  const [composite, setComposite] = useState({
    compositePath: profile?.compositePath || "",
    compositeUrl: profile?.compositeUrl || "",
    compositeType: profile?.compositeType || (null as CompositeType | null),
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await saveUserProfile(user.uid, {
        name: name.trim(),
        email: user.email || "",
        phone: phone.replace(/\D/g, ""),
        birthDate,
        instagram: instagram.trim(),
        cities,
        ...composite,
      });
      await refreshProfile();
      setMessage("Perfil salvo com sucesso.");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível salvar o perfil.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="content-wrap form-page">
      <Link to="/vagas" className="back-link">
        <ChevronLeft size={16} /> Voltar às oportunidades
      </Link>
      <div className="eyebrow">SEU PERFIL PROFISSIONAL</div>
      <h1>
        Conte um pouco
        <br />
        sobre você<span>.</span>
      </h1>
      <p className="form-page-intro">
        Essas informações ajudam a SPCasting a encontrar trabalhos que combinam
        com você.
      </p>
      {!configured && (
        <div className="inline-notice">
          Configure o Firebase para salvar e sincronizar seu perfil.
        </div>
      )}
      {message && (
        <div className="success-notice">
          <Check size={16} />
          {message}
        </div>
      )}
      {error && <div className="field-error">{error}</div>}
      <form className="profile-form" onSubmit={(event) => void submit(event)}>
        <div className="form-section-heading">
          <span>01</span>
          <div>
            <strong>Dados pessoais</strong>
            <small>Suas informações de contato</small>
          </div>
        </div>
        <div className="form-grid">
          <label className="form-field span-two">
            Nome completo
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Como podemos chamar você?"
            />
          </label>
          <label className="form-field">
            E-mail
            <input type="email" value={user?.email || ""} disabled />
          </label>
          <label className="form-field">
            Telefone / WhatsApp
            <input
              required
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="(11) 99999-9999"
            />
          </label>
          <label className="form-field">
            Data de nascimento
            <input
              required
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
            />
          </label>
          <label className="form-field">
            Instagram
            <input
              value={instagram}
              onChange={(event) => setInstagram(event.target.value)}
              placeholder="@seuperfil"
            />
          </label>
        </div>
        <div className="form-section-heading">
          <span>02</span>
          <div>
            <strong>Onde você pode trabalhar?</strong>
            <small>Adicione todas as cidades disponíveis</small>
          </div>
        </div>
        <CityPicker cities={cities} onChange={setCities} />
        <div className="form-section-heading">
          <span>03</span>
          <div>
            <strong>Seu composite</strong>
            <small>Um material para apresentar seu perfil</small>
          </div>
        </div>
        {user && (
          <CompositeUpload
            uid={user.uid}
            value={composite}
            onChange={setComposite}
          />
        )}
        <div className="form-actions">
          <button
            type="submit"
            className="primary-button"
            disabled={busy || !configured}
          >
            {busy ? "Salvando..." : "Salvar meu perfil"} <Save size={16} />
          </button>
        </div>
      </form>
    </section>
  );
}
