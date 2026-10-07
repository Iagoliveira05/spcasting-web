import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getOpenJobs } from "../../services/jobService";
import { getUserApplications } from "../../services/applicationService";
import { formatCurrency, formatDate } from "../../utils/formatters";
import type { Job } from "../../types/Job";
import type { ApplicationStatus } from "../../types/Application";
import { isProfileComplete } from "../../utils/profile";
import {
  DateSortButton,
  type DateSortOrder,
} from "../../components/jobs/DateSortButton";

export function JobsPage() {
  const { configured, user, profile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicationStatuses, setApplicationStatuses] = useState<
    Map<string, ApplicationStatus>
  >(
    new Map(),
  );
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<DateSortOrder>("nearest");
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

  useEffect(() => {
    if (!configured || !user) return;
    getUserApplications(user.uid)
      .then(
        (applications) =>
          setApplicationStatuses(
            new Map(
              applications.map((application) => [
                application.jobId,
                application.status,
              ]),
            ),
          ),
      )
      .catch(() => setApplicationStatuses(new Map()));
  }, [configured, user]);

  function applicationAvailability(
    job: Job,
  ): { label: string; allowed: boolean; status?: ApplicationStatus } {
    if (!user) return { label: "Entre para se candidatar", allowed: false };
    if (profile?.role === "admin")
      return { label: "Visualização administrativa", allowed: false };
    const applicationStatus = applicationStatuses.get(job.id);
    if (applicationStatus === "selected")
      return {
        label: "Aprovado para esta ação",
        allowed: false,
        status: "selected" as const,
      };
    if (applicationStatus === "applied")
      return {
        label: "Inscrição enviada · aguardando aprovação",
        allowed: false,
        status: "applied" as const,
      };
    if (!isProfileComplete(profile))
      return { label: "Complete seu perfil para participar", allowed: false };
    if (!profile.cities.some((city) => city.id === job.city.id))
      return {
        label: `Indisponível: adicione ${job.city.name} ao perfil`,
        allowed: false,
      };
    return { label: "Você pode se candidatar", allowed: true };
  }

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return jobs
      .filter((job) =>
        `${job.title} ${job.name} ${job.city.name} ${job.city.uf}`
          .toLocaleLowerCase("pt-BR")
          .includes(term),
      )
      .sort((left, right) =>
        sortOrder === "nearest"
          ? left.date.localeCompare(right.date)
          : right.date.localeCompare(left.date),
      );
  }, [jobs, search, sortOrder]);

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
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Busque por vaga ou cidade"
            aria-label="Buscar vagas"
          />
        </label>
        <DateSortButton value={sortOrder} onChange={setSortOrder} />
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
          {filteredJobs.map((job) => {
            const availability = applicationAvailability(job);
            return (
              <Link
                className="job-card"
                key={job.id}
                to={`/vagas/${job.id}`}
                aria-label={`Ver detalhes da vaga ${job.name}. ${availability.label}`}
              >
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
                <span
                  className={`application-availability ${availability.allowed ? "availability-allowed" : availability.status === "selected" ? "availability-selected" : availability.status === "applied" ? "availability-pending" : "availability-blocked"}`}
                >
                  {availability.label}
                </span>
                <div className="job-card-bottom">
                  <strong>
                    {formatCurrency(job.dailyRate)} <small>/ diária</small>
                  </strong>
                  <span className="job-card-arrow" aria-hidden="true">
                    <ArrowUpRight size={17} />
                  </span>
                </div>
              </Link>
            );
          })}
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
