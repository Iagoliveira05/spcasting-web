import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Pin,
  Wallet,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  applyToJob,
  getUserApplications,
} from "../../services/applicationService";
import { getJob } from "../../services/jobService";
import { formatCurrency, formatDate } from "../../utils/formatters";
import type { Job } from "../../types/Job";
import { localDateString } from "../../utils/formatters";
import { isProfileComplete } from "../../utils/profile";

export function JobDetailsPage() {
  const { jobId = "" } = useParams();
  const { user, profile, configured } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(configured);
  const [busy, setBusy] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!configured || !jobId) return;
    getJob(jobId)
      .then(setJob)
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Não foi possível abrir esta vaga.",
        ),
      )
      .finally(() => setLoading(false));
  }, [configured, jobId]);

  useEffect(() => {
    if (!user || !configured || !jobId) return;
    getUserApplications(user.uid)
      .then((applications) =>
        setIsApplied(applications.some((item) => item.jobId === jobId)),
      )
      .catch(() => undefined);
  }, [configured, jobId, user]);

  async function apply() {
    setNotice("");
    setError("");
    if (!user) {
      setNotice("Entre na sua conta para se candidatar.");
      return;
    }
    if (!isProfileComplete(profile)) {
      setError("Complete seu perfil antes de se candidatar.");
      return;
    }
    if (job && !profile.cities.some((city) => city.id === job.city.id)) {
      setError(
        `Esta vaga é para ${job.city.name} - ${job.city.uf}, mas essa cidade ainda não está entre as suas disponibilidades.`,
      );
      return;
    }
    if (isApplied) {
      setError("Você já se candidatou a esta vaga.");
      return;
    }
    setBusy(true);
    try {
      await applyToJob(jobId, profile);
      setIsApplied(true);
      setNotice("Sua candidatura foi enviada!");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível concluir sua candidatura.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading)
    return (
      <section className="content-wrap jobs-loading">
        Carregando vaga...
      </section>
    );
  if (!configured)
    return (
      <section className="content-wrap">
        <div className="inline-notice">
          Configure o Firebase para consultar os detalhes das vagas.
        </div>
      </section>
    );
  if (!job)
    return (
      <section className="content-wrap">
        <Link to="/vagas" className="back-link">
          <ArrowLeft size={15} /> Voltar às oportunidades
        </Link>
        <div className="empty-state">
          <h2>Esta oportunidade não está disponível</h2>
        </div>
      </section>
    );

  const isOpen = job.status === "open" && job.date >= localDateString();

  return (
    <section className="content-wrap job-detail-page">
      <Link to="/vagas" className="back-link">
        <ArrowLeft size={15} /> Voltar às oportunidades
      </Link>
      <div className="detail-heading">
        <span className="job-tag">{job.title}</span>
        <h1>
          {job.name}
          <span>.</span>
        </h1>
        <p>
          {job.city.name} - {job.city.uf}
        </p>
      </div>
      <div className="detail-layout">
        <div className="detail-main">
          <section className="detail-section">
            <div className="eyebrow">SOBRE O TRABALHO</div>
            <p>{job.description}</p>
          </section>
          <section className="detail-section">
            <div className="eyebrow">LOCALIZAÇÃO</div>
            <p className="detail-location">
              <MapPin size={17} />
              {job.location}
              <br />
              <span>
                {job.city.name} - {job.city.uf}
              </span>
            </p>
          </section>
        </div>
        <aside className="detail-aside">
          <div className="eyebrow">INFORMAÇÕES DA VAGA</div>
          <div className="detail-fact">
            <CalendarDays size={17} />
            <div>
              <small>Data</small>
              <strong>{formatDate(job.date)}</strong>
            </div>
          </div>
          <div className="detail-fact">
            <Clock3 size={17} />
            <div>
              <small>Horário</small>
              <strong>
                {job.startTime} às {job.endTime}
              </strong>
            </div>
          </div>
          <div className="detail-fact">
            <Wallet size={17} />
            <div>
              <small>Valor da diária</small>
              <strong>{formatCurrency(job.dailyRate)}</strong>
            </div>
          </div>
          <div className="detail-fact">
            <Pin size={17} />
            <div>
              <small>Local</small>
              <strong>{job.location}</strong>
            </div>
          </div>
          {!user ? (
            <Link className="primary-button button-link" to="/login">
              Entre para se candidatar <span>→</span>
            </Link>
          ) : (
            <button
              className="primary-button"
              onClick={() => void apply()}
              disabled={busy || isApplied || !isOpen}
            >
              {busy
                ? "Enviando..."
                : isApplied
                  ? "Candidatura enviada"
                  : isOpen
                    ? "Quero me candidatar"
                    : "Vaga encerrada"}{" "}
              <span>→</span>
            </button>
          )}
          {isApplied && (
            <Link className="detail-profile-link" to="/inscricoes">
              Ver minhas inscrições
            </Link>
          )}
          {(error || notice) && (
            <p className={error ? "field-error" : "success-text"}>
              {error || notice}
            </p>
          )}
          {error.includes("perfil") || error.includes("composite") ? (
            <Link className="detail-profile-link" to="/perfil">
              Completar meu perfil <span>→</span>
            </Link>
          ) : null}
          {error.includes("cidade") ? (
            <Link className="detail-profile-link" to="/perfil">
              Editar minhas cidades <span>→</span>
            </Link>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
