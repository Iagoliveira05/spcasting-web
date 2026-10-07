import { useEffect, useState } from "react";
import { BriefcaseBusiness, CalendarDays, MapPin, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
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
                  <div className="application-icon">
                    <BriefcaseBusiness size={20} />
                  </div>
                  <div className="application-info">
                    <span
                      className={`status-pill ${application.status === "selected" ? "status-selected" : ""}`}
                    >
                      {application.status === "selected"
                        ? "Selecionado"
                        : "Inscrito"}
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
                  {application.status === "applied" && (
                    <button
                      className="icon-action danger-action"
                      title="Cancelar candidatura"
                      aria-label="Cancelar candidatura"
                      onClick={() => void cancel(application)}
                    >
                      <Trash2 size={17} />
                    </button>
                  )}
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
