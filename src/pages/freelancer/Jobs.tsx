import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getOpenJobs } from "../../services/jobService";
import { formatCurrency, formatDate } from "../../utils/formatters";
import type { Job } from "../../types/Job";

export function JobsPage() {
  const { configured } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!configured) return;
    getOpenJobs()
      .then(setJobs)
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Não foi possível carregar as vagas.",
        ),
      )
      .finally(() => setLoading(false));
  }, [configured]);

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return jobs.filter((job) =>
      `${job.title} ${job.name} ${job.city.name} ${job.city.uf}`
        .toLocaleLowerCase("pt-BR")
        .includes(term),
    );
  }, [jobs, search]);

  return (
    <section className="content-wrap">
      <div className="page-heading">
        <div>
          <div className="eyebrow">TRABALHOS TEMPORÁRIOS</div>
          <h1>
            Seu próximo trabalho
            <br className="desktop-break" /> começa por aqui<span>.</span>
          </h1>
          <p>Encontre oportunidades de eventos que combinam com você.</p>
        </div>
        <div className="heading-art" aria-hidden="true">
          <div className="art-circle">
            <BriefcaseBusiness size={34} strokeWidth={1.4} />
          </div>
          <span className="art-stamp">
            SP
            <br />
            CASTING
          </span>
        </div>
      </div>
      <div className="filter-row">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Busque por vaga ou cidade"
            aria-label="Buscar vagas"
          />
        </label>
        <span className="results-count">
          {filteredJobs.length}{" "}
          {filteredJobs.length === 1 ? "oportunidade" : "oportunidades"}
        </span>
      </div>
      {!configured && (
        <div className="setup-notice">
          <span className="notice-mark">i</span>
          <div>
            <strong>Conexão com Firebase pendente</strong>
            <p>
              Configure as variáveis de ambiente para carregar vagas e ativar os
              recursos da plataforma.
            </p>
          </div>
        </div>
      )}
      {error && <div className="inline-notice">{error}</div>}
      {loading ? (
        <div className="jobs-loading">Carregando oportunidades...</div>
      ) : filteredJobs.length ? (
        <div className="job-grid">
          {filteredJobs.map((job) => (
            <article className="job-card" key={job.id}>
              <div className="job-card-top">
                <span className="job-tag">{job.title}</span>
                <span className="open-dot">ABERTA</span>
              </div>
              <h2>{job.name}</h2>
              <p className="job-description">{job.description}</p>
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
              <div className="job-card-bottom">
                <strong>
                  {formatCurrency(job.dailyRate)} <small>/ diária</small>
                </strong>
                <Link
                  to={`/vagas/${job.id}`}
                  aria-label={`Ver vaga ${job.name}`}
                >
                  <ArrowUpRight size={17} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <BriefcaseBusiness size={23} />
          </div>
          <h2>
            {search
              ? "Nenhum resultado encontrado"
              : "Nenhuma oportunidade por enquanto"}
          </h2>
          <p>
            {search
              ? "Tente buscar por outro termo."
              : "As novas vagas aparecerão aqui assim que forem publicadas pela SPCasting."}
          </p>
          {search && (
            <button className="text-button" onClick={() => setSearch("")}>
              Limpar busca <ArrowUpRight size={15} />
            </button>
          )}
        </div>
      )}
      <div className="bottom-note">
        <span className="note-line" />
        <span>Novas oportunidades, direto para você.</span>
        <span className="note-line" />
      </div>
    </section>
  );
}
