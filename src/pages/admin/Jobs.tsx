import { useEffect, useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getAllJobs } from "../../services/jobService";
import { getApplicationCountsByJob } from "../../services/applicationService";
import { formatCurrency, formatDate } from "../../utils/formatters";
import type { Job, JobStatus } from "../../types/Job";
import {
  DateSortButton,
  type DateSortOrder,
} from "../../components/jobs/DateSortButton";

export function AdminJobsPage() {
  const { configured } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicationCounts, setApplicationCounts] = useState<
    Record<string, number>
  >({});
  const [filter, setFilter] = useState<JobStatus | "all">("all");
  const [sortOrder, setSortOrder] = useState<DateSortOrder>("nearest");
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!configured) return;
    Promise.all([getAllJobs(), getApplicationCountsByJob()])
      .then(([jobList, counts]) => {
        setJobs(jobList);
        setApplicationCounts(counts);
      })
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error ? reason.message : "Erro ao carregar vagas.",
        ),
      )
      .finally(() => setLoading(false));
  }, [configured]);

  const visible = jobs
    .filter((job) => filter === "all" || job.status === filter)
    .sort((left, right) =>
      sortOrder === "nearest"
        ? left.date.localeCompare(right.date)
        : right.date.localeCompare(left.date),
    );
  return (
    <section className="content-wrap admin-page">
      <div className="eyebrow">ADMINISTRAÇÃO</div>
      <div className="admin-heading">
        <div>
          <h1>
            Vagas<span>.</span>
          </h1>
          <p>Gerencie publicações e acompanhe cada seleção.</p>
        </div>
        <Link to="/admin/vagas/nova" className="primary-button button-link">
          <Plus size={16} /> Criar vaga
        </Link>
      </div>
      <div className="admin-list-controls">
        <div className="status-tabs" role="group" aria-label="Filtrar vagas">
          {(
          [
            ["all", "Todas"],
            ["open", "Abertas"],
            ["closed", "Fechadas"],
            ["finished", "Encerradas"],
          ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              className={filter === key ? "tab-active" : ""}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <DateSortButton value={sortOrder} onChange={setSortOrder} />
      </div>
      {!configured && (
        <div className="setup-notice">
          <span className="notice-mark">i</span>
          <div>
            <strong>Configure o Firebase</strong>
            <p>As vagas serão listadas após conectar o projeto.</p>
          </div>
        </div>
      )}
      {error && <div className="inline-notice">{error}</div>}
      {loading ? (
        <div className="jobs-loading">Carregando vagas...</div>
      ) : visible.length ? (
        <div className="admin-job-list">
          {visible.map((job) => (
            <Link
              className="admin-job-card"
              key={job.id}
              to={`/admin/vagas/${job.id}/candidatos`}
              aria-label={`Abrir gestão da vaga ${job.name}`}
            >
              <div className="admin-job-card-head">
                <div>
                  <span className={`status-pill status-${job.status}`}>
                    {job.status === "open"
                      ? "Aberta"
                      : job.status === "closed"
                        ? "Fechada"
                        : "Encerrada"}
                  </span>
                  <h2>
                    {job.title} — {job.name}
                  </h2>
                  <p>
                    {job.city.name} - {job.city.uf} · {formatDate(job.date)}
                  </p>
                </div>
                <strong className="job-rate">
                  {formatCurrency(job.dailyRate)}
                </strong>
              </div>
              <div className="admin-job-card-foot">
                <div className="admin-job-counts">
                  <span>
                    Inscritos <strong>{applicationCounts[job.id] ?? 0}</strong>
                  </span>
                  <span>
                    Selecionados{" "}
                    <strong>
                      {job.selectedWorkers || 0} / {job.maxWorkers}
                    </strong>
                  </span>
                </div>
                <span className="admin-card-open">
                  Abrir gestão <ArrowUpRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>Nenhuma vaga nesta categoria</h2>
          <p>Crie uma vaga para começar a receber candidaturas.</p>
        </div>
      )}
    </section>
  );
}
