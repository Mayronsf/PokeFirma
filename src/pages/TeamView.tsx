import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CopyPlus, FileOutput } from 'lucide-react';
import { Consult } from '../components/Shell';
import { ShowdownDialog } from '../components/ShowdownDialog';
import { TeamAnalysis } from '../components/TeamAnalysis';
import { ErrorRetry, SkinHead, TypeBadge } from '../components/ui';
import { timesExemplo, useAsync, useDexIndex } from '../lib/hooks';
import { spriteUrl } from '../lib/pokeapi';
import { NATURES, prettyName, typePt } from '../lib/pt';
import { importTeam } from '../lib/showdown';
import { lerTimePublico, useStore } from '../lib/store';
import { FORMATOS, uid as newId, type Team } from '../lib/team';
import '../styles/dex.css';
import '../styles/team.css';

export default function TeamView() {
  const { id, uid, teamId } = useParams();
  const idx = useDexIndex();
  const { salvarTime } = useStore();
  const nav = useNavigate();
  const [exp, setExp] = useState(false);

  const exemplo = id ? timesExemplo.find((t) => t.team.id === id) : undefined;
  const cloud = useAsync(() => (uid && teamId ? lerTimePublico(uid, teamId) : Promise.resolve(null)), [uid, teamId]);

  const team: Team | null = useMemo(() => {
    if (exemplo) {
      if (!idx.data) return null;
      return { ...exemplo.team, pokemon: importTeam(exemplo.showdown ?? '', idx.data).slots };
    }
    return cloud.data ?? null;
  }, [exemplo, idx.data, cloud.data]);
  const autor = exemplo?.autor ?? team?.autorNick ?? 'Treinador';

  if (!exemplo && !cloud.loading && !cloud.data)
    return (
      <Consult title="Time">
        {cloud.error ? (
          <ErrorRetry onRetry={cloud.retry} msg="Não consegui abrir este time." />
        ) : (
          <div className="state-box">
            <p>
              <b>Este time não existe ou não é público.</b>
            </p>
            <Link to="/times/comunidade" className="btn btn-sm">
              Ver times da comunidade
            </Link>
          </div>
        )}
      </Consult>
    );

  return (
    <Consult
      back={{ to: '/times/comunidade', label: 'Voltar' }}
      title={team?.nome ?? exemplo?.team.nome ?? '…'}
      intro={
        <span className="view-author">
          <SkinHead nick={exemplo?.skin ?? autor} size={28} /> por{' '}
          {exemplo ? <b>{autor}</b> : <Link to={`/jogador/${encodeURIComponent(autor)}`}>{autor}</Link>} ·{FORMATOS.find((f) => f.id === team?.formato)?.nome}
          {exemplo && <span className="exemplo-flag">Exemplo</span>}
        </span>
      }
      actions={
        team && (
          <>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setExp(true)}>
              <FileOutput size={16} aria-hidden /> Exportar
            </button>
            <button
              type="button"
              className="btn btn-coral btn-sm"
              onClick={() => {
                const c = { ...team, id: newId(), nome: `${team.nome} (cópia)`, publico: false, autorUid: undefined, atualizadoEm: Date.now() };
                salvarTime(c);
                nav(`/times/${c.id}`);
              }}
            >
              <CopyPlus size={16} aria-hidden /> Copiar para meus times
            </button>
          </>
        )
      }
    >
      <main id="conteudo" className="view">
        {!team ? (
          <div className="skeleton" style={{ height: 300 }} />
        ) : (
          <div className="view-grid">
            <ol className="view-mons">
              {team.pokemon.map((s) => {
                const e = idx.data?.find((x) => x.id === s.dex);
                const nat = NATURES.find((n) => n.en === s.natureza);
                return (
                  <li key={s.uid} className="view-mon">
                    <Link to={`/pokedex/${s.dex}`} className="view-mon-art">
                      <img src={spriteUrl(s.dex, s.shiny)} alt="" width={96} height={96} loading="lazy" />
                    </Link>
                    <div>
                      <h3>
                        {s.apelido ? `${s.apelido} (${prettyName(s.especie)})` : prettyName(s.especie)}
                        <span className="pixel muted"> Nv {s.nivel}</span>
                      </h3>
                      <div className="se-types">{e?.types.map((t) => <TypeBadge key={t} type={t} small />)}</div>
                      <dl className="view-facts">
                        {s.item && (
                          <div>
                            <dt>Item</dt>
                            <dd>{s.item}</dd>
                          </div>
                        )}
                        {s.habilidade && (
                          <div>
                            <dt>Habilidade</dt>
                            <dd>{prettyName(s.habilidade)}</dd>
                          </div>
                        )}
                        <div>
                          <dt>Natureza</dt>
                          <dd>{nat ? nat.pt : s.natureza}</dd>
                        </div>
                        {s.tera && (
                          <div>
                            <dt>Tera</dt>
                            <dd>{typePt[s.tera]}</dd>
                          </div>
                        )}
                      </dl>
                      <ul className="view-moves">
                        {s.golpes.map((g) => (
                          <li key={g}>{prettyName(g)}</li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ol>
            <section className="dex-panel">
              <h2 className="panel-title">Análise do time</h2>
              <TeamAnalysis slots={team.pokemon} index={idx.data} />
            </section>
          </div>
        )}
      </main>
      {exp && team && <ShowdownDialog mode="export" slots={team.pokemon} onClose={() => setExp(false)} />}
    </Consult>
  );
}
