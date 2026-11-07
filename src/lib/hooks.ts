import { useCallback, useEffect, useState } from 'react';
import { getIndex, type IndexEntry } from './pokeapi';
import modpack from '@data/modpack-pokemon.json';

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, set] = useState<{ data?: T; error?: unknown; loading: boolean }>({ loading: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    let alive = true;
    set((s) => ({ data: s.data, loading: true }));
    fn()
      .then((data) => alive && set({ data, loading: false }))
      .catch((error) => alive && set({ error, loading: false }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, n]);
  const retry = useCallback(() => setN((x) => x + 1), []);
  return { ...state, retry };
}

let indexPromise: Promise<IndexEntry[]> | null = null;
export function useDexIndex() {
  return useAsync(() => {
    if (!indexPromise) indexPromise = getIndex().catch((e) => ((indexPromise = null), Promise.reject(e)));
    return indexPromise;
  }, []);
}

/* ---------- dados locais ---------- */
export interface ModpackInfo {
  disponivel: boolean;
  bioma: string;
  horario: string;
  raridade: string;
  estrutura: string;
  capitulo: number | null;
  observacoes: string;
}
export const modpackData = (modpack as { pokemon: Record<string, ModpackInfo> }).pokemon;

export type { Jogador, Torneio, StatusTorneio } from './liga';

/* ---------- times de exemplo / comunidade ---------- */
import exemplos from '@data/times-exemplo.json';
import { toSlug } from './pt';
import { novoSlot, type Formato, type Team } from './team';

export interface CommunityTeam {
  team: Team;
  autor: string;
  skin?: string;
  to: string;
  exemplo?: boolean;
  showdown?: string;
}

export const timesExemplo: CommunityTeam[] = (
  exemplos as { times: { id: string; nome: string; autor: string; skin?: string; formato: Formato; dex: number[]; showdown: string }[] }
).times.map((t) => {
  const heads = t.showdown.split(/\n\s*\n/).map((b) => b.split('\n')[0].split(' @ ')[0].trim());
  return {
    autor: t.autor,
    skin: t.skin,
    to: `/times/exemplo/${t.id}`,
    exemplo: true,
    showdown: t.showdown,
    team: {
      id: t.id,
      nome: t.nome,
      formato: t.formato,
      publico: true,
      atualizadoEm: 0,
      autorNick: t.autor,
      pokemon: t.dex.map((d, i) => novoSlot(d, toSlug(heads[i] ?? String(d)))),
    },
  };
});
