import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CircleStop,
  ExternalLink,
  Pencil,
  Trash2,
  UserRoundCheck,
  UserRoundMinus,
} from "lucide-react";
import { ProfilePhoto } from "../../components/profile/ProfilePhoto";
import { InstagramIcon, WhatsAppIcon } from "../../components/BrandIcons";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  getJobApplications,
  removeApplication,
  setApplicationSelected,
} from "../../services/applicationService";
import { getJob, setJobStatus } from "../../services/jobService";
import { openComposite } from "../../services/compositeService";
import { getUserProfile } from "../../services/userService";
import { calculateAge, formatDate } from "../../utils/formatters";
import { createWhatsAppLink } from "../../utils/whatsapp";
import type { Job } from "../../types/Job";
import type { JobApplication } from "../../types/Application";
import type { UserProfile } from "../../types/User";
import { instagramUrl } from "../../utils/instagram";

interface Applicant {
  application: JobApplication;
  profile: UserProfile | null;
}

export function CandidatesPage() {
  const { jobId = "" } = useParams();
  const navigate = useNavigate();
  const { configured } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(configured);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    if (!configured) return;
    const [currentJob, applications] = await Promise.all([
      getJob(jobId),
      getJobApplications(jobId),
    ]);
    setJob(currentJob);
    setApplicants(
      await Promise.all(
        applications.map(async (application) => ({
          application,
          profile: await getUserProfile(application.userId),
        })),
      ),
    );
  }
  useEffect(() => {
    if (!configured) return;
    let active = true;
    Promise.all([getJob(jobId), getJobApplications(jobId)])
      .then(async ([currentJob, applications]) => ({
        currentJob,
        candidates: await Promise.all(
          applications.map(async (application) => ({
            application,
            profile: await getUserProfile(application.userId),
          })),
        ),
      }))
      .then(({ currentJob, candidates }) => {
        if (!active) return;
        setJob(currentJob);
        setApplicants(candidates);
      })
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Erro ao carregar candidatos.",
        ),
      )
      .finally(() => setLoading(false));
    return () => {
      active = false;
    };
  }, [configured, jobId]);

  async function select(candidate: Applicant) {
    if (!candidate.profile) return;
    setBusyId(candidate.application.id);
    setError("");
    try {
      await setApplicationSelected(
        jobId,
        candidate.application.userId,
        candidate.application.status !== "selected",
      );
      await refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível atualizar a seleção.",
      );
    } finally {
      setBusyId("");
    }
  }

  async function remove(candidate: Applicant) {
    if (
      !candidate.profile ||
      !window.confirm(`Remover ${candidate.profile.name} desta vaga?`)
    )
      return;
    setBusyId(candidate.application.id);
    setError("");
    try {
      await removeApplication(jobId, candidate.application.userId);
      await refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível remover o candidato.",
      );
    } finally {
      setBusyId("");
    }
  }

  async function viewComposite(path: string) {
    try {
      const url = await openComposite(path);
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

  async function finishJob() {
    if (
      !job ||
      !window.confirm(`Tem certeza que deseja encerrar a vaga "${job.name}"?`)
    )
      return;
    setError("");
    try {
      await setJobStatus(job.id, "finished");
      await refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível encerrar a vaga.",
      );
    }
  }

  const pending = applicants.filter(
    (item) => item.application.status === "applied",
  );
  const selected = applicants.filter(
    (item) => item.application.status === "selected",
  );
  const CandidateCard = ({
    candidate,
    isSelected,
  }: {
    candidate: Applicant;
    isSelected: boolean;
  }) => {
    const profile = candidate.profile;
    if (!profile) return null;
    const profilePath = `/admin/vagas/${jobId}/candidatos/${profile.uid}`;
    function openProfile() {
      navigate(profilePath);
    }
    return (
      <article
        className={`candidate-card candidate-card-clickable ${isSelected ? "candidate-selected" : ""}`}
        role="link"
        tabIndex={0}
        aria-label={`Abrir perfil de ${profile.name}`}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a, button")) return;
          openProfile();
        }}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openProfile();
          }
        }}
      >
        <ProfilePhoto path={profile.profilePhotoPath} name={profile.name} className="candidate-avatar" />
        <div className="candidate-content">
          <div className="candidate-title">
            <div>
              <h3>{profile.name}</h3>
              <span>
                {profile.birthDate
                  ? `${calculateAge(profile.birthDate)} anos · `
                  : ""}
                {profile.cities
                  .map((city) => `${city.name} - ${city.uf}`)
                  .join(", ")}
              </span>
            </div>
            <span
              className={`status-pill ${isSelected ? "status-selected" : ""}`}
            >
              {isSelected ? "Selecionado" : "Inscrito"}
            </span>
          </div>
          <div className="candidate-details">
            <span>{profile.phone}</span>
            {profile.instagram ? (
              <a href={instagramUrl(profile.instagram)} target="_blank" rel="noreferrer">
                <InstagramIcon size={12} />
                {profile.instagram.startsWith("@") ? profile.instagram : `@${profile.instagram}`}
                <ExternalLink size={11} />
              </a>
            ) : <span>Instagram não informado</span>}
          </div>
          <div
            className="candidate-actions"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <button
              disabled={!profile.compositePath}
              onClick={() => void viewComposite(profile.compositePath)}
            >
              <ExternalLink size={14} /> Composite
            </button>
            <a
              href={createWhatsAppLink(
                profile.phone,
                profile.name,
                job?.name || "",
              )}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsAppIcon size={14} /> WhatsApp
            </a>
            {isSelected ? (
              <button
                className="remove-selection"
                disabled={busyId === candidate.application.id}
                onClick={() => void select(candidate)}
              >
                <UserRoundMinus size={15} /> Desfazer seleção
              </button>
            ) : (
              <button
                className="select-candidate"
                disabled={
                  busyId === candidate.application.id ||
                  selected.length >= (job?.maxWorkers || 0)
                }
                onClick={() => void select(candidate)}
              >
                <UserRoundCheck size={15} /> Selecionar candidato
              </button>
            )}
            <button
              className="candidate-remove"
              disabled={busyId === candidate.application.id}
              onClick={() => void remove(candidate)}
            >
              <Trash2 size={15} /> Remover candidato
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <section className="content-wrap admin-page">
      <Link to="/admin/vagas" className="back-link">
        <ArrowLeft size={15} /> Voltar às vagas
      </Link>
      {loading ? (
        <div className="jobs-loading">Carregando candidatos...</div>
      ) : !job ? (
        <div className="inline-notice">Vaga não encontrada.</div>
      ) : (
        <>
          <div className="eyebrow">CANDIDATOS DA VAGA</div>
          <div className="admin-heading">
            <div>
              <h1>
                {job.title}
                <span>.</span>
              </h1>
              <p>
                {job.name} · {job.city.name} - {job.city.uf} ·{" "}
                {formatDate(job.date)}
              </p>
            </div>
            <div className="job-management-summary">
              <div className="selected-count">
                Selecionados{" "}
                <strong>
                  {job.selectedWorkers || 0} / {job.maxWorkers}
                </strong>
              </div>
              <div className="job-management-actions">
                <Link to={`/admin/vagas/${job.id}/editar`}>
                  <Pencil size={14} /> Editar vaga
                </Link>
                {job.status !== "finished" && (
                  <button type="button" onClick={() => void finishJob()}>
                    <CircleStop size={14} /> Encerrar vaga
                  </button>
                )}
              </div>
            </div>
          </div>
          {error && <div className="inline-notice">{error}</div>}
          <section className="candidate-section">
            <div className="section-title">
              <div>
                <div className="eyebrow">EM ANÁLISE</div>
                <h2>
                  Candidatos <span>{pending.length}</span>
                </h2>
              </div>
            </div>
            {pending.length ? (
              pending.map((candidate) => (
                <CandidateCard
                  key={candidate.application.id}
                  candidate={candidate}
                  isSelected={false}
                />
              ))
            ) : (
              <div className="empty-inline">
                Não há candidatos aguardando análise.
              </div>
            )}
          </section>
          <section className="candidate-section">
            <div className="section-title">
              <div>
                <div className="eyebrow">CONFIRMADOS</div>
                <h2>
                  Selecionados{" "}
                  <span>
                    {selected.length} / {job.maxWorkers}
                  </span>
                </h2>
              </div>
            </div>
            {selected.length ? (
              selected.map((candidate) => (
                <CandidateCard
                  key={candidate.application.id}
                  candidate={candidate}
                  isSelected
                />
              ))
            ) : (
              <div className="empty-inline">
                Nenhuma pessoa selecionada ainda.
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}
