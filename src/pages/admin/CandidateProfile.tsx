import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Trash2,
  UserRoundCheck,
  UserRoundMinus,
} from "lucide-react";
import { ProfilePhoto } from "../../components/profile/ProfilePhoto";
import { InstagramIcon, WhatsAppIcon } from "../../components/BrandIcons";
import { Toast, type ToastMessage } from "../../components/Toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { openComposite } from "../../services/compositeService";
import { getUserProfile } from "../../services/userService";
import { calculateAge } from "../../utils/formatters";
import { createWhatsAppLink } from "../../utils/whatsapp";
import type { UserProfile } from "../../types/User";
import type { Job } from "../../types/Job";
import type { JobApplication } from "../../types/Application";
import { instagramUrl } from "../../utils/instagram";
import { getJob } from "../../services/jobService";
import {
  getJobApplications,
  removeApplication,
  setApplicationSelected,
} from "../../services/applicationService";
import "./CandidateProfile.css";

export function CandidateProfilePage() {
  const { uid = "", jobId = "" } = useParams();
  const navigate = useNavigate();
  const { configured } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (!configured || !uid) return;
    Promise.all([
      getUserProfile(uid),
      jobId ? getJob(jobId) : Promise.resolve(null),
      jobId ? getJobApplications(jobId) : Promise.resolve([]),
    ])
      .then(([nextProfile, nextJob, applications]) => {
        setProfile(nextProfile);
        setJob(nextJob);
        setApplication(applications.find((item) => item.userId === uid) || null);
      })
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Não foi possível carregar o perfil.",
        ),
      )
      .finally(() => setLoading(false));
  }, [configured, jobId, uid]);

  async function toggleSelection() {
    if (!application || !jobId) return;
    setBusy(true);
    setError("");
    try {
      const selecting = application.status !== "selected";
      await setApplicationSelected(jobId, uid, selecting);
      setApplication({
        ...application,
        status: selecting ? "selected" : "applied",
        selectedAt: null,
      });
      setJob(await getJob(jobId));
      setToast({
        id: Date.now(),
        type: "success",
        text: selecting ? "Candidato selecionado para esta vaga." : "Seleção desfeita com sucesso.",
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível atualizar a seleção.");
    } finally {
      setBusy(false);
    }
  }

  async function removeCandidate() {
    if (!profile || !jobId || !window.confirm(`Remover ${profile.name} desta vaga?`)) return;
    setBusy(true);
    setError("");
    try {
      await removeApplication(jobId, uid);
      navigate(`/admin/vagas/${jobId}/candidatos`, { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível remover o candidato.");
      setBusy(false);
    }
  }

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
      <Toast message={toast} onClose={() => setToast(null)} />
      <Link to={jobId ? `/admin/vagas/${jobId}/candidatos` : "/admin/vagas"} className="back-link">
        <ArrowLeft size={15} /> {jobId ? "Voltar aos candidatos" : "Voltar à administração"}
      </Link>
      {loading ? (
        <div className="jobs-loading">Carregando perfil...</div>
      ) : !profile ? (
        <div className="inline-notice">{error || "Perfil não encontrado."}</div>
      ) : (
        <>
          <div className="eyebrow">PERFIL DO CANDIDATO</div>
          <div className="candidate-profile-heading">
            <ProfilePhoto path={profile.profilePhotoPath} name={profile.name} className="candidate-avatar" />
            <div>
              <h1>
                {profile.name}
                <span>.</span>
              </h1>
              <p>Perfil profissional</p>
            </div>
          </div>
          <div className="candidate-profile-data">
            <div>
              <small>E-mail</small>
              <strong>{profile.email}</strong>
            </div>
            <div>
              <small>Idade</small>
              <strong>{profile.birthDate ? `${calculateAge(profile.birthDate)} anos` : "Não informada"}</strong>
            </div>
            <div>
              <small>Telefone / WhatsApp</small>
              <strong>{profile.phone || "Não informado"}</strong>
            </div>
            <div>
              <small>Instagram</small>
              {profile.instagram ? (
                <a className="instagram-profile-link" href={instagramUrl(profile.instagram)} target="_blank" rel="noreferrer">
                  <InstagramIcon size={15} />
                  {profile.instagram.startsWith("@") ? profile.instagram : `@${profile.instagram}`}
                  <ExternalLink size={13} />
                </a>
              ) : <strong>Não informado</strong>}
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
              <WhatsAppIcon size={17} /> Conversar pelo WhatsApp
            </a>
          </div>
          {application && job && (
            <section className="candidate-decision-panel">
              <div>
                <small>DECISÃO PARA ESTA VAGA</small>
                <strong>{job.name}</strong>
                <span className={`status-pill ${application.status === "selected" ? "status-selected" : ""}`}>
                  {application.status === "selected" ? "Selecionado" : "Aguardando análise"}
                </span>
              </div>
              <div className="candidate-decision-actions">
                <button
                  type="button"
                  className={application.status === "selected" ? "decision-unselect" : "decision-select"}
                  disabled={busy || (application.status !== "selected" && job.selectedWorkers >= job.maxWorkers)}
                  onClick={() => void toggleSelection()}
                >
                  {application.status === "selected" ? <UserRoundMinus size={18} /> : <UserRoundCheck size={18} />}
                  {application.status === "selected" ? "Desfazer seleção" : "Selecionar candidato"}
                </button>
                <button type="button" className="decision-remove" disabled={busy} onClick={() => void removeCandidate()}>
                  <Trash2 size={18} /> Remover da vaga
                </button>
              </div>
            </section>
          )}
          {error && <div className="inline-notice">{error}</div>}
        </>
      )}
    </section>
  );
}
