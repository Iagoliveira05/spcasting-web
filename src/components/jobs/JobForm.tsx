import { useEffect, useState, type FormEvent } from "react";
import { getMunicipalities, getStates } from "../../services/locationService";
import { saveJob } from "../../services/jobService";
import { localDateString } from "../../utils/formatters";
import type { City } from "../../types/City";
import type { Job } from "../../types/Job";

type StateOption = Awaited<ReturnType<typeof getStates>>[number];

export function JobForm({
  job,
  onSaved,
}: {
  job?: Job;
  onSaved: (jobId: string) => void;
}) {
  const [states, setStates] = useState<StateOption[]>([]);
  const [municipalities, setMunicipalities] = useState<City[]>([]);
  const [uf, setUf] = useState(job?.city.uf || "");
  const [form, setForm] = useState({
    title: job?.title || "",
    name: job?.name || "",
    description: job?.description || "",
    dailyRate: job?.dailyRate ? String(job.dailyRate) : "",
    date: job?.date || "",
    startTime: job?.startTime || "",
    endTime: job?.endTime || "",
    cityId: job?.city.id ? String(job.city.id) : "",
    location: job?.location || "",
    maxWorkers: job?.maxWorkers ? String(job.maxWorkers) : "",
    status: job?.status || ("open" as Job["status"]),
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getStates()
      .then(setStates)
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Erro ao carregar estados.",
        ),
      );
  }, []);
  useEffect(() => {
    if (!uf) return;
    getMunicipalities(uf)
      .then(setMunicipalities)
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Erro ao carregar municípios.",
        ),
      );
  }, [uf]);

  function change(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const city =
      municipalities.find((item) => item.id === Number(form.cityId)) ||
      (job?.city.id === Number(form.cityId) ? job.city : undefined);
    const rate = Number(form.dailyRate);
    const maxWorkers = Number(form.maxWorkers);
    if (!city) {
      setError("Selecione um estado e um município.");
      return;
    }
    if (!Number.isFinite(rate) || rate <= 0) {
      setError("O valor da diária precisa ser maior que zero.");
      return;
    }
    if (!Number.isInteger(maxWorkers) || maxWorkers <= 0) {
      setError(
        "O limite de pessoas deve ser um número inteiro maior que zero.",
      );
      return;
    }
    if (job && maxWorkers < job.selectedWorkers) {
      setError(
        `O limite não pode ser menor que as ${job.selectedWorkers} pessoas já selecionadas.`,
      );
      return;
    }
    if (form.date < localDateString() && form.status !== "finished") {
      setError("Vagas com data passada precisam estar encerradas.");
      return;
    }
    if (form.endTime <= form.startTime) {
      setError("O horário final deve ser posterior ao horário inicial.");
      return;
    }
    setBusy(true);
    try {
      const jobId = await saveJob(
        {
          title: form.title.trim(),
          name: form.name.trim(),
          description: form.description.trim(),
          dailyRate: rate,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          city,
          location: form.location.trim(),
          maxWorkers,
          status: form.status,
        },
        job?.id,
      );
      onSaved(jobId);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível salvar a vaga.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="profile-form admin-form"
      onSubmit={(event) => void submit(event)}
    >
      <div className="form-grid">
        <label className="form-field">
          Título / função
          <input
            required
            value={form.title}
            onChange={(event) => change("title", event.target.value)}
            placeholder="Promotora"
          />
        </label>
        <label className="form-field">
          Nome da ação
          <input
            required
            value={form.name}
            onChange={(event) => change("name", event.target.value)}
            placeholder="Lançamento de produto"
          />
        </label>
        <label className="form-field span-two">
          Descrição
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(event) => change("description", event.target.value)}
            placeholder="Descreva as atividades e requisitos da vaga"
          />
        </label>
        <label className="form-field">
          Valor da diária (R$)
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={form.dailyRate}
            onChange={(event) => change("dailyRate", event.target.value)}
          />
        </label>
        <label className="form-field">
          Limite de pessoas
          <input
            required
            type="number"
            min="1"
            step="1"
            value={form.maxWorkers}
            onChange={(event) => change("maxWorkers", event.target.value)}
          />
        </label>
        <label className="form-field">
          Data
          <input
            required
            type="date"
            min={job ? undefined : localDateString()}
            value={form.date}
            onChange={(event) => change("date", event.target.value)}
          />
        </label>
        <label className="form-field">
          Status
          <select
            value={form.status}
            disabled={!job}
            onChange={(event) => change("status", event.target.value)}
          >
            <option value="open">Aberta</option>
            <option value="closed">Fechada</option>
            <option value="finished">Encerrada</option>
          </select>
        </label>
        <label className="form-field">
          Horário inicial
          <input
            required
            type="time"
            value={form.startTime}
            onChange={(event) => change("startTime", event.target.value)}
          />
        </label>
        <label className="form-field">
          Horário final
          <input
            required
            type="time"
            value={form.endTime}
            onChange={(event) => change("endTime", event.target.value)}
          />
        </label>
        <label className="form-field">
          Estado
          <select
            required
            value={uf}
            onChange={(event) => {
              setUf(event.target.value);
              change("cityId", "");
            }}
          >
            <option value="">Selecione</option>
            {states.map((state) => (
              <option value={state.sigla} key={state.id}>
                {state.nome} ({state.sigla})
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          Município
          <select
            required
            value={form.cityId}
            disabled={!uf}
            onChange={(event) => change("cityId", event.target.value)}
          >
            <option value="">Selecione</option>
            {municipalities.map((city) => (
              <option value={city.id} key={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field span-two">
          Localização / endereço
          <input
            required
            value={form.location}
            onChange={(event) => change("location", event.target.value)}
            placeholder="Nome do local, rua e número"
          />
        </label>
      </div>
      {error && <p className="field-error">{error}</p>}
      <div className="form-actions">
        <button className="primary-button" type="submit" disabled={busy}>
          {busy ? "Salvando..." : job ? "Salvar alterações" : "Publicar vaga"}{" "}
          <span>→</span>
        </button>
      </div>
    </form>
  );
}
