import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Copy, FileInput, FileOutput, Globe, Link2, Lock, Plus, Search, Sparkles, Trash2, X } from 'lucide-react';
import { config, type Chapter } from '../config';
import { Consult } from '../components/Shell';
import { ShowdownDialog } from '../components/ShowdownDialog';
import { TeamAnalysis } from '../components/TeamAnalysis';
import { Note, Tbd, TypeBadge } from '../components/ui';
import { useAsync, useDexIndex } from '../lib/hooks';
import { getHoldableItems, getPokemon, spriteUrl, type IndexEntry } from '../lib/pokeapi';
import { NATURES, STAT_KEYS, TYPES, dexNum, prettyName, statKeyPt, typePt } from '../lib/pt';
import { useStore } from '../lib/store';
import { FORMATOS, novoSlot, uid, type Slot, type Team } from '../lib/team';
import { validarTime } from '../lib/validate';
import '../styles/dex.css';
import '../styles/team.css';

/* ---------- seletor de Pokémon ---------- */
function PokemonPicker({ index, onPick, onClose }: { index: IndexEntry[] | undefined; onPick: (e: IndexEntry) => void; onClose: () => void }) {
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    if (!index) return [];
    const t = q.trim().toLowerCase();
    if (!t) return index.filter((p) => p.id <= 493).slice(0, 40);
    if (/^\d+$/.test(t)) return index.filter((p) => String(p.id).startsWith(t)).slice(0, 40);
    return index.filter((p) => p.name.toLowerCase().includes(t)).slice(0, 40);
  }, [index, q]);
  return (
    <div className="picker" role="dialog" aria-label="Escolher Pokémon">
      <div className="picker-head">
        <label className="dex-search">
          <Search size={18} aria-hidden />
          <span className="sr-only">Buscar Pokémon</span>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome ou número" />
        </label>
        <button type="button" className="btn btn-ghost btn-icon" aria-label="Cancelar" onClick={onClose}>
          <X size={18} aria-hidden />
        </button>
      </div>
      {!index ? (
        <div className="skeleton" style={{ height: 200 }} />
      ) : (
        <ul className="picker-list">
          {list.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => onPick(p)}>
                <img src={spriteUrl(p.id)} alt="" width={48} height={48} loading="lazy" />
                <span className="pixel">{dexNum(p.id)}</span>
                <b>{p.name}</b>
                <span className="picker-types">
                  {p.types.map((t) => (
                    <TypeBadge key={t} type={t} small />
                  ))}
                </span>
              </button>
            </li>
          ))}
          {!list.length && <li className="muted">Nada encontrado.</li>}
        </ul>
      )}
    </div>
  );
}

/* ---------- editor de um slot ---------- */
function SlotEditor({ slot, onChange, onRemove, itens, avisos }: { slot: Slot; onChange: (s: Slot) => void; onRemove: () => void; itens: string[]; avisos: string[] }) {
  const pk = useAsync(() => getPokemon(slot.dex), [slot.dex]);
  const d = pk.data;
  const learnable = useMemo(() => {
    if (!d) return [];
    return [...new Set(d.moves.map((m) => m.slug))].sort();
  }, [d]);
  const set = <K extends keyof Slot>(k: K, v: Slot[K]) => onChange({ ...slot, [k]: v });
  const natureza = NATURES.find((n) => n.en === slot.natureza);
  const evTotal = Object.values(slot.evs).reduce((a, b) => a + b, 0);
  const listId = `moves-${slot.uid}`;

  return (
    <div className="slot-editor">
      <div className="se-head">
        <img src={spriteUrl(slot.dex, slot.shiny)} alt="" width={96} height={96} />
        <div>
          <span className="pixel muted">{dexNum(slot.dex)}</span>
          <h3 className="se-name">{slot.apelido || prettyName(slot.especie)}</h3>
          <div className="se-types">{d?.types.map((t) => <TypeBadge key={t} type={t} small />)}</div>
        </div>
        <Link to={`/pokedex/${slot.dex}`} className="btn btn-sm btn-ghost se-dex">
          Pokédex
        </Link>
        <button type="button" className="btn btn-sm btn-ghost se-remove" onClick={onRemove}>
          <Trash2 size={15} aria-hidden /> Remover
        </button>
      </div>
      {avisos.map((a) => (
        <Note key={a} nivel="erro">
          {a}
        </Note>
      ))}
      {!!pk.error && <Note nivel="erro">Não consegui carregar habilidades e golpes deste Pokémon. Recarregue para tentar de novo.</Note>}

      <div className="se-grid">
        <label className="field">
          <span>Apelido</span>
          <input className="input" value={slot.apelido} maxLength={20} onChange={(e) => set('apelido', e.target.value)} placeholder={prettyName(slot.especie)} />
        </label>
        <label className="field">
          <span>Nível</span>
          <input
            className="input tabular"
            type="number"
            min={1}
            max={100}
            inputMode="numeric"
            value={slot.nivel}
            onChange={(e) => set('nivel', Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
          />
        </label>
        <label className="field">
          <span>Habilidade</span>
          <select className="input" value={slot.habilidade} onChange={(e) => set('habilidade', e.target.value)}>
            <option value="">Escolher…</option>
            {d?.abilities.map((a) => (
              <option key={a.slug} value={a.slug}>
                {prettyName(a.slug)}
                {a.hidden ? ' (oculta)' : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Item segurado</span>
          <input className="input" list="itens-seguraveis" value={slot.item} onChange={(e) => set('item', e.target.value)} placeholder="Ex.: Leftovers" />
        </label>
        <label className="field">
          <span>Natureza</span>
          <select className="input" value={slot.natureza} onChange={(e) => set('natureza', e.target.value)}>
            {NATURES.map((n) => (
              <option key={n.en} value={n.en}>
                {n.pt} ({n.en}){n.up ? ` +${statKeyPt[n.up]} −${statKeyPt[n.down!]}` : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Tipo Tera</span>
          <select className="input" value={slot.tera} onChange={(e) => set('tera', e.target.value)}>
            <option value="">Padrão</option>
            {[...TYPES, 'stellar'].map((t) => (
              <option key={t} value={t}>
                {typePt[t]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="se-moves">
        <legend>Golpes (até 4, só os que ele aprende)</legend>
        <datalist id={listId}>
          {learnable.map((m) => (
            <option key={m} value={prettyName(m)} />
          ))}
        </datalist>
        {[0, 1, 2, 3].map((i) => {
          const val = slot.golpes[i] ? prettyName(slot.golpes[i]) : '';
          return (
            <MoveInput
              key={i}
              n={i + 1}
              listId={listId}
              value={val}
              learnable={learnable}
              onCommit={(slug) => {
                const g = [...slot.golpes];
                if (slug) g[i] = slug;
                else g.splice(i, 1);
                set('golpes', g.filter(Boolean).slice(0, 4));
              }}
            />
          );
        })}
      </fieldset>

      <label className="check shiny-check">
        <input type="checkbox" checked={slot.shiny} onChange={(e) => set('shiny', e.target.checked)} />
        <Sparkles size={16} aria-hidden /> Shiny
      </label>

      <details className="se-adv">
        <summary>Modo avançado: EVs e IVs</summary>
        <div className="evs">
          <div className="evs-head">
            <span />
            <span>EV</span>
            <span>IV</span>
          </div>
          {STAT_KEYS.map((k) => (
            <div key={k} className="evs-row">
              <span className={`evs-stat${natureza?.up === k ? ' up' : natureza?.down === k ? ' down' : ''}`}>{statKeyPt[k]}</span>
              <input
                className="input tabular"
                type="number"
                min={0}
                max={252}
                step={4}
                aria-label={`EV de ${statKeyPt[k]}`}
                value={slot.evs[k]}
                onChange={(e) => set('evs', { ...slot.evs, [k]: Math.max(0, Math.min(252, Number(e.target.value) || 0)) })}
              />
              <input
                className="input tabular"
                type="number"
                min={0}
                max={31}
                aria-label={`IV de ${statKeyPt[k]}`}
                value={slot.ivs[k]}
                onChange={(e) => set('ivs', { ...slot.ivs, [k]: Math.max(0, Math.min(31, Number(e.target.value) || 0)) })}
              />
            </div>
          ))}
          <p className={`small${evTotal > 510 ? ' ev-over' : ' muted'}`}>
            EVs usados: <b className="tabular">{evTotal}</b> / 510
          </p>
        </div>
      </details>
      <datalist id="itens-seguraveis">
        {itens.map((i) => (
          <option key={i} value={i} />
        ))}
      </datalist>
    </div>
  );
}

function MoveInput({ n, listId, value, learnable, onCommit }: { n: number; listId: string; value: string; learnable: string[]; onCommit: (slug: string) => void }) {
  const [v, setV] = useState(value);
  const [bad, setBad] = useState(false);
  useEffect(() => setV(value), [value]);
  const commit = () => {
    const slug = v.trim().toLowerCase().replace(/[’'.]/g, '').replace(/\s+/g, '-');
    if (!v.trim()) {
      setBad(false);
      if (value) onCommit('');
      return;
    }
    if (learnable.length && !learnable.includes(slug)) {
      setBad(true);
      return;
    }
    setBad(false);
    onCommit(slug);
  };
  return (
    <label className="field">
      <span className="sr-only">Golpe {n}</span>
      <input
        className="input"
        list={listId}
        value={v}
        placeholder={`Golpe ${n}`}
        aria-invalid={bad}
        onChange={(e) => {
          setV(e.target.value);
          setBad(false);
        }}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), commit())}
      />
      {bad && <span className="field-err">Ele não aprende “{v}”.</span>}
    </label>
  );
}

/* ---------- página ---------- */
export default function TeamEditor() {
  const { teamId } = useParams();
  const nav = useNavigate();
  const { teams, salvarTime, excluirTime, profile, user } = useStore();
  const idx = useDexIndex();
  const itensQ = useAsync(() => getHoldableItems(), []);
  const stored = teams.find((t) => t.id === teamId);
  const [team, setTeam] = useState<Team | undefined>(stored);
  const [sel, setSel] = useState(0);
  const [picking, setPicking] = useState(false);
  const [dialog, setDialog] = useState<'import' | 'export' | null>(null);
  const [linkOk, setLinkOk] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (!team && stored) setTeam(stored);
  }, [stored, team]);

  // salvamento automático
  useEffect(() => {
    if (!team) return;
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => salvarTime(team), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team]);

  const avisos = useMemo(() => (team ? validarTime(team, profile.capitulo) : []), [team, profile.capitulo]);

  if (!team)
    return (
      <Consult title="Time">
        <div className="state-box">
          <p>
            <b>Não achei este time.</b> Ele pode ter sido excluído ou estar salvo em outro navegador.
          </p>
          <Link to="/times" className="btn btn-sm">
            Voltar aos meus times
          </Link>
        </div>
      </Consult>
    );

  const update = (patch: Partial<Team>) => setTeam((t) => (t ? { ...t, ...patch } : t));
  const slot = team.pokemon[sel];
  const shareUrl = user ? `${location.origin}/time/${user.uid}/${team.id}` : '';
  const errosPorSlot = (u: string) => avisos.filter((a) => a.slot === u && a.nivel === 'erro').map((a) => a.texto);
  const geral = avisos.filter((a) => !a.slot || a.nivel !== 'erro');

  return (
    <Consult
      back={{ to: '/times', label: 'Voltar para Meus times' }}
      title={
        <label className="team-name-field">
          <span className="sr-only">Nome do time</span>
          <input value={team.nome} onChange={(e) => update({ nome: e.target.value })} maxLength={40} />
        </label>
      }
      actions={
        <>
        </>
      }
    >
      <main id="conteudo" className="editor">
        <div className="editor-bar">
          <div className="seg" role="radiogroup" aria-label="Formato">
            {FORMATOS.map((f) => (
              <button key={f.id} type="button" role="radio" aria-checked={team.formato === f.id} aria-pressed={team.formato === f.id} title={f.desc} onClick={() => update({ formato: f.id })}>
                {f.nome}
              </button>
            ))}
          </div>
          {team.formato === 'historia' && (
            <label className="field inline">
              <span>Capítulo</span>
              <select className="input" value={team.capitulo ?? profile.capitulo} onChange={(e) => update({ capitulo: Number(e.target.value) as Chapter })}>
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}. {['Kanto', 'Johto', 'Hoenn', 'Sinnoh'][n - 1]} · cap {config.levelCaps[n as Chapter] ?? 'a definir'}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="editor-tools">
            <button type="button" className={`btn btn-sm ${team.publico ? 'btn-green' : 'btn-ghost'}`} aria-pressed={team.publico} onClick={() => update({ publico: !team.publico })}>
              {team.publico ? <Globe size={15} aria-hidden /> : <Lock size={15} aria-hidden />}
              {team.publico ? 'Público' : 'Privado'}
            </button>
            {team.publico && user && (
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => navigator.clipboard?.writeText(shareUrl).then(() => setLinkOk(true))}>
                {linkOk ? <Check size={15} aria-hidden /> : <Link2 size={15} aria-hidden />} {linkOk ? 'Link copiado' : 'Copiar link'}
              </button>
            )}
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setDialog('import')}>
              <FileInput size={15} aria-hidden /> Importar
            </button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setDialog('export')} disabled={!team.pokemon.length}>
              <FileOutput size={15} aria-hidden /> Exportar
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => {
                const c = { ...team, id: uid(), nome: `${team.nome} (cópia)`, publico: false, atualizadoEm: Date.now() };
                salvarTime(c);
                nav(`/times/${c.id}`);
                setTeam(c);
              }}
            >
              <Copy size={15} aria-hidden /> Duplicar
            </button>
            {confirmDel ? (
              <span className="confirm">
                Excluir?
                <button type="button" className="btn btn-sm danger" onClick={() => { excluirTime(team.id); nav('/times'); }}>
                  Sim, excluir
                </button>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => setConfirmDel(false)}>
                  Cancelar
                </button>
              </span>
            ) : (
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setConfirmDel(true)}>
                <Trash2 size={15} aria-hidden /> Excluir
              </button>
            )}
          </div>
        </div>
        {team.publico && !user && <Note nivel="info">Times públicos ganham link compartilhável quando você entra com Google.</Note>}

        <div className="editor-grid">
          <div className="editor-left">
            <ol className="slots" aria-label="Pokémon do time">
              {Array.from({ length: 6 }, (_, i) => {
                const s = team.pokemon[i];
                const hasErr = s && errosPorSlot(s.uid).length > 0;
                return (
                  <li key={i}>
                    {s ? (
                      <button
                        type="button"
                        className={`slot-btn${sel === i && !picking ? ' active' : ''}${hasErr ? ' has-err' : ''}`}
                        aria-current={sel === i && !picking ? 'true' : undefined}
                        onClick={() => {
                          setSel(i);
                          setPicking(false);
                        }}
                      >
                        <img src={spriteUrl(s.dex, s.shiny)} alt="" width={64} height={64} />
                        <span className="slot-name">{s.apelido || prettyName(s.especie)}</span>
                        <span className="pixel slot-lv">Nv {s.nivel}</span>
                        {hasErr && <span className="sr-only">(tem erro)</span>}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={`slot-btn empty${picking && i === team.pokemon.length ? ' active' : ''}`}
                        disabled={i !== team.pokemon.length}
                        onClick={() => setPicking(true)}
                        aria-label="Adicionar Pokémon"
                      >
                        <Plus size={22} aria-hidden />
                        {i === team.pokemon.length && <span className="slot-name">Adicionar</span>}
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>

            <div className="editor-panel">
              {picking ? (
                <PokemonPicker
                  index={idx.data}
                  onClose={() => setPicking(false)}
                  onPick={(e) => {
                    const n = novoSlot(e.id, e.slug, team.formato === 'ubers' ? { nivel: 100 } : {});
                    update({ pokemon: [...team.pokemon, n] });
                    setSel(team.pokemon.length);
                    setPicking(false);
                  }}
                />
              ) : slot ? (
                <SlotEditor
                  key={slot.uid}
                  slot={slot}
                  itens={itensQ.data ?? []}
                  avisos={errosPorSlot(slot.uid)}
                  onChange={(s) => update({ pokemon: team.pokemon.map((x) => (x.uid === s.uid ? s : x)) })}
                  onRemove={() => {
                    update({ pokemon: team.pokemon.filter((x) => x.uid !== slot.uid) });
                    setSel(Math.max(0, sel - 1));
                  }}
                />
              ) : (
                <div className="state-box">
                  <p>
                    <b>Time vazio.</b> Adicione até 6 Pokémon.
                  </p>
                  <button type="button" className="btn btn-coral btn-sm" onClick={() => setPicking(true)}>
                    <Plus size={16} aria-hidden /> Adicionar Pokémon
                  </button>
                </div>
              )}
            </div>
          </div>

          <aside className="editor-right" aria-label="Validação e análise">
            <section className="dex-panel">
              <h2 className="panel-title">Regras do formato</h2>
              {geral.length || avisos.length ? (
                <div className="rules-list">
                  {avisos.map((a, i) => (
                    <Note key={i} nivel={a.nivel}>
                      {a.texto.includes('[A DEFINIR]') ? (
                        <>
                          {a.texto.replace(' [A DEFINIR].', '')} <Tbd />
                        </>
                      ) : (
                        a.texto
                      )}
                    </Note>
                  ))}
                </div>
              ) : (
                <p className="ok-line">
                  <Check size={16} aria-hidden /> Tudo certo para {FORMATOS.find((f) => f.id === team.formato)?.nome}.
                </p>
              )}
              <Link to="/regulamento" className="text-link small">
                Ler o regulamento
              </Link>
            </section>
            <section className="dex-panel">
              <h2 className="panel-title">Análise do time</h2>
              <TeamAnalysis slots={team.pokemon} index={idx.data} />
            </section>
          </aside>
        </div>
      </main>
      {dialog && (
        <ShowdownDialog
          mode={dialog}
          slots={team.pokemon}
          onClose={() => setDialog(null)}
          onImport={(slots) => {
            update({ pokemon: slots });
            setSel(0);
            setDialog(null);
          }}
        />
      )}
    </Consult>
  );
}
