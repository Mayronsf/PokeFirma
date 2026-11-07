import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Gem, Sparkles } from 'lucide-react';
import { AddToTeam } from '../components/AddToTeam';
import { Consult } from '../components/Shell';
import { ErrorRetry, Tbd, TypeBadge } from '../components/ui';
import { capitulos, lendarios } from '../content/lore';
import { modpackData, useAsync, useDexIndex } from '../lib/hooks';
import { artworkUrl, getEvolution, getPokemon, getSpecies, spriteUrl, traduzirPt, type EvoNode, type MoveLearn } from '../lib/pokeapi';
import { MAX_DEX, dexNum, prettyName, statPt } from '../lib/pt';
import { defensiveProfile, multLabel } from '../lib/typechart';
import '../styles/dex.css';

function EvoTree({ node, current }: { node: EvoNode; current: number }) {
  return (
    <div className="evo-branch">
      <Link replace to={`/pokedex/${node.id}`} className={`evo-mon${node.id === current ? ' is-current' : ''}`} aria-current={node.id === current ? 'page' : undefined}>
        <img src={spriteUrl(node.id)} alt="" width={72} height={72} loading="lazy" />
        <span>{node.name}</span>
      </Link>
      {node.children.length > 0 && (
        <div className="evo-children">
          {node.children.map((c) => (
            <div key={c.id} className="evo-step">
              <span className="evo-how">
                <ChevronRight size={16} aria-hidden />
                {c.how}
              </span>
              <EvoTree node={c} current={current} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Weak({ types }: { types: string[] }) {
  const prof = defensiveProfile(types);
  const groups: { label: string; f: (m: number) => boolean }[] = [
    { label: 'Fraco (4×)', f: (m) => m === 4 },
    { label: 'Fraco (2×)', f: (m) => m === 2 },
    { label: 'Resiste (½×)', f: (m) => m === 0.5 },
    { label: 'Resiste (¼×)', f: (m) => m === 0.25 },
    { label: 'Imune (0×)', f: (m) => m === 0 },
  ];
  return (
    <div className="weak">
      {groups.map((g) => {
        const ts = prof.filter((p) => g.f(p.mult));
        if (!ts.length) return null;
        return (
          <div key={g.label} className="weak-row">
            <span className="weak-label">{g.label}</span>
            <span className="weak-types">
              {ts.map((t) => (
                <TypeBadge key={t.type} type={t.type} small />
              ))}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Moves({ moves, vg }: { moves: MoveLearn[]; vg: string }) {
  const [tab, setTab] = useState<'level' | 'machine' | 'outros'>('level');
  const list = moves.filter((m) => (tab === 'outros' ? m.method === 'egg' || m.method === 'tutor' : m.method === tab));
  const tabs = [
    { id: 'level', label: 'Por nível' },
    { id: 'machine', label: 'Por TM' },
    { id: 'outros', label: 'Ovo e tutor' },
  ] as const;
  return (
    <section className="dex-panel" aria-labelledby="moves-title">
      <div className="panel-head">
        <h2 id="moves-title" className="panel-title">
          Golpes
        </h2>
        <span className="muted small">Jogo de referência: {prettyName(vg)}</span>
      </div>
      <div className="seg" role="tablist" aria-label="Forma de aprender">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
            <span className="pixel">{moves.filter((m) => (t.id === 'outros' ? m.method === 'egg' || m.method === 'tutor' : m.method === t.id)).length}</span>
          </button>
        ))}
      </div>
      {list.length ? (
        <ul className="move-list">
          {list.map((m, i) => (
            <li key={m.slug + i}>
              {tab === 'level' && <span className="pixel tabular move-lv">{m.level === 0 ? 'Evo' : `Nv ${m.level}`}</span>}
              {tab === 'outros' && <span className="move-lv small">{m.method === 'egg' ? 'Ovo' : 'Tutor'}</span>}
              <span>{prettyName(m.slug)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Nenhum golpe nesta categoria.</p>
      )}
      <p className="muted small">Nomes de golpes em inglês, como no Cobblemon.</p>
    </section>
  );
}

export default function PokemonPage() {
  const params = useParams();
  const idx = useDexIndex();
  const raw = params.id ?? '1';
  const id = useMemo(() => {
    if (/^\d+$/.test(raw)) return Number(raw);
    return idx.data?.find((p) => p.slug === raw.toLowerCase())?.id ?? 0;
  }, [raw, idx.data]);
  const [shiny, setShiny] = useState(false);
  const [megaId, setMegaId] = useState<number | null>(null);
  const [voltando, setVoltando] = useState(false);
  useEffect(() => {
    setMegaId(null);
    setVoltando(false);
  }, [id]);

  const p = useAsync(() => (id ? getPokemon(id) : Promise.reject(new Error('Pokémon não encontrado'))), [id]);
  const s = useAsync(() => (id ? getSpecies(id) : Promise.reject(new Error('—'))), [id]);
  const evo = useAsync(
    () => (s.data?.evoChainUrl ? getEvolution(s.data.evoChainUrl) : Promise.resolve(null)),
    [s.data?.evoChainUrl],
  );

  const info = modpackData[String(id)];
  const lore = lendarios.find((l) => l.dex === id);
  const base = p.data;
  const megas = s.data?.megas ?? [];
  const mega = megas.find((m) => m.id === megaId) ?? null;
  const mp = useAsync(() => (mega ? getPokemon(mega.id) : Promise.resolve(null)), [mega?.id]);
  const d = base && mega && mp.data ? { ...mp.data, name: mega.nome, slug: base.slug, moves: base.moves, versionGroup: base.versionGroup } : base;
  const carregandoMega = !!mega && !mp.data && !mp.error;
  const artId = mega ? mega.id : id;
  const restritaUbers = mega && ['mewtwo-mega-x', 'mewtwo-mega-y', 'rayquaza-mega', 'groudon-primal', 'kyogre-primal'].includes(mega.slug);
  const total = d?.stats.reduce((a, b) => a + b.base, 0) ?? 0;

  if (!id && !idx.loading)
    return (
      <Consult title="Pokédex" back={{ to: '/pokedex', label: 'Voltar para a Pokédex' }}>
        <div className="state-box">
          <p>
            <b>Não encontrei “{raw}”.</b>
          </p>
          <Link to="/pokedex" className="btn btn-sm">
            Voltar à Pokédex
          </Link>
        </div>
      </Consult>
    );

  return (
    <Consult
      back={{ to: '/pokedex', label: 'Voltar para a Pokédex' }}
      title={
        <>
          <span className="pixel dex-title-num">{dexNum(id)}</span>
          {mega ? mega.nome : base?.name ?? idx.data?.find((x) => x.id === id)?.name ?? '…'}
        </>
      }
      actions={
        <nav className="dex-pager" aria-label="Pokémon vizinhos">
          {id > 1 && (
            <Link replace to={`/pokedex/${id - 1}`} className="btn btn-sm btn-ghost" aria-label="Pokémon anterior">
              <ChevronLeft size={16} aria-hidden /> {dexNum(id - 1)}
            </Link>
          )}
          {id < MAX_DEX && (
            <Link replace to={`/pokedex/${id + 1}`} className="btn btn-sm btn-ghost" aria-label="Próximo Pokémon">
              {dexNum(id + 1)} <ChevronRight size={16} aria-hidden />
            </Link>
          )}
        </nav>
      }
    >
      <main id="conteudo" className="mon">
        {p.error ? (
          <ErrorRetry onRetry={p.retry} />
        ) : (
          <>
            <section className="mon-hero">
              <div className={`mon-art${d ? ` t-${d.types[0]}` : ''}`}>
                {d ? (
                  <img
                    key={artId + (shiny ? 's' : '')}
                    className={mega ? 'mega-in' : voltando ? 'mega-out' : undefined}
                    onAnimationEnd={() => setVoltando(false)}
                    src={artworkUrl(artId, shiny)}
                    alt={`${mega ? mega.nome : d.name}${shiny ? ' shiny' : ''}, arte oficial`}
                    width={420}
                    height={420}
                  />
                ) : (
                  <div className="skeleton" style={{ width: '70%', aspectRatio: '1' }} />
                )}
                <button type="button" className="shiny-toggle" aria-pressed={shiny} onClick={() => setShiny((x) => !x)}>
                  <Sparkles size={16} aria-hidden /> {shiny ? 'Shiny' : 'Normal'}
                </button>
                {megas.length > 0 && (
                  <div className="form-toggle" role="radiogroup" aria-label="Forma">
                    <button type="button" role="radio" aria-checked={!mega}
                      onClick={() => {
                        if (mega) setVoltando(true);
                        setMegaId(null);
                      }}>
                      Base
                    </button>
                    {megas.map((m) => {
                      const letra = m.slug.match(/-([xyz])$/)?.[1];
                      return (
                        <button key={m.id} type="button" role="radio" aria-checked={megaId === m.id} onClick={() => setMegaId(m.id)} aria-label={m.nome}>
                          <Gem size={14} aria-hidden /> {m.primal ? 'Primal' : letra ? `Mega ${letra.toUpperCase()}` : 'Mega'}
                        </button>
                      );
                    })}
                  </div>
                )}
                {carregandoMega && (
                  <span className="form-loading" role="status">
                    Carregando {mega?.nome}…
                  </span>
                )}
              </div>
              <div className="mon-summary">
                {d ? (
                  <>
                    <div className="mon-types">
                      {d.types.map((t) => (
                        <TypeBadge key={t} type={t} />
                      ))}
                    </div>
                    {s.data?.genus && <Genus texto={s.data.genus} />}
                    <dl className="mon-measures">
                      <div>
                        <dt>Altura</dt>
                        <dd className="tabular">{(d.height / 10).toLocaleString('pt-BR')} m</dd>
                      </div>
                      <div>
                        <dt>Peso</dt>
                        <dd className="tabular">{(d.weight / 10).toLocaleString('pt-BR')} kg</dd>
                      </div>
                      <div>
                        <dt>Habilidades</dt>
                        <dd>
                          {d.abilities.map((a) => (
                            <span key={a.slug} className="ability">
                              {prettyName(a.slug)}
                              {a.hidden && <em> (oculta)</em>}
                            </span>
                          ))}
                        </dd>
                      </div>
                    </dl>
                    {s.data?.flavor && <Flavor texto={s.data.flavor} versao={s.data.flavorVersion} />}
                    {mega && (
                      <p className="mega-note">
                        <Gem size={15} aria-hidden />
                        {mega.primal
                          ? 'Forma Primal: Reversão Primal na batalha.'
                          : 'Mega Evolução: precisa da Mega Stone e de Mega Bracelet ou Omni Ring. Nas Copas, no máximo 1 Mega por batalha.'}
                        {restritaUbers && <b> Esta forma só é liberada na Copa Ubers.</b>}
                      </p>
                    )}
                    <AddToTeam dex={id} especie={d.slug} nome={base?.name ?? d.name} />
                  </>
                ) : (
                  <div className="mon-skel">
                    <div className="skeleton" style={{ height: 28, width: '50%' }} />
                    <div className="skeleton" style={{ height: 80 }} />
                    <div className="skeleton" style={{ height: 120 }} />
                  </div>
                )}
              </div>
            </section>

            <section className="dex-panel firma-block" aria-labelledby="firma-title">
              <div className="panel-head">
                <h2 id="firma-title" className="panel-title">
                  Na Firma League
                </h2>
                {info?.disponivel ? <span className="avail yes">Disponível no modpack</span> : <span className="avail">Disponibilidade <Tbd /></span>}
              </div>
              <dl className="firma-grid">
                {(
                  [
                    ['Bioma', info?.bioma],
                    ['Horário', info?.horario],
                    ['Raridade', info?.raridade],
                    ['Estrutura', info?.estrutura || lore?.local],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v ? v : <Tbd />}</dd>
                  </div>
                ))}
                <div>
                  <dt>Capítulo da lore</dt>
                  <dd>
                    {info?.capitulo || lore?.capitulo ? (
                      <Link to={`/lore#cap-${info?.capitulo || lore?.capitulo}`}>
                        {(info?.capitulo || lore?.capitulo)}. {capitulos[(info?.capitulo || lore?.capitulo || 1) - 1].regiao}
                      </Link>
                    ) : (
                      <span className="muted">Sem ligação com a lore</span>
                    )}
                  </dd>
                </div>
              </dl>
              {info?.observacoes && <p className="firma-obs">{info.observacoes}</p>}
            </section>

            <div className="mon-cols">
              <section className="dex-panel" aria-labelledby="stats-title">
                <h2 id="stats-title" className="panel-title">
                  Stats base
                </h2>
                {d ? (
                  <dl className="stats">
                    {d.stats.map((st) => (
                      <div key={st.key} className="stat">
                        <dt title={statPt[st.key]?.longo}>{statPt[st.key]?.curto ?? st.key}</dt>
                        <dd className="pixel tabular">{st.base}</dd>
                        <span className="stat-bar" aria-hidden="true">
                          <i style={{ width: `${Math.min(100, (st.base / 200) * 100)}%` }} className={st.base >= 100 ? 'hi' : st.base < 60 ? 'lo' : ''} />
                        </span>
                      </div>
                    ))}
                    <div className="stat total">
                      <dt>Total</dt>
                      <dd className="pixel tabular">{total}</dd>
                    </div>
                  </dl>
                ) : (
                  <div className="skeleton" style={{ height: 180 }} />
                )}
              </section>
              <section className="dex-panel" aria-labelledby="weak-title">
                <h2 id="weak-title" className="panel-title">
                  Fraquezas e resistências
                </h2>
                {d ? <Weak types={d.types} /> : <div className="skeleton" style={{ height: 180 }} />}
              </section>
            </div>

            <section className="dex-panel" aria-labelledby="evo-title">
              <h2 id="evo-title" className="panel-title">
                Evolução
              </h2>
              {evo.error ? (
                <ErrorRetry onRetry={evo.retry} msg="Não consegui carregar a cadeia de evolução." />
              ) : evo.data ? (
                evo.data.children.length ? (
                  <div className="evo">
                    <EvoTree node={evo.data} current={id} />
                  </div>
                ) : (
                  <p className="muted">Este Pokémon não evolui.</p>
                )
              ) : (
                <div className="skeleton" style={{ height: 100 }} />
              )}
            </section>

            {d && <Moves moves={d.moves} vg={d.versionGroup} />}
          </>
        )}
      </main>
    </Consult>
  );
}

export { multLabel };

/* ---------- descrição da Pokédex: português (tradução automática) por padrão, botão para ver o original ---------- */
type Idioma = 'pt' | 'en';
const LS_IDIOMA = 'firma:dex-idioma';
const ouvintes = new Set<(i: Idioma) => void>();
function lerIdioma(): Idioma {
  try {
    return localStorage.getItem(LS_IDIOMA) === 'en' ? 'en' : 'pt';
  } catch {
    return 'pt';
  }
}
function useIdiomaDex(): [Idioma, (i: Idioma) => void] {
  const [i, setI] = useState<Idioma>(lerIdioma);
  useEffect(() => {
    ouvintes.add(setI);
    return () => void ouvintes.delete(setI);
  }, []);
  const set = (n: Idioma) => {
    try {
      localStorage.setItem(LS_IDIOMA, n);
    } catch {
      /* ok */
    }
    ouvintes.forEach((f) => f(n));
  };
  return [i, set];
}
function useTraducao(texto: string, idioma: Idioma) {
  const [pt, setPt] = useState<{ de: string; txt: string | null } | null>(null);
  useEffect(() => {
    if (idioma !== 'pt' || !texto) return;
    let vivo = true;
    traduzirPt(texto)
      .then((t) => vivo && setPt({ de: texto, txt: t }))
      .catch(() => vivo && setPt({ de: texto, txt: null }));
    return () => {
      vivo = false;
    };
  }, [texto, idioma]);
  if (idioma === 'en') return { txt: texto, lang: 'en', carregando: false, falhou: false };
  if (!pt || pt.de !== texto) return { txt: texto, lang: 'en', carregando: true, falhou: false };
  return pt.txt ? { txt: pt.txt, lang: 'pt-BR', carregando: false, falhou: false } : { txt: texto, lang: 'en', carregando: false, falhou: true };
}

function Genus({ texto }: { texto: string }) {
  const [idioma] = useIdiomaDex();
  const t = useTraducao(texto, idioma);
  return (
    <p className="mon-genus" lang={t.lang}>
      {t.carregando ? ' ' : t.txt}
    </p>
  );
}

function Flavor({ texto, versao }: { texto: string; versao: string }) {
  const [idioma, setIdioma] = useIdiomaDex();
  const t = useTraducao(texto, idioma);
  return (
    <blockquote className="mon-flavor" aria-busy={t.carregando}>
      <span className="lang-switch" role="group" aria-label="Idioma da descrição" lang="pt-BR">
        {(['pt', 'en'] as const).map((i) => (
          <button key={i} type="button" aria-pressed={idioma === i} onClick={() => setIdioma(i)}>
            {i === 'pt' ? 'PT' : 'EN'}
          </button>
        ))}
      </span>
      <span lang={t.lang} className={t.carregando ? 'flavor-loading' : undefined}>
        {t.txt}
      </span>
      <cite lang="pt-BR">
        Pokédex de {versao}
        {idioma === 'pt' && !t.carregando && (t.falhou ? ' · tradução indisponível agora, mostrando o original' : ' · tradução automática')}
      </cite>
    </blockquote>
  );
}
