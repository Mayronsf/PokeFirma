import { useEffect, useMemo, useState } from 'react';
import { alertas, defensiveTable, offensiveCoverage, type Member } from '../lib/analysis';
import { getMove, spriteUrl, type IndexEntry, type MoveDetail } from '../lib/pokeapi';
import { prettyName, typePt } from '../lib/pt';
import { multLabel } from '../lib/typechart';
import type { Slot } from '../lib/team';
import { Note, TypeBadge } from './ui';

/** Busca (com cache) os detalhes dos golpes escolhidos no time. */
export function useMoveDetails(slots: Slot[]) {
  const key = slots.flatMap((s) => s.golpes).sort().join(',');
  const [map, setMap] = useState<Record<string, MoveDetail>>({});
  useEffect(() => {
    const need = [...new Set(slots.flatMap((s) => s.golpes))].filter((g) => g && !map[g]);
    if (!need.length) return;
    let alive = true;
    Promise.allSettled(need.map((g) => getMove(g))).then((rs) => {
      if (!alive) return;
      const add: Record<string, MoveDetail> = {};
      rs.forEach((r) => r.status === 'fulfilled' && (add[r.value.slug] = r.value));
      setMap((m) => ({ ...m, ...add }));
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return map;
}

export function TeamAnalysis({ slots, index }: { slots: Slot[]; index: IndexEntry[] | undefined }) {
  const moves = useMoveDetails(slots);
  const members: Member[] = useMemo(
    () =>
      slots.map((s) => ({
        uid: s.uid,
        name: s.apelido || prettyName(s.especie),
        types: index?.find((e) => e.id === s.dex)?.types ?? [],
        moves: s.golpes.map((g) => moves[g]).filter(Boolean),
      })),
    [slots, index, moves],
  );
  const def = useMemo(() => defensiveTable(members), [members]);
  const cov = useMemo(() => offensiveCoverage(members), [members]);
  const alerts = useMemo(() => alertas(members, def, cov), [members, def, cov]);

  if (!slots.length) return <p className="muted">Adicione Pokémon para ver a análise do time.</p>;

  return (
    <div className="analysis">
      {alerts.length > 0 && (
        <div className="analysis-alerts">
          {alerts.map((a) => (
            <Note key={a} nivel="aviso">
              {a}
            </Note>
          ))}
        </div>
      )}

      <section aria-labelledby="def-title">
        <h3 id="def-title" className="analysis-title">
          Defesa: dano recebido por tipo
        </h3>
        <div className="def-scroll" tabIndex={0} aria-label="Tabela de fraquezas e resistências do time">
          <table className="def-table">
            <thead>
              <tr>
                <th scope="col">Ataque</th>
                {slots.map((s) => (
                  <th key={s.uid} scope="col">
                    <img src={spriteUrl(s.dex, s.shiny)} alt={s.apelido || prettyName(s.especie)} width={40} height={40} loading="lazy" />
                  </th>
                ))}
                <th scope="col">Fracos</th>
                <th scope="col">Resistem</th>
              </tr>
            </thead>
            <tbody>
              {def.map((r) => (
                <tr key={r.type} className={r.fracos >= 3 && r.fracos > r.resiste ? 'row-bad' : undefined}>
                  <th scope="row">
                    <TypeBadge type={r.type} small />
                  </th>
                  {r.mults.map((m, i) => (
                    <td key={i} className={`m m-${String(m).replace('.', '_')}`}>
                      {m === 1 ? <span className="sr-only">1×</span> : multLabel(m)}
                    </td>
                  ))}
                  <td className="count">{r.fracos || ''}</td>
                  <td className="count good">{r.resiste || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="cov-title">
        <h3 id="cov-title" className="analysis-title">
          Cobertura ofensiva dos golpes
        </h3>
        {members.some((m) => m.moves.some((mv) => mv.damageClass !== 'status')) ? (
          <ul className="cov-grid">
            {cov.map((c) => (
              <li key={c.type} className={c.best > 1 ? 'se' : c.best < 1 ? 'weak' : ''} title={c.by.length ? `Super efetivo: ${c.by.join(', ')}` : undefined}>
                <TypeBadge type={c.type} small />
                <span className="cov-mult">{c.best > 1 ? `${c.best}×` : c.best === 0 ? '—' : c.best < 1 ? multLabel(c.best) : '1×'}</span>
                <span className="sr-only">{c.best > 1 ? `super efetivo contra ${typePt[c.type]}` : `sem golpe super efetivo contra ${typePt[c.type]}`}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Escolha golpes de dano para ver a cobertura.</p>
        )}
      </section>
    </div>
  );
}
