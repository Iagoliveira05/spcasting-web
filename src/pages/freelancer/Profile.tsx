import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Save } from "lucide-react";
import { Toast, type ToastMessage } from "../../components/Toast";
import { CityPicker } from "../../components/profile/CityPicker";
import { CompositeUpload } from "../../components/profile/CompositeUpload";
import { ProfilePhotoUpload } from "../../components/profile/ProfilePhotoUpload";
import { useAuth } from "../../hooks/useAuth";
import { saveUserProfile } from "../../services/userService";
import { deleteComposite } from "../../services/compositeService";
import { deleteProfilePhoto } from "../../services/profilePhotoService";
import type { City } from "../../types/City";
import type { CompositeType } from "../../types/User";
import { normalizeInstagram } from "../../utils/instagram";

export function ProfilePage() {
  const { user, profile, refreshProfile, configured } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [birthDate, setBirthDate] = useState(profile?.birthDate || "");
  const [instagram, setInstagram] = useState(profile?.instagram || "");
  const [cities, setCities] = useState<City[]>(profile?.cities || []);
  const [profilePhotoPath, setProfilePhotoPath] = useState(
    profile?.profilePhotoPath || "",
  );
  const [composite, setComposite] = useState({
    compositePath: profile?.compositePath || "",
    compositeUrl: profile?.compositeUrl || "",
    compositeType: profile?.compositeType || (null as CompositeType | null),
  });
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [busy, setBusy] = useState(false);

  function showToast(type: ToastMessage["type"], text: string) {
    setToast({ id: Date.now(), type, text });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setToast(null);
    if (name.trim().length < 2) {
      showToast("error", "Preencha o nome completo para continuar.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      showToast("error", "Preencha um telefone válido com DDD.");
      return;
    }
    if (!birthDate || birthDate > new Date().toISOString().slice(0, 10)) {
      showToast("error", "Preencha uma data de nascimento válida.");
      return;
    }
    let normalizedInstagram: string;
    try {
      normalizedInstagram = normalizeInstagram(instagram);
    } catch (reason) {
      showToast(
        "error",
        reason instanceof Error ? reason.message : "Informe um Instagram válido.",
      );
      return;
    }
    if (!normalizedInstagram) {
      showToast("error", "Preencha seu Instagram para continuar.");
      return;
    }
    if (!cities.length) {
      showToast("error", "Adicione pelo menos uma cidade onde você pode trabalhar.");
      return;
    }
    if (!profilePhotoPath) {
      showToast("error", "Adicione e ajuste sua foto de perfil.");
      return;
    }
    if (!composite.compositePath) {
      showToast("error", "Adicione seu composite para concluir o perfil.");
      return;
    }
    setBusy(true);
    try {
      const previousCompositePath = profile?.compositePath || "";
      const previousPhotoPath = profile?.profilePhotoPath || "";
      await saveUserProfile(user.uid, {
        name: name.trim(),
        email: user.email || "",
        phone: phone.replace(/\D/g, ""),
        birthDate,
        instagram: normalizedInstagram,
        cities,
        profilePhotoPath,
        ...composite,
      });
      await refreshProfile();
      if (
        previousCompositePath &&
        previousCompositePath !== composite.compositePath
      ) {
        await deleteComposite(previousCompositePath).catch(() => undefined);
      }
      if (previousPhotoPath && previousPhotoPath !== profilePhotoPath) {
        await deleteProfilePhoto(previousPhotoPath).catch(() => undefined);
      }
      setInstagram(normalizedInstagram);
      showToast("success", "Seu perfil foi salvo corretamente.");
    } catch (reason) {
      showToast(
        "error",
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
      <div className="required-fields-note profile-required-note">
        <span>Obrigatórios</span>
        Todos os campos deste perfil precisam ser preenchidos para se candidatar.
      </div>
      {!configured && (
        <div className="inline-notice">
          Configure o Firebase para salvar e sincronizar seu perfil.
        </div>
      )}
      <Toast message={toast} onClose={() => setToast(null)} />
      <form className="profile-form" noValidate onSubmit={(event) => void submit(event)}>
        <div className="form-section-heading">
          <span>01</span>
          <div>
            <strong>Dados pessoais</strong>
            <small>Suas informações de contato</small>
          </div>
        </div>
        <div className="form-grid">
          <label className="form-field span-two">
            <span className="field-label"><span>Nome completo</span><small>Obrigatório</small></span>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Como podemos chamar você?"
            />
          </label>
          <label className="form-field">
            <span className="field-label"><span>E-mail</span><small>Obrigatório</small></span>
            <input type="email" value={user?.email || ""} disabled />
          </label>
          <label className="form-field">
            <span className="field-label"><span>Telefone / WhatsApp</span><small>Obrigatório</small></span>
            <input
              required
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="(11) 99999-9999"
            />
          </label>
          <label className="form-field">
            <span className="field-label"><span>Data de nascimento</span><small>Obrigatório</small></span>
            <input
              required
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
            />
          </label>
          <label className="form-field">
            <span className="field-label"><span>Instagram</span><small>Obrigatório</small></span>
            <input
              required
              value={instagram}
              onChange={(event) => setInstagram(event.target.value)}
              placeholder="seuperfil ou @seuperfil"
            />
            <span className="field-hint">Você pode informar com ou sem @.</span>
          </label>
        </div>
        <div className="form-section-heading">
          <span>02</span>
          <div>
            <strong>Sua foto de perfil</strong>
            <small>Ela será exibida para a equipe de seleção</small>
          </div>
        </div>
        {user && (
          <ProfilePhotoUpload
            uid={user.uid}
            name={name}
            value={profilePhotoPath}
            persistedPath={profile?.profilePhotoPath || ""}
            onChange={setProfilePhotoPath}
          />
        )}
        <div className="form-section-heading">
          <span>03</span>
          <div>
            <strong>Onde você pode trabalhar?</strong>
            <small>Adicione todas as cidades disponíveis</small>
          </div>
        </div>
        <CityPicker cities={cities} onChange={setCities} />
        <div className="form-section-heading">
          <span>04</span>
          <div>
            <strong>Seu composite</strong>
            <small>Um material para apresentar seu perfil</small>
          </div>
        </div>
        {user && (
          <CompositeUpload
            uid={user.uid}
            value={composite}
            persistedPath={profile?.compositePath || ""}
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
