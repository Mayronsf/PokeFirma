import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table2, Trophy, X } from 'lucide-react';
import { useDexIndex } from '../lib/hooks';
import { useLiga, type Partida, type Torneio } from '../lib/liga';
import { spriteUrl } from '../lib/pokeapi';
import {
  classificadosPorGrupo,
  gruposDe,
  mataMata,
  partidasDoGrupo,
  placarDe,
  saldoKO,
  tabelas,
  vencedor,
  type Linha,
} from '../lib/torneio';
import { SkinHead } from './ui';

function useNomeMon() {
  const idx = useDexIndex();
  return (dex: number) => idx.data?.find((x) => x.id === dex)?.name ?? `#${dex}`;
}

export function MonStrip({ dex, size = 36, label }: { dex: number[]; size?: number; label?: string }) {
  const nome = useNomeMon();
  if (!dex.length) return null;
  return (
    <ul className="mon-strip" aria-label={label}>
      {dex.map((d, i) => (
        <li key={`${d}-${i}`} title={nome(d)}>
          <img src={spriteUrl(d)} alt={nome(d)} width={size} height={size} loading="lazy" />
        </li>
      ))}
    </ul>
  );
}

function Jogador({ nick, vence }: { nick: string | null; vence?: boolean }) {
  const { data } = useLiga();
  if (!nick) return <span className="muted">A definir</span>;
  const skin = data.jogadores.find((j) => j.nick.toLowerCase() === nick.toLowerCase())?.skin;
  return (
    <Link to={`/jogador/${encodeURIComponent(nick)}`} className={`tj${vence ? ' vence' : ''}`}>
      <SkinHead nick={skin ?? nick} size={22} />
      <span>{nick}</span>
    </Link>
  );
}

export function PartidaCard({ p }: { p: Partida }) {
  const s = placarDe(p);
  const w = vencedor(p);
  const temKO = typeof p.koA === 'number' || typeof p.koB === 'number';
  const temTimes = !!(p.timeA?.length || p.timeB?.length);
  return (
    <div className={`tmatch${s ? ' feita' : ''}`}>
      <div className="tmatch-row">
        <Jogador nick={p.a} vence={w === 'a'} />
        <b className="tmatch-score pixel tabular" aria-label={s ? `placar ${s[0]} a ${s[1]}` : 'ainda não jogada'}>
          {s ? `${s[0]}–${s[1]}` : 'vs'}
        </b>
        <Jogador nick={p.b} vence={w === 'b'} />
      </div>
      {temKO && (
        <p className="tmatch-ko">
          <span className="tabular">{p.koA ?? 0}</span>
          <span>Pokémon derrotados</span>
          <span className="tabular">{p.koB ?? 0}</span>
        </p>
      )}
      {temTimes && (
        <div className="tmatch-times">
          <MonStrip dex={p.timeA ?? []} size={32} label={`Time de ${p.a ?? 'A'}`} />
          <MonStrip dex={p.timeB ?? []} size={32} label={`Time de ${p.b ?? 'B'}`} />
        </div>
      )}
    </div>
  );
}

function MiniTabela({ linhas, q }: { linhas: Linha[]; q: number }) {
  return (
    <table className="ttable">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Jogador</th>
          <th scope="col" title="Vitórias">
            V
          </th>
          <th scope="col" title="Derrotas">
            D
          </th>
          <th scope="col" title="Pontos">
            Pts
          </th>
        </tr>
      </thead>
      <tbody>
        {linhas.map((l, i) => (
          <tr key={l.nick} className={i < q ? 'classifica' : undefined}>
            <td className="pixel tabular">{i + 1}</td>
            <th scope="row">
              <Jogador nick={l.nick} />
            </th>
            <td className="tabular">{l.v}</td>
            <td className="tabular">{l.d}</td>
            <td className="tabular">
              <b>{l.pts}</b>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TabelaCompleta({ t, onClose }: { t: Torneio; onClose: () => void }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const tabs = tabelas(t);
  const q = classificadosPorGrupo(t);
  useEffect(() => {
    dlg.current?.showModal();
  }, []);
  return (
    <dialog ref={dlg} className="tfull" onClose={onClose} aria-labelledby={`tf-${t.id}`}>
      <div className="tfull-head">
        <div>
          <p className="label">Tabela completa</p>
          <h2 id={`tf-${t.id}`} className="h-sub">
            {t.nome}
          </h2>
        </div>
        <button type="button" className="btn btn-sm btn-ghost btn-icon" aria-label="Fechar" onClick={() => dlg.current?.close()}>
          <X size={18} aria-hidden />
        </button>
      </div>
      <p className="muted small">
        Vitória vale 3 pontos. Desempate pelo saldo de Pokémon (derrotados menos perdidos). Os {q} primeiros de cada grupo vão para o mata-mata.
      </p>
      {tabs.map(({ grupo, linhas }) => (
        <section key={grupo} className="tfull-grupo">
          {tabs.length > 1 && <h3 className="tgroup-title">Grupo {grupo}</h3>}
          <div className="tfull-scroll">
            <table className="ttable full">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Jogador</th>
                  <th scope="col" title="Jogos">
                    J
                  </th>
                  <th scope="col" title="Vitórias">
                    V
                  </th>
                  <th scope="col" title="Derrotas">
                    D
                  </th>
                  <th scope="col" title="Pontos">
                    Pts
                  </th>
                  <th scope="col" title="Partidas vencidas e perdidas dentro dos confrontos">
                    Partidas
                  </th>
                  <th scope="col" title="Pokémon do adversário que derrotou">
                    Derrotou
                  </th>
                  <th scope="col" title="Pokémon próprios que perdeu">
                    Perdeu
                  </th>
                  <th scope="col" title="Saldo de Pokémon">
                    Saldo
                  </th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l, i) => (
                  <tr key={l.nick} className={i < q ? 'classifica' : undefined}>
                    <td className="pixel tabular">{i + 1}</td>
                    <th scope="row">
                      <Jogador nick={l.nick} />
                      {i < q && <span className="tq">Mata-mata</span>}
                    </th>
                    <td className="tabular">{l.j}</td>
                    <td className="tabular">{l.v}</td>
                    <td className="tabular">{l.d}</td>
                    <td className="tabular">
                      <b>{l.pts}</b>
                    </td>
                    <td className="tabular">
                      {l.gp}–{l.gc}
                    </td>
                    <td className="tabular">{l.kos}</td>
                    <td className="tabular">{l.perdidos}</td>
                    <td className="tabular">
                      <b>{saldoKO(l) > 0 ? `+${saldoKO(l)}` : saldoKO(l)}</b>
                    </td>
                  </tr>
                ))}
                {!linhas.length && (
                  <tr>
                    <td colSpan={10} className="muted">
                      Nenhum jogador neste grupo ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      {!tabs.length && <p className="muted">A tabela aparece quando a organização cadastrar os inscritos e os grupos.</p>}
    </dialog>
  );
}

export function TorneioDetalhe({ t }: { t: Torneio }) {
  const [tabela, setTabela] = useState(false);
  const grupos = gruposDe(t);
  const tabs = tabelas(t);
  const q = classificadosPorGrupo(t);
  const mm = mataMata(t);
  const inscritos = t.inscritos ?? [];
  const vazio = !tabs.length && !mm.length && !inscritos.length;

  if (vazio)
    return (
      <div className="tdetail">
        <p className="muted">Inscritos, grupos e chaveamento aparecem aqui assim que a organização abrir o torneio.</p>
      </div>
    );

  return (
    <div className="tdetail">
      {tabs.length > 0 && (
        <section className="tsec" aria-label="Fase de grupos">
          <div className="tsec-head">
            <h4 className="tsec-title">Fase de grupos</h4>
            <button type="button" className="btn btn-sm" onClick={() => setTabela(true)}>
              <Table2 size={15} aria-hidden /> Tabela completa
            </button>
          </div>
          <p className="muted small">
            Os {q} primeiros de cada grupo (em verde) vão para o mata-mata.
          </p>
          <div className="tgroups">
            {tabs.map(({ grupo, linhas }) => {
              const ps = partidasDoGrupo(t, grupo, grupos);
              return (
                <div key={grupo} className="tgroup">
                  {tabs.length > 1 && <h5 className="tgroup-title">Grupo {grupo}</h5>}
                  <MiniTabela linhas={linhas} q={q} />
                  {ps.length > 0 && (
                    <details className="tgroup-games">
                      <summary>
                        {ps.length} {ps.length === 1 ? 'partida' : 'partidas'}
                      </summary>
                      <div className="tmatches">
                        {ps.map((p, i) => (
                          <PartidaCard key={i} p={p} />
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {mm.length > 0 && (
        <section className="tsec" aria-label="Mata-mata">
          <h4 className="tsec-title">Mata-mata</h4>
          <div className="tbracket">
            {mm.map(({ fase, partidas }) => (
              <div key={fase} className="tbracket-col">
                <span className="tbracket-fase">
                  {fase === 'Final' && <Trophy size={14} aria-hidden />} {fase}
                </span>
                {partidas.map((p, i) => (
                  <PartidaCard key={i} p={p} />
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {inscritos.length > 0 && (
        <section className="tsec" aria-label="Elencos inscritos">
          <h4 className="tsec-title">Elencos inscritos</h4>
          <ul className="trosters">
            {inscritos.map((i) => (
              <li key={i.nick}>
                <span className="troster-who">
                  <Jogador nick={i.nick} />
                  {grupos.length > 1 && i.grupo && <span className="muted small">Grupo {i.grupo}</span>}
                </span>
                {i.pokemon.length ? <MonStrip dex={i.pokemon} label={`Elenco de ${i.nick}`} /> : <span className="muted small">Elenco não enviado</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {tabela && <TabelaCompleta t={t} onClose={() => setTabela(false)} />}
    </div>
  );
}
