/**
 * Dados do jogo no perfil: Pokédex, time atual (party) e PC — tudo vindo do servidor Minecraft,
 * ao vivo. Usado em /perfil (dono) e /jogador/:nick (público).
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, ChevronDown, Search, Sparkles, X } from 'lucide-react';
import { useTreinador, type MonJogo, type Treinador } from '../lib/jogo';
import { spriteUrl } from '../lib/pokeapi';
import { MAX_DEX, STAT_KEYS, dexNum, prettyName, statKeyPt } from '../lib/pt';
import '../styles/jogo.css';

const nomeMon = (m: MonJogo) => prettyName(m.especie) + (m.forma ? ` (${prettyName(m.forma)})` : '');

function haQuanto(ms: number) {
  if (!ms) return 'ainda não sincronizado';
  const s = Math.round((Date.now() - ms) / 1000);
  if (s < 60) return 'agora mesmo';
  const m = Math.round(s / 60);
  if (m < 60) return `há ${m} min`;
  const h = Math.round(m / 60);
  if (h < 48) return `há ${h} h`;
  return `em ${new Date(ms).toLocaleDateString('pt-BR')}`;
}

function SexoIcone({ s }: { s: MonJogo['sexo'] }) {
  if (s === 'M')
    return (
      <span className="sexo m" title="Macho" aria-label="Macho">
        ♂
      </span>
    );
  if (s === 'F')
    return (
      <span className="sexo f" title="Fêmea" aria-label="Fêmea">
        ♀
      </span>
    );
  return null;
}

function Barras({ titulo, v, max }: { titulo: string; v: MonJogo['ivs']; max: number }) {
  if (!v) return null;
  return (
    <div className="mon-stats">
      <span className="label">{titulo}</span>
      <dl>
        {STAT_KEYS.map((k) => (
          <div key={k}>
            <dt>{statKeyPt[k]}</dt>
            <dd>
              <span className="bar" style={{ ['--p' as string]: v[k] / max }} />
              <b className="tabular">{v[k]}</b>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Ficha completa de um Pokémon (usada no time e ao abrir um do PC). */
export function FichaMon({ m, compacta }: { m: MonJogo; compacta?: boolean }) {
  const [aberta, setAberta] = useState(false);
  return (
    <article className={`mon-ficha${m.shiny ? ' shiny' : ''}${compacta ? ' compacta' : ''}`}>
      <header className="mon-ficha-top">
        <Link to={`/pokedex/${m.dex}`} className="mon-ficha-sprite" title={`Ver ${nomeMon(m)} na Pokédex`}>
          <img src={spriteUrl(m.dex, m.shiny)} alt="" width={72} height={72} loading="lazy" />
          {m.shiny && <Sparkles size={14} className="mon-shiny" aria-label="Shiny" />}
        </Link>
        <div className="mon-ficha-nome">
          <b>
            {m.apelido || nomeMon(m)} <SexoIcone s={m.sexo} />
          </b>
          <span className="muted small">
            {m.apelido ? `${nomeMon(m)} · ` : ''}
            {dexNum(m.dex)}
          </span>
        </div>
        <span className="mon-nivel pixel tabular">Nv {m.nivel}</span>
      </header>
      <dl className="mon-ficha-dados">
        {m.habilidade && (
          <div>
            <dt>Habilidade</dt>
            <dd>{prettyName(m.habilidade.replace(/_/g, '-'))}</dd>
          </div>
        )}
        {m.natureza && (
          <div>
            <dt>Natureza</dt>
            <dd>{prettyName(m.natureza)}</dd>
          </div>
        )}
        {m.item && (
          <div>
            <dt>Item</dt>
            <dd>{prettyName(m.item.replace(/^[a-z_]+:/, '').replace(/_/g, '-'))}</dd>
          </div>
        )}
        {m.tera && (
          <div>
            <dt>Tera</dt>
            <dd>{prettyName(m.tera)}</dd>
          </div>
        )}
      </dl>
      {m.golpes.length > 0 && (
        <ul className="mon-golpes" aria-label="Golpes">
          {m.golpes.map((g) => (
            <li key={g}>{prettyName(g.replace(/_/g, '-'))}</li>
          ))}
        </ul>
      )}
      {(m.ivs || m.evs) && (
        <>
          <button type="button" className="mon-mais" aria-expanded={aberta} onClick={() => setAberta((x) => !x)}>
            IVs e EVs <ChevronDown size={14} aria-hidden />
          </button>
          {aberta && (
            <div className="mon-ivev">
              <Barras titulo="IVs" v={m.ivs} max={31} />
              <Barras titulo="EVs" v={m.evs} max={252} />
            </div>
          )}
        </>
      )}
    </article>
  );
}

function Pokedex({ t }: { t: Treinador }) {
  const p = t.pokedex;
  if (!p) return null;
  const linhas = [
    { rot: 'Vistos', n: p.total_vistos },
    { rot: 'Capturados', n: p.total_capturados },
  ];
  return (
    <div className="jogo-dex">
      {linhas.map((l) => (
        <div key={l.rot} className="jogo-dex-linha">
          <span className="label">{l.rot}</span>
          <span className="jogo-dex-bar" style={{ ['--p' as string]: Math.min(1, l.n / MAX_DEX) }} aria-hidden="true" />
          <b className="pixel tabular">
            {l.n}
            <span className="muted"> / {MAX_DEX}</span>
          </b>
        </div>
      ))}
    </div>
  );
}

function PC({ pc }: { pc: MonJogo[] }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<number | null>(null);
  const caixas = useMemo(() => {
    const termo = q.trim().toLowerCase();
    const filtrados = pc
      .map((m, i) => ({ m, i }))
      .filter(({ m }) => !termo || nomeMon(m).toLowerCase().includes(termo) || (m.apelido ?? '').toLowerCase().includes(termo) || String(m.dex) === termo);
    const mapa = new Map<number, { m: MonJogo; i: number }[]>();
    filtrados.forEach((x) => {
      const c = x.m.caixa ?? 0;
      if (!mapa.has(c)) mapa.set(c, []);
      mapa.get(c)!.push(x);
    });
    return [...mapa.entries()].sort((a, b) => a[0] - b[0]).map(([c, l]) => ({ c, l: l.sort((a, b) => (a.m.slot ?? 0) - (b.m.slot ?? 0)) }));
  }, [pc, q]);
  const escolhido = sel !== null ? pc[sel] : null;

  return (
    <div className="jogo-pc">
      <div className="jogo-pc-head">
        <label className="dex-search jogo-pc-busca">
          <Search size={16} aria-hidden />
          <span className="sr-only">Buscar no PC</span>
          <input type="search" placeholder={`Buscar entre ${pc.length} Pokémon`} value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>
      {escolhido && (
        <div className="jogo-pc-sel">
          <button type="button" className="btn btn-sm btn-ghost btn-icon jogo-pc-fechar" aria-label="Fechar ficha" onClick={() => setSel(null)}>
            <X size={16} aria-hidden />
          </button>
          <FichaMon m={escolhido} />
        </div>
      )}
      {caixas.map(({ c, l }) => (
        <section key={c} className="jogo-caixa" aria-label={c ? `Caixa ${c}` : 'PC'}>
          {caixas.length > 1 && <h4 className="jogo-caixa-nome">{c ? `Caixa ${c}` : 'Sem caixa'}</h4>}
          <ul className="jogo-caixa-grid">
            {l.map(({ m, i }) => (
              <li key={i}>
                <button type="button" aria-pressed={sel === i} onClick={() => setSel(sel === i ? null : i)} title={`${m.apelido || nomeMon(m)} · Nv ${m.nivel}`}>
                  <img src={spriteUrl(m.dex, m.shiny)} alt={`${m.apelido || nomeMon(m)}, nível ${m.nivel}`} width={48} height={48} loading="lazy" />
                  <span className="pixel tabular">{m.nivel}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {!caixas.length && <p className="muted small">Nenhum Pokémon com “{q}” no PC.</p>}
    </div>
  );
}

/** Bloco completo. `uuid` vazio = jogador ainda não vinculou a conta. */
export function TreinadorJogo({ uuid, dono }: { uuid?: string | null; dono?: boolean }) {
  const { data: t, carregando, erro } = useTreinador(uuid);
  if (!uuid) return null;
  if (carregando) return <div className="skeleton" style={{ height: 220 }} />;
  if (erro === 'privado') return null;
  if (!t || !t.atualizadoEm)
    return (
      <section className="dex-panel jogo">
        <h2 className="panel-title">No servidor</h2>
        <p className="muted">
          {dono ? 'Sua conta está vinculada. Entre no servidor: o time, o PC e a Pokédex aparecem aqui assim que o jogo sincronizar.' : 'Os dados do jogo aparecem aqui quando o servidor sincronizar.'}
        </p>
      </section>
    );

  return <TreinadorConteudo t={t} />;
}

/** Parte visual (sem Firebase): recebe os dados prontos. */
export function TreinadorConteudo({ t }: { t: Treinador }) {
  const [aba, setAba] = useState<'time' | 'pc'>('time');
  return (
    <section className="dex-panel jogo" aria-labelledby="jogo-titulo">
      <div className="jogo-head">
        <h2 id="jogo-titulo" className="panel-title">
          No servidor
        </h2>
        <span className="jogo-sync">
          <span className="live-dot" aria-hidden="true" /> Sincronizado {haQuanto(t.atualizadoEm)}
          {t.level_cap ? ` · teto de nível ${t.level_cap}` : ''}
        </span>
      </div>
      <Pokedex t={t} />
      <div className="seg jogo-abas" role="tablist" aria-label="Time e PC">
        <button type="button" role="tab" aria-selected={aba === 'time'} onClick={() => setAba('time')}>
          Time atual <span className="pixel tabular">{t.party?.length ?? 0}</span>
        </button>
        <button type="button" role="tab" aria-selected={aba === 'pc'} onClick={() => setAba('pc')}>
          <Box size={14} aria-hidden /> PC <span className="pixel tabular">{t.pc?.length ?? 0}</span>
        </button>
      </div>
      {aba === 'time' ? (
        t.party?.length ? (
          <div className="jogo-time">
            {t.party.map((m, i) => (
              <FichaMon key={i} m={m} />
            ))}
          </div>
        ) : (
          <p className="muted">Nenhum Pokémon no time agora.</p>
        )
      ) : t.pc?.length ? (
        <PC pc={t.pc} />
      ) : (
        <p className="muted">O PC está vazio ou ainda não foi sincronizado.</p>
      )}
    </section>
  );
}
