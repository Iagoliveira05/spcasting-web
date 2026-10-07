import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { JobForm } from "../../components/jobs/JobForm";
import { getJob } from "../../services/jobService";
import type { Job } from "../../types/Job";

export function CreateJobPage({ edit = false }: { edit?: boolean }) {
  const navigate = useNavigate();
  const { jobId = "" } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(edit);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!edit) return;
    getJob(jobId)
      .then((current) => {
        if (!current) setError("Vaga não encontrada.");
        else setJob(current);
      })
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error ? reason.message : "Erro ao carregar vaga.",
        ),
      )
      .finally(() => setLoading(false));
  }, [edit, jobId]);

  return (
    <section className="content-wrap admin-page form-page">
      <Link to="/admin/vagas" className="back-link">
        <ChevronLeft size={16} /> Voltar às vagas
      </Link>
      <div className="eyebrow">ADMINISTRAÇÃO · VAGAS</div>
      <h1>
        {edit ? "Editar vaga" : "Criar vaga"}
        <span>.</span>
      </h1>
      <p className="form-page-intro">
        Preencha os detalhes da oportunidade temporária.
      </p>
      {error && <div className="inline-notice">{error}</div>}
      {loading ? (
        <div className="jobs-loading">Carregando vaga...</div>
      ) : (
        (!edit || job) && (
          <JobForm
            job={job || undefined}
            onSaved={(id) => navigate(`/admin/vagas/${id}/candidatos`)}
          />
        )
      )}
    </section>
  );
}
