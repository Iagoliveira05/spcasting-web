import type { City } from "../types/City";

const IBGE_BASE_URL = "https://servicodados.ibge.gov.br/api/v1/localidades";

type IBGEState = { id: number; sigla: string; nome: string };
type IBGEMunicipality = {
  id: number;
  nome: string;
  microrregiao: { mesorregiao: { UF: { sigla: string } } };
};

let stateCache: Promise<IBGEState[]> | undefined;
const municipalityCache = new Map<string, Promise<City[]>>();

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(
      "Não foi possível carregar as localidades do IBGE. Tente novamente.",
    );
  return response.json() as Promise<T>;
}

export function getStates(): Promise<IBGEState[]> {
  stateCache ??= fetchJson<IBGEState[]>(
    `${IBGE_BASE_URL}/estados?orderBy=nome`,
  ).catch((error: unknown) => {
    stateCache = undefined;
    throw error;
  });
  return stateCache;
}

export function getMunicipalities(stateCode: string): Promise<City[]> {
  const uf = stateCode.toUpperCase();
  const cached = municipalityCache.get(uf);
  if (cached) return cached;

  const request = fetchJson<IBGEMunicipality[]>(
    `${IBGE_BASE_URL}/estados/${encodeURIComponent(uf)}/municipios?orderBy=nome`,
  )
    .then((municipalities) =>
      municipalities.map((municipality) => ({
        id: municipality.id,
        name: municipality.nome,
        uf: municipality.microrregiao.mesorregiao.UF.sigla,
      })),
    )
    .catch((error: unknown) => {
      municipalityCache.delete(uf);
      throw error;
    });

  municipalityCache.set(uf, request);
  return request;
}
