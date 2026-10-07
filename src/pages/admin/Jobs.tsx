import { useEffect, useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { setJobStatus, getAllJobs } from "../../services/jobService";
import { formatCurrency, formatDate } from "../../utils/formatters";
import type { Job, JobStatus } from "../../types/Job";

export function AdminJobsPage() {
  const { configured } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<JobStatus | "all">("all");
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState("");

  async function refresh() {
    if (!configured) return;
    try {
      setJobs(await getAllJobs());
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Erro ao carregar vagas.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (!configured) return;
    getAllJobs()
      .then(setJobs)
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error ? reason.message : "Erro ao carregar vagas.",
        ),
      )
      .finally(() => setLoading(false));
  }, [configured]);

  async function finish(job: Job) {
    if (
      !window.confirm(`Tem certeza que deseja encerrar a vaga "${job.name}"?`)
    )
      return;
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

  const visible = jobs.filter(
    (job) => filter === "all" || job.status === filter,
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
            <article className="admin-job-card" key={job.id}>
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
                <span>
                  Selecionados{" "}
                  <strong>
                    {job.selectedWorkers || 0} / {job.maxWorkers}
                  </strong>
                </span>
                <div>
                  <Link to={`/admin/vagas/${job.id}/candidatos`}>
                    Candidatos <ArrowUpRight size={14} />
                  </Link>
                  <Link to={`/admin/vagas/${job.id}/editar`}>Editar</Link>
                  {job.status !== "finished" && (
                    <button onClick={() => void finish(job)}>Encerrar</button>
                  )}
                </div>
              </div>
            </article>
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
