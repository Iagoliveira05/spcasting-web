import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
  Timer,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  cancelApplication,
  getUserApplications,
} from "../../services/applicationService";
import { getJob } from "../../services/jobService";
import { formatDate } from "../../utils/formatters";
import type { JobApplication } from "../../types/Application";
import type { Job } from "../../types/Job";

interface ApplicationWithJob {
  application: JobApplication;
  job: Job | null;
}

export function MyApplicationsPage() {
  const { user, configured } = useAuth();
  const [items, setItems] = useState<ApplicationWithJob[]>([]);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!configured || !user) return;
    getUserApplications(user.uid)
      .then(async (applications) =>
        setItems(
          await Promise.all(
            applications.map(async (application) => ({
              application,
              job: await getJob(application.jobId),
            })),
          ),
        ),
      )
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Não foi possível carregar suas inscrições.",
        ),
      )
      .finally(() => setLoading(false));
  }, [configured, user]);

  async function cancel(application: JobApplication) {
    if (
      !user ||
      !window.confirm(
        "Tem certeza que deseja cancelar sua candidatura para esta vaga?",
      )
    )
      return;
    try {
      await cancelApplication(application.jobId, user.uid);
      setItems((current) =>
        current.filter((item) => item.application.id !== application.id),
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível cancelar a inscrição.",
      );
    }
  }

  return (
    <section className="content-wrap subpage-list">
      <div className="eyebrow">ACOMPANHE SEUS PROCESSOS</div>
      <h1>
        Minhas
        <br className="mobile-break" /> inscrições<span>.</span>
      </h1>
      <p className="form-page-intro">
        Veja suas candidaturas e acompanhe quando for selecionado.
      </p>
      {!configured && (
        <div className="inline-notice">
          Configure o Firebase para consultar suas inscrições.
        </div>
      )}
      {error && <div className="inline-notice">{error}</div>}
      {loading ? (
        <div className="jobs-loading">Carregando inscrições...</div>
      ) : items.length ? (
        <div className="application-list">
          {items.map(
            ({ application, job }) =>
              job && (
                <article
                  className={`application-card ${application.status === "selected" ? "selected-card" : ""}`}
                  key={application.id}
                >
                  <Link
                    className="application-card-link"
                    to={`/vagas/${job.id}`}
                    aria-label={`Ver detalhes da vaga ${job.name}`}
                  >
                    <div className="application-icon">
                      <BriefcaseBusiness size={20} />
                    </div>
                    <div className="application-info">
                      <span
                        className={`application-status-banner ${application.status === "selected" ? "application-approved" : "application-pending"}`}
                      >
                        {application.status === "selected" ? (
                          <BadgeCheck size={15} />
                        ) : (
                          <Timer size={15} />
                        )}
                        <span>
                          <strong>
                            {application.status === "selected"
                              ? "Aprovado para a ação"
                              : "Inscrição enviada"}
                          </strong>
                          <small>
                            {application.status === "selected"
                              ? "Sua participação foi confirmada pela SPCasting"
                              : "Aguardando aprovação da SPCasting"}
                          </small>
                        </span>
                      </span>
                      <h2>
                        {job.title} — {job.name}
                      </h2>
                      <div className="job-meta">
                        <span>
                          <MapPin size={14} />
                          {job.city.name} - {job.city.uf}
                        </span>
                        <span>
                          <CalendarDays size={14} />
                          {formatDate(job.date)}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="application-arrow" size={17} />
                  </Link>
                  <button
                    className="withdraw-button"
                    onClick={() => void cancel(application)}
                  >
                    <XCircle size={15} /> Desistir
                  </button>
                </article>
              ),
          )}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <CalendarDays size={23} />
          </div>
          <h2>Você ainda não se candidatou</h2>
          <p>Quando se inscrever em uma oportunidade, ela aparecerá aqui.</p>
          <Link className="text-button" to="/vagas">
            Ver oportunidades <span>→</span>
          </Link>
        </div>
      )}
    </section>
  );
}
