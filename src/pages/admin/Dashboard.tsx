import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  CircleDollarSign,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { countApplications } from "../../services/applicationService";
import { getAllJobs } from "../../services/jobService";
import { formatDate, localDateString } from "../../utils/formatters";
import type { Job } from "../../types/Job";

export function AdminDashboardPage() {
  const { configured } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState(0);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!configured) return;
    Promise.all([getAllJobs(), countApplications()])
      .then(([jobList, total]) => {
        setJobs(jobList);
        setApplications(total);
      })
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Não foi possível carregar o painel.",
        ),
      )
      .finally(() => setLoading(false));
  }, [configured]);

  const today = localDateString();
  const open = jobs.filter(
    (job) => job.status === "open" && job.date >= today,
  ).length;
  const closed = jobs.filter((job) => job.status === "closed").length;
  const finished = jobs.filter(
    (job) =>
      job.status === "finished" ||
      job.date < today,
  ).length;
  const selected = jobs.reduce(
    (total, job) => total + (job.selectedWorkers || 0),
    0,
  );

  return (
    <section className="content-wrap admin-page">
      <div className="eyebrow">SPCASTING · ADMINISTRAÇÃO</div>
      <div className="admin-heading">
        <div>
          <h1>
            Bom dia<span>.</span>
          </h1>
          <p>Acompanhe a operação e as oportunidades da agência.</p>
        </div>
        <Link className="primary-button button-link" to="/admin/vagas/nova">
          Nova vaga <span>+</span>
        </Link>
      </div>
      {!configured && (
        <div className="setup-notice">
          <span className="notice-mark">i</span>
          <div>
            <strong>Firebase não configurado</strong>
            <p>
              Configure o arquivo .env para carregar os dados administrativos.
            </p>
          </div>
        </div>
      )}
      {error && <div className="inline-notice">{error}</div>}
      <div className="stats-grid">
        <article className="stat-card">
          <span>Vagas abertas</span>
          <strong>{loading ? "–" : open}</strong>
          <BriefcaseBusiness size={18} />
        </article>
        <article className="stat-card">
          <span>Vagas fechadas</span>
          <strong>{loading ? "–" : closed}</strong>
          <CircleDollarSign size={18} />
        </article>
        <article className="stat-card">
          <span>Vagas encerradas</span>
          <strong>{loading ? "–" : finished}</strong>
          <BriefcaseBusiness size={18} />
        </article>
        <article className="stat-card">
          <span>Inscrições</span>
          <strong>{loading ? "–" : applications}</strong>
          <Users size={18} />
        </article>
        <article className="stat-card">
          <span>Selecionados</span>
          <strong>{loading ? "–" : selected}</strong>
          <Check size={18} />
        </article>
      </div>
      <section className="admin-section">
        <div className="section-title">
          <div>
            <div className="eyebrow">ACOMPANHAMENTO</div>
            <h2>Vagas recentes</h2>
          </div>
          <Link to="/admin/vagas">
            Ver todas <ArrowUpRight size={15} />
          </Link>
        </div>
        {loading ? (
          <div className="jobs-loading">Carregando painel...</div>
        ) : jobs.slice(0, 5).length ? (
          <div className="admin-job-list">
            {jobs.slice(0, 5).map((job) => (
              <Link
                to={`/admin/vagas/${job.id}/candidatos`}
                className="admin-job-row"
                key={job.id}
              >
                <div>
                  <strong>
                    {job.title} — {job.name}
                  </strong>
                  <small>
                    {job.city.name} - {job.city.uf} · {formatDate(job.date)}
                  </small>
                </div>
                <span className={`status-pill status-${job.status}`}>
                  {job.status === "open"
                    ? "Aberta"
                    : job.status === "closed"
                      ? "Fechada"
                      : "Encerrada"}
                </span>
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-inline">Nenhuma vaga cadastrada.</div>
        )}
      </section>
    </section>
  );
}
