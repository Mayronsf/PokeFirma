/**
 * Cálculos de um torneio: placar, vencedor, tabela de cada grupo e mata-mata.
 * Regra (content/regras.ts): vitória = 3 pts, derrota = 0; desempate pelo saldo de Pokémon
 * (derrotados − perdidos, que equivale ao saldo de sobreviventes). Os melhores de cada grupo vão para o mata-mata.
 */
import type { Partida, Torneio } from './liga';

export const FASE_GRUPOS = 'Grupos';
/** Fases do mata-mata, na ordem em que acontecem. */
export const FASES_MATA = ['Oitavas', 'Quartas', 'Semifinal', 'Disputa de 3º', 'Final'];
export const FASES = [FASE_GRUPOS, ...FASES_MATA];
export const GRUPO_UNICO = 'Geral';

export function placarDe(p: Partida): [number, number] | null {
  if (typeof p.pa === 'number' && typeof p.pb === 'number') return [p.pa, p.pb];
  const m = p.placar?.match(/(\d+)\s*[–xX:-]\s*(\d+)/);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

export function vencedor(p: Partida): 'a' | 'b' | null {
  const s = placarDe(p);
  if (!s || !p.a || !p.b || s[0] === s[1]) return null;
  return s[0] > s[1] ? 'a' : 'b';
}

export function gruposDe(t: Torneio): string[] {
  const set = new Set<string>(t.grupos?.filter(Boolean) ?? []);
  t.inscritos?.forEach((i) => i.grupo && set.add(i.grupo));
  t.chave.forEach((p) => p.fase === FASE_GRUPOS && set.add(p.grupo || GRUPO_UNICO));
  if (!set.size && (t.inscritos?.length || t.chave.some((p) => p.fase === FASE_GRUPOS))) set.add(GRUPO_UNICO);
  return [...set];
}

export function classificadosPorGrupo(t: Torneio): number {
  if (typeof t.classificados === 'number' && t.classificados > 0) return t.classificados;
  return gruposDe(t).length <= 1 ? 4 : 2;
}

export interface Linha {
  nick: string;
  j: number;
  v: number;
  d: number;
  pts: number;
  /** Partidas (games) vencidas e perdidas dentro dos confrontos MD3. */
  gp: number;
  gc: number;
  /** Pokémon do adversário derrotados / Pokémon próprios perdidos. */
  kos: number;
  perdidos: number;
}

export const saldoKO = (l: Linha) => l.kos - l.perdidos;

/** Tabela de cada grupo, já ordenada. */
export function tabelas(t: Torneio): { grupo: string; linhas: Linha[] }[] {
  const grupos = gruposDe(t);
  const linhaDe = new Map<string, Linha>();
  const grupoDe = new Map<string, string>();
  const nova = (nick: string): Linha => ({ nick, j: 0, v: 0, d: 0, pts: 0, gp: 0, gc: 0, kos: 0, perdidos: 0 });
  const garantir = (nick: string, grupo: string) => {
    const k = nick.toLowerCase();
    if (!linhaDe.has(k)) {
      linhaDe.set(k, nova(nick));
      grupoDe.set(k, grupo);
    }
    return linhaDe.get(k)!;
  };
  t.inscritos?.forEach((i) => garantir(i.nick, i.grupo || grupos[0] || GRUPO_UNICO));
  for (const p of t.chave) {
    if (p.fase !== FASE_GRUPOS || !p.a || !p.b) continue;
    const g = p.grupo || grupos[0] || GRUPO_UNICO;
    const A = garantir(p.a, g);
    const B = garantir(p.b, g);
    const s = placarDe(p);
    if (!s) continue;
    const w = vencedor(p);
    A.j++;
    B.j++;
    A.gp += s[0];
    A.gc += s[1];
    B.gp += s[1];
    B.gc += s[0];
    A.kos += p.koA ?? 0;
    A.perdidos += p.koB ?? 0;
    B.kos += p.koB ?? 0;
    B.perdidos += p.koA ?? 0;
    if (w === 'a') {
      A.v++;
      A.pts += 3;
      B.d++;
    } else if (w === 'b') {
      B.v++;
      B.pts += 3;
      A.d++;
    }
  }
  const ordem = (a: Linha, b: Linha) =>
    b.pts - a.pts || saldoKO(b) - saldoKO(a) || b.gp - b.gc - (a.gp - a.gc) || b.kos - a.kos || a.nick.localeCompare(b.nick);
  return grupos.map((g) => ({
    grupo: g,
    linhas: [...linhaDe.entries()]
      .filter(([k]) => grupoDe.get(k) === g)
      .map(([, l]) => l)
      .sort(ordem),
  }));
}

/** Partidas do mata-mata agrupadas por fase, na ordem das fases. */
export function mataMata(t: Torneio): { fase: string; partidas: Partida[] }[] {
  const fases = [...FASES_MATA, ...new Set(t.chave.map((p) => p.fase).filter((f) => !FASES.includes(f)))];
  return fases.map((fase) => ({ fase, partidas: t.chave.filter((p) => p.fase === fase) })).filter((f) => f.partidas.length);
}

export function partidasDoGrupo(t: Torneio, grupo: string, grupos: string[]): Partida[] {
  return t.chave.filter((p) => p.fase === FASE_GRUPOS && (p.grupo || grupos[0] || GRUPO_UNICO) === grupo);
}

export function timeInscrito(t: Torneio, nick: string | null): number[] {
  if (!nick) return [];
  return t.inscritos?.find((i) => i.nick.toLowerCase() === nick.toLowerCase())?.pokemon ?? [];
}
