/** Análise do time: fraquezas/resistências defensivas e cobertura ofensiva. */
import type { MoveDetail } from './pokeapi';
import { TYPES, typePt } from './pt';
import { defensiveMult, effectiveness } from './typechart';

export interface Member {
  uid: string;
  name: string;
  types: string[];
  moves: MoveDetail[];
}

export interface DefRow {
  type: string;
  mults: number[];
  fracos: number;
  resiste: number;
}

export function defensiveTable(members: Member[]): DefRow[] {
  return TYPES.map((t) => {
    const mults = members.map((m) => (m.types.length ? defensiveMult(t, m.types) : 1));
    return { type: t, mults, fracos: mults.filter((x) => x > 1).length, resiste: mults.filter((x) => x < 1).length };
  });
}

export interface CovRow {
  type: string;
  best: number;
  by: string[];
}

export function offensiveCoverage(members: Member[]): CovRow[] {
  const attackTypes = new Map<string, Set<string>>();
  for (const m of members)
    for (const mv of m.moves)
      if (mv.damageClass !== 'status') {
        const s = attackTypes.get(mv.type) ?? new Set();
        s.add(m.name);
        attackTypes.set(mv.type, s);
      }
  return TYPES.map((def) => {
    let best = 0;
    const by = new Set<string>();
    for (const [atk, who] of attackTypes) {
      const e = effectiveness(atk, def);
      if (e > best) {
        best = e;
        by.clear();
      }
      if (e === best && e > 1) who.forEach((w) => by.add(w));
    }
    return { type: def, best: attackTypes.size ? best : 0, by: [...by] };
  });
}

export function alertas(members: Member[], def: DefRow[], cov: CovRow[]): string[] {
  const out: string[] = [];
  if (!members.length) return out;
  for (const r of def) {
    if (r.fracos >= 3 && r.fracos > r.resiste)
      out.push(`${r.fracos} Pokémon fracos a ${typePt[r.type]}${r.resiste ? `, só ${r.resiste} resiste${r.resiste > 1 ? 'm' : ''}` : ', nenhum resiste'}.`);
  }
  const hasMoves = members.some((m) => m.moves.some((mv) => mv.damageClass !== 'status'));
  if (hasMoves) {
    const semSE = cov.filter((c) => c.best <= 1).map((c) => typePt[c.type]);
    if (semSE.length && semSE.length <= 6)
      out.push(`Nenhum golpe super efetivo contra ${semSE.join(', ')}.`);
    else if (semSE.length > 6) out.push(`Cobertura curta: sem golpe super efetivo contra ${semSE.length} tipos.`);
  }
  const semGolpes = members.filter((m) => m.moves.length === 0);
  if (semGolpes.length) out.push(`${semGolpes.map((m) => m.name).join(', ')} ainda sem golpes.`);
  return out;
}
