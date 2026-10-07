import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { getMunicipalities, getStates } from "../../services/locationService";
import type { City } from "../../types/City";

type StateOption = Awaited<ReturnType<typeof getStates>>[number];

export function CityPicker({
  cities,
  onChange,
}: {
  cities: City[];
  onChange: (cities: City[]) => void;
}) {
  const [states, setStates] = useState<StateOption[]>([]);
  const [municipalities, setMunicipalities] = useState<City[]>([]);
  const [loadedUf, setLoadedUf] = useState("");
  const [uf, setUf] = useState("");
  const [cityId, setCityId] = useState("");
  const [error, setError] = useState("");
  const loadingCities = Boolean(uf && loadedUf !== uf);
  const availableMunicipalities = loadedUf === uf ? municipalities : [];

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
    let active = true;
    getMunicipalities(uf)
      .then((result) => {
        if (!active) return;
        setMunicipalities(result);
        setLoadedUf(uf);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setMunicipalities([]);
        setLoadedUf(uf);
        setError(
          reason instanceof Error
            ? reason.message
            : "Erro ao carregar municípios.",
        );
      });
    return () => {
      active = false;
    };
  }, [uf]);

  function addCity() {
    const city = availableMunicipalities.find(
      (item) => item.id === Number(cityId),
    );
    if (!city || cities.some((item) => item.id === city.id)) return;
    onChange([...cities, city]);
    setCityId("");
  }

  return (
    <div className="city-picker">
      <div className="city-picker-summary">
        <strong>Localidades adicionadas</strong>
        <span>
          {cities.length} {cities.length === 1 ? "cidade" : "cidades"}
        </span>
      </div>
      <div className="city-list">
        {cities.length ? (
          cities.map((city) => (
            <span className="city-chip" key={city.id}>
              {city.name} - {city.uf}
              <button
                type="button"
                aria-label={`Remover ${city.name}`}
                onClick={() =>
                  onChange(cities.filter((item) => item.id !== city.id))
                }
              >
                <X size={13} />
              </button>
            </span>
          ))
        ) : (
          <p className="city-empty">
            Nenhuma cidade adicionada. Escolha abaixo onde você pode trabalhar.
          </p>
        )}
      </div>
      <p className="city-picker-instruction">
        Selecione o estado e o município e depois confirme em
        <strong> Adicionar cidade</strong>.
      </p>
      <div className="city-controls">
        <label className="city-control-field">
          <span>1. Escolha o estado</span>
          <select
            value={uf}
            onChange={(event) => {
              setUf(event.target.value);
              setCityId("");
              setError("");
            }}
          >
            <option value="">Selecione o estado</option>
            {states.map((state) => (
              <option key={state.id} value={state.sigla}>
                {state.nome} ({state.sigla})
              </option>
            ))}
          </select>
        </label>
        <label className="city-control-field">
          <span>2. Escolha o município</span>
          <select
            value={cityId}
            onChange={(event) => setCityId(event.target.value)}
            disabled={!uf || loadingCities}
          >
            <option value="">
              {loadingCities
                ? "Carregando municípios..."
                : uf
                  ? "Selecione o município"
                  : "Escolha o estado primeiro"}
            </option>
            {availableMunicipalities
              .filter((city) => !cities.some((saved) => saved.id === city.id))
              .map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
          </select>
        </label>
        <button
          type="button"
          className="add-city"
          onClick={addCity}
          disabled={!cityId}
        >
          <Plus size={17} />
          Adicionar cidade
        </button>
      </div>
      {cityId && (
        <p className="city-action-hint">
          Município selecionado. Clique em “Adicionar cidade” para confirmar.
        </p>
      )}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
