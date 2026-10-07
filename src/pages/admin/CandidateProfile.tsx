import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  MessageCircle,
  UserRound,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { openComposite } from "../../services/compositeService";
import { getUserProfile } from "../../services/userService";
import { calculateAge } from "../../utils/formatters";
import { createWhatsAppLink } from "../../utils/whatsapp";
import type { UserProfile } from "../../types/User";
import "./CandidateProfile.css";

export function CandidateProfilePage() {
  const { uid = "" } = useParams();
  const { configured } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!configured || !uid) return;
    getUserProfile(uid)
      .then(setProfile)
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Não foi possível carregar o perfil.",
        ),
      )
      .finally(() => setLoading(false));
  }, [configured, uid]);

  async function viewComposite() {
    if (!profile?.compositePath) return;
    try {
      const url = await openComposite(profile.compositePath);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível abrir o composite.",
      );
    }
  }

  return (
    <section className="content-wrap admin-page candidate-profile-page">
      <Link to="/admin/vagas" className="back-link">
        <ArrowLeft size={15} /> Voltar à administração
      </Link>
      {loading ? (
        <div className="jobs-loading">Carregando perfil...</div>
      ) : !profile ? (
        <div className="inline-notice">{error || "Perfil não encontrado."}</div>
      ) : (
        <>
          <div className="eyebrow">PERFIL DO CANDIDATO</div>
          <div className="candidate-profile-heading">
            <div className="candidate-avatar">
              <UserRound size={24} />
            </div>
            <div>
              <h1>
                {profile.name}
                <span>.</span>
              </h1>
              <p>
                {profile.birthDate
                  ? `${calculateAge(profile.birthDate)} anos · `
                  : ""}
                {profile.email}
              </p>
            </div>
          </div>
          <div className="candidate-profile-data">
            <div>
              <small>Telefone / WhatsApp</small>
              <strong>{profile.phone || "Não informado"}</strong>
            </div>
            <div>
              <small>Instagram</small>
              <strong>{profile.instagram || "Não informado"}</strong>
            </div>
            <div className="span-two">
              <small>Cidades disponíveis</small>
              <strong>
                {profile.cities
                  .map((city) => `${city.name} - ${city.uf}`)
                  .join(" · ") || "Nenhuma cidade cadastrada"}
              </strong>
            </div>
          </div>
          <div className="candidate-profile-actions">
            <button
              className="primary-button"
              disabled={!profile.compositePath}
              onClick={() => void viewComposite()}
            >
              <ExternalLink size={16} /> Abrir composite
            </button>
            <a
              className="google-button"
              href={createWhatsAppLink(
                profile.phone,
                profile.name,
                "uma oportunidade SPCasting",
              )}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={16} /> Conversar pelo WhatsApp
            </a>
          </div>
          {error && <div className="inline-notice">{error}</div>}
        </>
      )}
    </section>
  );
}
