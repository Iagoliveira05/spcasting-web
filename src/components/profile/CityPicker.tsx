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
  const [uf, setUf] = useState("");
  const [cityId, setCityId] = useState("");
  const [loadingCities, setLoadingCities] = useState(false);
  const [error, setError] = useState("");

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
    if (!uf) {
      setMunicipalities([]);
      return;
    }
    setLoadingCities(true);
    setCityId("");
    getMunicipalities(uf)
      .then(setMunicipalities)
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Erro ao carregar municípios.",
        ),
      )
      .finally(() => setLoadingCities(false));
  }, [uf]);

  function addCity() {
    const city = municipalities.find((item) => item.id === Number(cityId));
    if (!city || cities.some((item) => item.id === city.id)) return;
    onChange([...cities, city]);
    setCityId("");
  }

  return (
    <div className="city-picker">
      <div className="city-list">
        {cities.map((city) => (
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
        ))}
      </div>
      <div className="city-controls">
        <select
          value={uf}
          onChange={(event) => setUf(event.target.value)}
          aria-label="Estado"
        >
          <option value="">Estado</option>
          {states.map((state) => (
            <option key={state.id} value={state.sigla}>
              {state.nome} ({state.sigla})
            </option>
          ))}
        </select>
        <select
          value={cityId}
          onChange={(event) => setCityId(event.target.value)}
          disabled={!uf || loadingCities}
          aria-label="Município"
        >
          <option value="">
            {loadingCities ? "Carregando..." : "Município"}
          </option>
          {municipalities
            .filter((city) => !cities.some((saved) => saved.id === city.id))
            .map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
        </select>
        <button
          type="button"
          className="add-city"
          onClick={addCity}
          disabled={!cityId}
          aria-label="Adicionar cidade"
        >
          <Plus size={17} />
        </button>
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
