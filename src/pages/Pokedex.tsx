import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { AddToTeam } from '../components/AddToTeam';
import { Consult } from '../components/Shell';
import { ErrorRetry, TypeBadge } from '../components/ui';
import { modpackData, useDexIndex } from '../lib/hooks';
import { LEGENDARY, MYTHICAL, spriteUrl } from '../lib/pokeapi';
import { GENS, TYPES, dexNum, genOf, typePt } from '../lib/pt';
import '../styles/dex.css';

const PAGE = 48;

export default function Pokedex() {
  const { data, error, loading, retry } = useDexIndex();
  const [sp, setSp] = useSearchParams();
  const q = sp.get('q') ?? '';
  const tipo = sp.get('tipo') ?? '';
  const gen = sp.get('gen') ?? 'campanha';
  const lend = sp.get('lend') === '1';
  const mod = sp.get('mod') === '1';
  const shownKey = 'dex:mostrados:' + sp.toString();
  const [shown, setShownRaw] = useState(() => {
    try {
      return Number(sessionStorage.getItem(shownKey)) || PAGE;
    } catch {
      return PAGE;
    }
  });
  const setShown = (f: number | ((n: number) => number)) =>
    setShownRaw((n) => {
      const v = typeof f === 'function' ? f(n) : f;
      try {
        sessionStorage.setItem(shownKey, String(v));
      } catch {
        /* ok */
      }
      return v;
    });
  const primeiro = useRef(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  const set = (k: string, v: string | null) => {
    const n = new URLSearchParams(sp);
    if (v === null || v === '') n.delete(k);
    else n.set(k, v);
    setSp(n, { replace: true });
  };

  const list = useMemo(() => {
    if (!data) return [];
    const term = q.trim().toLowerCase().replace(/^#/, '');
    const num = /^\d+$/.test(term) ? Number(term) : null;
    return data.filter((p) => {
      if (num !== null) return String(p.id).startsWith(String(num));
      if (term && !p.name.toLowerCase().includes(term) && !p.slug.includes(term)) return false;
      if (gen === 'campanha' && p.id > 493) return false;
      if (gen !== 'campanha' && gen !== 'todas' && genOf(p.id) !== Number(gen)) return false;
      if (tipo && !p.types.includes(tipo)) return false;
      if (lend && !LEGENDARY.has(p.id) && !MYTHICAL.has(p.id)) return false;
      if (mod && !modpackData[String(p.id)]?.disponivel) return false;
      return true;
    });
  }, [data, q, tipo, gen, lend, mod]);

  useEffect(() => {
    if (primeiro.current) {
      primeiro.current = false;
      return;
    }
    setShown(PAGE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, tipo, gen, lend, mod]);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShown((s) => s + PAGE), { rootMargin: '600px' });
    io.observe(el);
    return () => io.disconnect();
  }, [data]);

  const activeCount = [tipo, gen !== 'campanha' ? gen : '', lend ? '1' : '', mod ? '1' : ''].filter(Boolean).length;

  return (
    <Consult title={<>Pokédex</>} intro="Busque por nome ou número. Por padrão, só as gerações das regiões da campanha (Kanto a Sinnoh).">
      <main id="conteudo">
        <div className="dex-toolbar">
          <label className="dex-search">
            <Search size={18} aria-hidden />
            <span className="sr-only">Buscar Pokémon por nome ou número</span>
            <input
              type="search"
              inputMode="search"
              placeholder="Nome ou número (ex.: Gengar, 94)"
              value={q}
              onChange={(e) => set('q', e.target.value)}
              autoComplete="off"
            />
            {q && (
              <button type="button" aria-label="Limpar busca" onClick={() => set('q', null)}>
                <X size={16} aria-hidden />
              </button>
            )}
          </label>
          <button type="button" className="btn btn-ghost filters-btn" aria-expanded={filtersOpen} aria-controls="dex-filters" onClick={() => setFiltersOpen((o) => !o)}>
            <SlidersHorizontal size={18} aria-hidden /> Filtros{activeCount ? ` (${activeCount})` : ''}
          </button>
        </div>

        <div id="dex-filters" className={`dex-filters${filtersOpen ? ' open' : ''}`}>
          <div className="filter-row" role="group" aria-label="Geração e região">
            <button type="button" className="chip" aria-pressed={gen === 'campanha'} onClick={() => set('gen', null)}>
              Campanha (Gen 1–4)
            </button>
            {GENS.map((g) => (
              <button key={g.gen} type="button" className="chip" aria-pressed={gen === String(g.gen)} onClick={() => set('gen', String(g.gen))}>
                {g.regiao}
              </button>
            ))}
            <button type="button" className="chip" aria-pressed={gen === 'todas'} onClick={() => set('gen', 'todas')}>
              Todas
            </button>
          </div>
          <div className="filter-row" role="group" aria-label="Tipo">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={`type-chip t-${t}`}
                aria-pressed={tipo === t}
                onClick={() => set('tipo', tipo === t ? null : t)}
              >
                {typePt[t]}
              </button>
            ))}
          </div>
          <div className="filter-row">
            <label className="check">
              <input type="checkbox" checked={lend} onChange={(e) => set('lend', e.target.checked ? '1' : null)} />
              Lendários e míticos
            </label>
            <label className="check">
              <input type="checkbox" checked={mod} onChange={(e) => set('mod', e.target.checked ? '1' : null)} />
              Disponível no modpack
            </label>
            {activeCount > 0 && (
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setSp(q ? { q } : {}, { replace: true })}>
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {error ? (
          <ErrorRetry onRetry={retry} />
        ) : loading && !data ? (
          <ul className="dex-grid" aria-busy="true" aria-label="Carregando Pokédex">
            {Array.from({ length: 18 }, (_, i) => (
              <li key={i} className="dex-card skel">
                <div className="skeleton" style={{ aspectRatio: '1', width: '70%', margin: '0 auto' }} />
                <div className="skeleton" style={{ height: 14, width: '40%' }} />
                <div className="skeleton" style={{ height: 18, width: '70%' }} />
              </li>
            ))}
          </ul>
        ) : (
          <>
            <p className="dex-count" role="status">
              <span className="pixel tabular">{list.length}</span> Pokémon
              {mod && <span className="muted"> · disponibilidade vem de data/modpack-pokemon.json</span>}
            </p>
            {list.length === 0 ? (
              <div className="state-box">
                <p>
                  <b>Nenhum Pokémon com esses filtros.</b> {gen === 'campanha' && 'A busca padrão cobre só Gen 1–4: tente "Todas".'}
                </p>
                <button type="button" className="btn btn-sm" onClick={() => setSp({}, { replace: true })}>
                  Limpar busca e filtros
                </button>
              </div>
            ) : (
              <ul className="dex-grid">
                {list.slice(0, shown).map((p) => (
                  <li key={p.id} className="dex-card">
                    <Link to={`/pokedex/${p.id}`} className="dex-card-link">
                      <span className="dex-num pixel">{dexNum(p.id)}</span>
                      <img src={spriteUrl(p.id)} alt="" width={96} height={96} loading="lazy" decoding="async" />
                      <span className="dex-name">{p.name}</span>
                      <span className="dex-types">
                        {p.types.map((t) => (
                          <TypeBadge key={t} type={t} small />
                        ))}
                      </span>
                    </Link>
                    <AddToTeam dex={p.id} especie={p.slug} nome={p.name} compact />
                  </li>
                ))}
              </ul>
            )}
            <div ref={sentinel} aria-hidden="true" />
            {shown < list.length && (
              <button type="button" className="btn dex-more" onClick={() => setShown((s) => s + PAGE)}>
                Mostrar mais
              </button>
            )}
          </>
        )}
      </main>
    </Consult>
  );
}
