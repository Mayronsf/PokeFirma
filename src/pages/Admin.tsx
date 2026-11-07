import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Download, Plus, RotateCcw, Save, ShieldAlert, Shuffle, Trash2, Upload, X } from 'lucide-react';
import { Consult } from '../components/Shell';
import { Note, SkinHead } from '../components/ui';
import { firebaseEnabled } from '../lib/firebase';
import { souAdmin, useLiga, type Jogador, type LigaData, type Partida, type StatusTorneio, type Torneio } from '../lib/liga';
import { useDexIndex } from '../lib/hooks';
import { spriteUrl } from '../lib/pokeapi';
import { fmtData } from '../lib/pt';
import { FASES, FASE_GRUPOS, GRUPO_UNICO, classificadosPorGrupo, gruposDe, placarDe } from '../lib/torneio';
import { buscarPerfis, useStore } from '../lib/store';
import '../styles/team.css';
import '../styles/dex.css';
import '../styles/pages.css';

const STATUS: { v: StatusTorneio; label: string }[] = [
  { v: 'em-breve', label: 'Em breve' },
  { v: 'em-andamento', label: 'Em andamento' },
  { v: 'encerrado', label: 'Encerrado' },
];

function useAcesso() {
  const { user, pronto } = useStore();
  const [admin, setAdmin] = useState<boolean | null>(firebaseEnabled ? null : true);
  useEffect(() => {
    if (!firebaseEnabled) return;
    if (!pronto) return;
    if (!user) return setAdmin(false);
    souAdmin(user.uid).then(setAdmin).catch(() => setAdmin(false));
  }, [user, pronto]);
  return admin;
}

/* ---------- jogadores ---------- */
function Jogadores({ d, set }: { d: LigaData; set: (d: LigaData) => void }) {
  const [novo, setNovo] = useState('');
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  // Sugere nicks de quem já tem perfil público no site.
  useEffect(() => {
    if (!firebaseEnabled) return;
    let vivo = true;
    const t = setTimeout(() => {
      buscarPerfis(novo, 10)
        .then((r) => vivo && setSugestoes(r.map((p) => p.nick)))
        .catch(() => {});
    }, 250);
    return () => {
      vivo = false;
      clearTimeout(t);
    };
  }, [novo]);
  const upd = (i: number, patch: Partial<Jogador>) => set({ ...d, jogadores: d.jogadores.map((j, k) => (k === i ? { ...j, ...patch } : j)) });
  const ordem = useMemo(() => d.jogadores.map((j, i) => ({ j, i })).sort((a, b) => b.j.pontos - a.j.pontos), [d.jogadores]);
  return (
    <section className="dex-panel">
      <div className="panel-head">
        <h2 className="panel-title">Jogadores</h2>
        <form
          className="admin-add"
          onSubmit={(e) => {
            e.preventDefault();
            const n = novo.trim();
            if (!n || d.jogadores.some((j) => j.nick.toLowerCase() === n.toLowerCase())) return;
            set({ ...d, jogadores: [...d.jogadores, { nick: n, pontos: 0, vitorias: 0, derrotas: 0, titulos: [] }] });
            setNovo('');
          }}
        >
          <label className="sr-only" htmlFor="novo-jog">
            Nick do novo jogador
          </label>
          <input
            id="novo-jog"
            className="input"
            placeholder="Nick do Minecraft"
            list="perfis-cadastrados"
            autoComplete="off"
            value={novo}
            onChange={(e) => setNovo(e.target.value)}
            maxLength={16}
          />
          <datalist id="perfis-cadastrados">
            {sugestoes
              .filter((n) => !d.jogadores.some((j) => j.nick.toLowerCase() === n.toLowerCase()))
              .map((n) => (
                <option key={n} value={n} />
              ))}
          </datalist>
          <button type="submit" className="btn btn-sm">
            <Plus size={15} aria-hidden /> Adicionar
          </button>
        </form>
      </div>
      <div className="def-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Jogador</th>
              <th scope="col">Pontos</th>
              <th scope="col">V</th>
              <th scope="col">D</th>
              <th scope="col">Ajuste rápido</th>
              <th scope="col">
                <span className="sr-only">Remover</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {!ordem.length && (
              <tr>
                <td colSpan={7} className="muted">
                  Nenhum jogador no ranking ainda. Adicione pelo nick do Minecraft, o mesmo que a pessoa usa no perfil do site. Assim a posição e os
                  pontos aparecem no perfil dela.
                </td>
              </tr>
            )}
            {ordem.map(({ j, i }, pos) => (
              <tr key={j.nick}>
                <td className="pixel tabular">{pos + 1}</td>
                <th scope="row">
                  <span className="admin-player">
                    <SkinHead nick={j.skin || j.nick} size={28} />
                    {j.nick}
                  </span>
                </th>
                {(['pontos', 'vitorias', 'derrotas'] as const).map((k) => (
                  <td key={k}>
                    <input
                      className="input tabular admin-num"
                      type="number"
                      min={0}
                      aria-label={`${k} de ${j.nick}`}
                      value={j[k]}
                      onChange={(e) => upd(i, { [k]: Math.max(0, Number(e.target.value) || 0) })}
                    />
                  </td>
                ))}
                <td>
                  <span className="row-gap tight">
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => upd(i, { pontos: j.pontos + 3, vitorias: j.vitorias + 1 })}>
                      Vitória +3
                    </button>
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => upd(i, { derrotas: j.derrotas + 1 })}>
                      Derrota
                    </button>
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost btn-icon"
                    aria-label={`Remover ${j.nick}`}
                    onClick={() => confirm(`Remover ${j.nick} do ranking?`) && set({ ...d, jogadores: d.jogadores.filter((_, k) => k !== i) })}
                  >
                    <Trash2 size={15} aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ---------- torneios ---------- */
function TorneioEditor({ t, d, set }: { t: Torneio; d: LigaData; set: (d: LigaData) => void }) {
  const upd = (patch: Partial<Torneio>) => set({ ...d, torneios: d.torneios.map((x) => (x.id === t.id ? { ...x, ...patch } : x)) });
  const updP = (i: number, patch: Partial<Partida>) => upd({ chave: t.chave.map((p, k) => (k === i ? { ...p, ...patch } : p)) });
  const nicks = d.jogadores.map((j) => j.nick);
  const pend = t.chave.filter((p) => !p.placar).length;
  // Cria os confrontos que ainda não existem em cada grupo (todos contra todos).
  const gerarRodizio = () => {
    const grupos = gruposDe(t);
    const novas: Partida[] = [];
    for (const g of grupos) {
      const membros = (t.inscritos ?? []).filter((x) => (x.grupo || grupos[0] || GRUPO_UNICO) === g).map((x) => x.nick);
      for (let a = 0; a < membros.length; a++)
        for (let b = a + 1; b < membros.length; b++) {
          const ja = t.chave.some(
            (p) => p.fase === FASE_GRUPOS && ((p.a === membros[a] && p.b === membros[b]) || (p.a === membros[b] && p.b === membros[a])),
          );
          if (!ja) novas.push({ fase: FASE_GRUPOS, grupo: g, a: membros[a], b: membros[b], placar: null });
        }
    }
    if (!novas.length) return alert('Todos os confrontos dos grupos já existem.');
    upd({ chave: [...t.chave, ...novas] });
  };
  return (
    <article className={`admin-tourney s-${t.status}`}>
      <header className="admin-tourney-head">
        <div>
          <h3 className="h-sub">{t.nome || 'Torneio sem nome'}</h3>
          <p className="muted small">
            {t.chave.length} partidas · {pend} sem resultado
          </p>
        </div>
        <span className="row-gap tight">
          {t.status === 'em-andamento' && <span className="live-flag">Em andamento</span>}
          <button
            type="button"
            className="btn btn-sm btn-ghost btn-icon"
            aria-label={`Excluir o torneio ${t.nome}`}
            onClick={() =>
              confirm(`Excluir o torneio "${t.nome}"? A exclusão só vale depois de salvar.`) && set({ ...d, torneios: d.torneios.filter((x) => x.id !== t.id) })
            }
          >
            <Trash2 size={15} aria-hidden />
          </button>
        </span>
      </header>
      <div className="admin-grid">
        <label className="field wide">
          <span>Nome</span>
          <input className="input" value={t.nome} onChange={(e) => upd({ nome: e.target.value })} maxLength={80} />
        </label>
        <label className="field">
          <span>Capítulo</span>
          <select className="input" value={t.capitulo} onChange={(e) => upd({ capitulo: Number(e.target.value) })}>
            {['Kanto', 'Johto', 'Hoenn', 'Sinnoh'].map((r, i) => (
              <option key={r} value={i + 1}>
                {i + 1} · {r}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Status</span>
          <select className="input" value={t.status} onChange={(e) => upd({ status: e.target.value as StatusTorneio })}>
            {STATUS.map((s) => (
              <option key={s.v} value={s.v}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Data</span>
          <input className="input" type="date" value={t.data ?? ''} onChange={(e) => upd({ data: e.target.value || null })} />
        </label>
        <label className="field">
          <span>Campeão</span>
          <select className="input" value={t.campeao ?? ''} onChange={(e) => upd({ campeao: e.target.value || null })}>
            <option value="">Ainda não definido</option>
            {nicks.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="field wide">
          <span>Formato</span>
          <input className="input" value={t.formato} onChange={(e) => upd({ formato: e.target.value })} />
        </label>
      </div>
      <Inscricoes t={t} d={d} upd={upd} />
      <div className="admin-matches">
        <div className="admin-sub-head">
          <span className="label">Partidas e chaveamento</span>
          {gruposDe(t).length > 0 && (t.inscritos?.length ?? 0) > 1 && (
            <button type="button" className="btn btn-sm btn-ghost" onClick={gerarRodizio} title="Cria as partidas que faltam na fase de grupos">
              <Shuffle size={15} aria-hidden /> Gerar todos contra todos
            </button>
          )}
        </div>
        {t.chave.map((p, i) => (
          <PartidaEditor key={i} p={p} t={t} nicks={jogadoresDe(t, d)} onChange={(patch) => updP(i, patch)} onRemove={() => upd({ chave: t.chave.filter((_, k) => k !== i) })} />
        ))}
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => upd({ chave: [...t.chave, { fase: gruposDe(t).length ? FASE_GRUPOS : 'Semifinal', grupo: gruposDe(t)[0] ?? null, a: null, b: null, placar: null }] })}>
          <Plus size={15} aria-hidden /> Partida
        </button>
      </div>
    </article>
  );
}


/** Quem pode jogar as partidas deste torneio: os inscritos, ou o ranking enquanto não houver inscritos. */
function jogadoresDe(t: Torneio, d: LigaData): string[] {
  return t.inscritos?.length ? t.inscritos.map((i) => i.nick) : d.jogadores.map((j) => j.nick);
}

function useNomes() {
  const idx = useDexIndex();
  return {
    nome: (dex: number) => idx.data?.find((x) => x.id === dex)?.name ?? `#${dex}`,
    buscar: (txt: string) => {
      const v = txt.trim().toLowerCase();
      if (!v) return null;
      const n = Number(v.replace('#', ''));
      if (Number.isInteger(n) && n > 0) return idx.data?.find((x) => x.id === n)?.id ?? null;
      return idx.data?.find((x) => x.name.toLowerCase() === v || x.slug === v)?.id ?? null;
    },
  };
}

/** Escolhe até `max` Pokémon pelo nome (lista do navegador com todos os nomes da Pokédex). */
function PokemonPicker({ value, onChange, max, label }: { value: number[]; onChange: (v: number[]) => void; max: number; label: string }) {
  const { nome, buscar } = useNomes();
  const [txt, setTxt] = useState('');
  const add = (raw: string) => {
    const id = buscar(raw);
    if (!id || value.length >= max) return false;
    onChange([...value, id]);
    setTxt('');
    return true;
  };
  return (
    <div className="mon-picker">
      <ul className="mon-chips" aria-label={label}>
        {value.map((dex, i) => (
          <li key={`${dex}-${i}`}>
            <img src={spriteUrl(dex)} alt="" width={32} height={32} />
            <span>{nome(dex)}</span>
            <button type="button" aria-label={`Tirar ${nome(dex)}`} onClick={() => onChange(value.filter((_, k) => k !== i))}>
              <X size={13} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      {value.length < max && (
        <input
          className="input"
          list="dex-nomes"
          placeholder={`Pokémon (${value.length}/${max})`}
          aria-label={`Adicionar Pokémon: ${label}`}
          value={txt}
          onChange={(e) => {
            setTxt(e.target.value);
            // escolher na lista já adiciona
            const tipo = (e.nativeEvent as InputEvent).inputType;
            if ((!tipo || tipo === 'insertReplacementText') && buscar(e.target.value)) add(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(txt);
            }
          }}
          onBlur={() => txt && add(txt)}
        />
      )}
    </div>
  );
}

function Inscricoes({ t, d, upd }: { t: Torneio; d: LigaData; upd: (p: Partial<Torneio>) => void }) {
  const inscritos = t.inscritos ?? [];
  const grupos = t.grupos ?? [];
  const [novo, setNovo] = useState('');
  const livres = d.jogadores.map((j) => j.nick).filter((n) => !inscritos.some((i) => i.nick === n));
  const updI = (k: number, patch: Partial<NonNullable<Torneio['inscritos']>[number]>) =>
    upd({ inscritos: inscritos.map((x, i) => (i === k ? { ...x, ...patch } : x)) });
  const [aberto, setAberto] = useState(inscritos.length > 0);
  return (
    <details className="admin-insc" open={aberto} onToggle={(e) => setAberto((e.target as HTMLDetailsElement).open)}>
      <summary>
        <span className="label">Grupos e inscritos</span>
        <span className="muted small">
          {inscritos.length} inscritos{grupos.length > 1 ? ` · ${grupos.length} grupos` : ''}
        </span>
        <ChevronDown size={16} aria-hidden className="admin-insc-chev" />
      </summary>
      <div className="admin-insc-body">
        <div className="admin-grid">
          <label className="field wide">
            <span>Grupos (separados por vírgula; vazio = grupo único)</span>
            <input
              className="input"
              placeholder="Ex.: A, B"
              defaultValue={grupos.join(', ')}
              onBlur={(e) =>
                upd({
                  grupos: [
                    ...new Set(
                      e.target.value
                        .split(',')
                        .map((x) => x.trim())
                        .filter(Boolean),
                    ),
                  ],
                })
              }
            />
          </label>
          <label className="field">
            <span>Classificados por grupo</span>
            <input
              className="input tabular"
              type="number"
              min={1}
              max={16}
              value={classificadosPorGrupo(t)}
              onChange={(e) => upd({ classificados: Math.max(1, Number(e.target.value) || 1) })}
            />
          </label>
        </div>
        {inscritos.map((i, k) => (
          <div key={i.nick} className="admin-insc-row">
            <span className="admin-player">
              <SkinHead nick={d.jogadores.find((j) => j.nick === i.nick)?.skin || i.nick} size={28} />
              {i.nick}
            </span>
            {grupos.length > 1 && (
              <select className="input" aria-label={`Grupo de ${i.nick}`} value={i.grupo ?? ''} onChange={(e) => updI(k, { grupo: e.target.value || null })}>
                <option value="">Sem grupo</option>
                {grupos.map((g) => (
                  <option key={g} value={g}>
                    Grupo {g}
                  </option>
                ))}
              </select>
            )}
            <PokemonPicker value={i.pokemon} max={8} label={`Elenco de ${i.nick}`} onChange={(pokemon) => updI(k, { pokemon })} />
            <button
              type="button"
              className="btn btn-sm btn-ghost btn-icon"
              aria-label={`Tirar ${i.nick} do torneio`}
              onClick={() => upd({ inscritos: inscritos.filter((_, x) => x !== k) })}
            >
              <Trash2 size={15} aria-hidden />
            </button>
          </div>
        ))}
        <div className="row-gap tight">
          <select className="input" aria-label="Jogador para inscrever" value={novo} onChange={(e) => setNovo(e.target.value)}>
            <option value="">{livres.length ? 'Escolha um jogador do ranking' : 'Todos do ranking já estão inscritos'}</option>
            {livres.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-sm"
            disabled={!novo}
            onClick={() => {
              upd({ inscritos: [...inscritos, { nick: novo, grupo: grupos.length > 1 ? null : grupos[0] ?? null, pokemon: [] }] });
              setNovo('');
            }}
          >
            <Plus size={15} aria-hidden /> Inscrever
          </button>
          {livres.length > 1 && (
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => upd({ inscritos: [...inscritos, ...livres.map((nick) => ({ nick, grupo: grupos.length > 1 ? null : grupos[0] ?? null, pokemon: [] }))] })}
            >
              Inscrever todos do ranking
            </button>
          )}
        </div>
        {!d.jogadores.length && <p className="muted small">Adicione os jogadores na aba Jogadores primeiro.</p>}
      </div>
    </details>
  );
}

function PartidaEditor({
  p,
  t,
  nicks,
  onChange,
  onRemove,
}: {
  p: Partida;
  t: Torneio;
  nicks: string[];
  onChange: (patch: Partial<Partida>) => void;
  onRemove: () => void;
}) {
  const [times, setTimes] = useState(false);
  const grupos = t.grupos ?? [];
  const s = placarDe(p);
  const num = (v: string) => (v === '' ? null : Math.max(0, Math.min(99, Number(v) || 0)));
  const setPlacar = (pa: number | null, pb: number | null) => onChange({ pa, pb, placar: pa !== null && pb !== null ? `${pa}–${pb}` : null });
  const opcoes = [...new Set([...nicks, ...(p.a ? [p.a] : []), ...(p.b ? [p.b] : [])])];
  const elenco = (nick: string | null) => t.inscritos?.find((i) => i.nick === nick)?.pokemon ?? [];
  return (
    <div className={`admin-match2${s ? ' done' : ''}`}>
      <div className="am-top">
        <select className="input" aria-label="Fase" value={p.fase} onChange={(e) => onChange({ fase: e.target.value })}>
          {[...new Set([...FASES, p.fase])].map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
        {p.fase === FASE_GRUPOS && grupos.length > 1 && (
          <select className="input" aria-label="Grupo" value={p.grupo ?? ''} onChange={(e) => onChange({ grupo: e.target.value || null })}>
            {grupos.map((g) => (
              <option key={g} value={g}>
                Grupo {g}
              </option>
            ))}
          </select>
        )}
        <button type="button" className="btn btn-sm btn-ghost btn-icon am-del" aria-label="Remover partida" onClick={onRemove}>
          <Trash2 size={15} aria-hidden />
        </button>
      </div>
      <div className="am-score">
        <select className="input" aria-label="Jogador A" value={p.a ?? ''} onChange={(e) => onChange({ a: e.target.value || null })}>
          <option value="">A definir</option>
          {opcoes.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
        <input className="input tabular am-num" type="number" min={0} inputMode="numeric" aria-label="Partidas vencidas por A" placeholder="–" value={s?.[0] ?? p.pa ?? ''} onChange={(e) => setPlacar(num(e.target.value), s ? s[1] : p.pb ?? null)} />
        <span className="am-x" aria-hidden>
          ×
        </span>
        <input className="input tabular am-num" type="number" min={0} inputMode="numeric" aria-label="Partidas vencidas por B" placeholder="–" value={s?.[1] ?? p.pb ?? ''} onChange={(e) => setPlacar(s ? s[0] : p.pa ?? null, num(e.target.value))} />
        <select className="input" aria-label="Jogador B" value={p.b ?? ''} onChange={(e) => onChange({ b: e.target.value || null })}>
          <option value="">A definir</option>
          {opcoes.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </div>
      <div className="am-ko">
        <input className="input tabular am-num" type="number" min={0} max={99} aria-label={`Pokémon derrotados por ${p.a ?? 'A'}`} placeholder="–" value={p.koA ?? ''} onChange={(e) => onChange({ koA: num(e.target.value) })} />
        <span className="small muted">Pokémon derrotados</span>
        <input className="input tabular am-num" type="number" min={0} max={99} aria-label={`Pokémon derrotados por ${p.b ?? 'B'}`} placeholder="–" value={p.koB ?? ''} onChange={(e) => onChange({ koB: num(e.target.value) })} />
      </div>
      <button type="button" className="am-times-toggle" aria-expanded={times} onClick={() => setTimes((x) => !x)}>
        Times usados {p.timeA?.length || p.timeB?.length ? `(${p.timeA?.length ?? 0} × ${p.timeB?.length ?? 0})` : ''} <ChevronDown size={14} aria-hidden />
      </button>
      {times && (
        <div className="am-times">
          {(['a', 'b'] as const).map((lado) => {
            const nick = lado === 'a' ? p.a : p.b;
            const campo = lado === 'a' ? 'timeA' : 'timeB';
            const atual = p[campo] ?? [];
            const el = elenco(nick);
            return (
              <div key={lado} className="am-time">
                <span className="label">{nick ?? (lado === 'a' ? 'Jogador A' : 'Jogador B')}</span>
                {el.length ? (
                  <ul className="mon-toggle" aria-label={`Escolha até 6 do elenco de ${nick}`}>
                    {el.map((dex) => {
                      const on = atual.includes(dex);
                      return (
                        <li key={dex}>
                          <button
                            type="button"
                            aria-pressed={on}
                            disabled={!on && atual.length >= 6}
                            onClick={() => onChange({ [campo]: on ? atual.filter((x) => x !== dex) : [...atual, dex] })}
                          >
                            <img src={spriteUrl(dex)} alt={`#${dex}`} width={36} height={36} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <PokemonPicker value={atual} max={6} label={`Time de ${nick ?? lado.toUpperCase()}`} onChange={(v) => onChange({ [campo]: v })} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DexNomes() {
  const idx = useDexIndex();
  return (
    <datalist id="dex-nomes">
      {idx.data?.map((x) => (
        <option key={x.id} value={x.name} />
      ))}
    </datalist>
  );
}

/* ---------- página ---------- */
export default function Admin() {
  const admin = useAcesso();
  const { user, entrar } = useStore();
  const { data, origem, aoVivo, salvar, descartarLocal } = useLiga();
  const [draft, setDraft] = useState<LigaData>(data);
  const [sujo, setSujo] = useState(false);
  const [msg, setMsg] = useState<{ nivel: 'info' | 'erro'; t: string } | null>(null);
  const [tab, setTab] = useState<'torneios' | 'jogadores' | 'publicar'>('torneios');
  const file = useRef<HTMLInputElement>(null);
  const nav = useNavigate();
  const [salvando, setSalvando] = useState(false);

  // Avisa antes de fechar a aba com alterações não salvas.
  useEffect(() => {
    if (!sujo) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [sujo]);

  // Mantém o rascunho em dia com a nuvem enquanto não houver edição local.
  useEffect(() => {
    if (!sujo) setDraft(data);
  }, [data, sujo]);

  const set = (d: LigaData) => {
    setDraft(d);
    setSujo(true);
  };

  if (admin === null)
    return (
      <Consult title="Painel da Liga">
        <div className="skeleton" style={{ height: 200 }} />
      </Consult>
    );

  if (!admin)
    return (
      <Consult title="Painel da Liga">
        <div className="state-box">
          <ShieldAlert size={22} aria-hidden />
          <p>
            <b>Área restrita à organização da Firma.</b>{' '}
            {user ? 'Sua conta não está na lista de admins.' : 'Entre com Google com uma conta de admin.'}
          </p>
          {user && (
            <p className="muted small">
              Seu UID: <code style={{ userSelect: 'all' }}>{user.uid}</code>. Para liberar, crie no Firestore a coleção <code>admins</code> com um
              documento cujo ID seja exatamente esse UID.
            </p>
          )}
          {!user && (
            <button type="button" className="btn btn-green btn-sm" onClick={entrar}>
              Entrar com Google
            </button>
          )}
        </div>
      </Consult>
    );

  const emAndamento = draft.torneios.filter((t) => t.status === 'em-andamento');
  const publicar = async (irParaLiga: boolean) => {
    if (draft.torneios.some((t) => !t.nome.trim())) {
      setTab('torneios');
      setMsg({ nivel: 'erro', t: 'Dê um nome a todos os torneios antes de salvar.' });
      return;
    }
    if (!confirm('Salvar as alterações? Elas aparecem na hora para todo mundo: Home, Liga e perfis dos jogadores.')) return;
    setSalvando(true);
    try {
      const o = await salvar(draft);
      setSujo(false);
      if (irParaLiga) {
        nav('/liga');
        return;
      }
      setMsg({ nivel: 'info', t: o === 'nuvem' ? 'Salvo: a Home, a Liga e os perfis já mostram os novos dados.' : 'Salvo neste navegador. Exporte o JSON para publicar no site.' });
    } catch {
      setMsg({ nivel: 'erro', t: 'Não consegui salvar. Verifique se sua conta é admin e tente de novo.' });
    } finally {
      setSalvando(false);
    }
  };
  const descartar = () => {
    if (!confirm('Descartar as alterações que ainda não foram salvas?')) return;
    setDraft(data);
    setSujo(false);
    setMsg(null);
  };
  const novoTorneio = () => {
    const id = `torneio-${Date.now().toString(36)}`;
    set({
      ...draft,
      torneios: [...draft.torneios, { id, nome: 'Novo torneio', capitulo: 1, formato: '6v6 Singles', status: 'em-breve', data: null, campeao: null, chave: [] }],
    });
  };

  return (
    <Consult
      title={
        <>
          Painel da <span className="serif-i">Liga</span>
        </>
      }
      intro={
        <>
          Origem dos dados: <b>{origem === 'nuvem' ? 'nuvem (Firestore)' : origem === 'local' ? 'rascunho neste navegador' : 'arquivo data/liga.json'}</b>
          {aoVivo && ' · atualizando ao vivo'} · última atualização {fmtData(draft.atualizadoEm)}
        </>
      }
      actions={
        <button type="button" className="btn btn-coral" onClick={() => publicar(true)} disabled={!sujo || salvando}>
          <Save size={18} aria-hidden /> {salvando ? 'Salvando…' : sujo ? 'Salvar e ver na Liga' : 'Tudo salvo'}
        </button>
      }
    >
      <main id="conteudo" className="admin">
        <DexNomes />
        {!firebaseEnabled && (
          <Note nivel="aviso">
            Modo local: sem Firebase configurado, o que você salvar aqui fica só neste navegador. Para publicar para todos, use “Exportar JSON” e
            substitua <code>data/liga.json</code>.
          </Note>
        )}
        {msg && <Note nivel={msg.nivel}>{msg.t}</Note>}

        <section className="admin-monitor" aria-label="Monitor">
          <div>
            <span className="label">Torneios em andamento</span>
            <b className="display">{emAndamento.length}</b>
          </div>
          <div>
            <span className="label">Partidas sem resultado</span>
            <b className="display">{emAndamento.reduce((a, t) => a + t.chave.filter((p) => !p.placar).length, 0)}</b>
          </div>
          <div>
            <span className="label">Jogadores no ranking</span>
            <b className="display">{draft.jogadores.length}</b>
          </div>
          <div>
            <span className="label">Líder</span>
            <b className="admin-leader">{[...draft.jogadores].sort((a, b) => b.pontos - a.pontos)[0]?.nick ?? '—'}</b>
          </div>
        </section>

        <div className="seg" role="tablist" aria-label="Seções do painel">
          {(
            [
              ['torneios', 'Torneios'],
              ['jogadores', 'Jogadores'],
              ['publicar', 'Arquivo e publicação'],
            ] as const
          ).map(([id, l]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'torneios' && (
          <div className="admin-tourneys">
            {!draft.torneios.length && <p className="muted">Nenhum torneio cadastrado.</p>}
            {[...draft.torneios]
              .sort((a, b) => (a.status === 'em-andamento' ? -1 : b.status === 'em-andamento' ? 1 : 0))
              .map((t) => (
                <TorneioEditor key={t.id} t={t} d={draft} set={set} />
              ))}
            <button type="button" className="btn btn-ghost admin-new" onClick={novoTorneio}>
              <Plus size={16} aria-hidden /> Novo torneio
            </button>
          </div>
        )}
        {tab === 'jogadores' && <Jogadores d={draft} set={set} />}
        {tab === 'publicar' && (
          <section className="dex-panel admin-pub">
            <label className="check">
              <input type="checkbox" checked={draft.exemplo} onChange={(e) => set({ ...draft, exemplo: e.target.checked })} />
              Mostrar o aviso “Dados de exemplo” no site
            </label>
            <div className="row-gap">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  const blob = new Blob([JSON.stringify({ _comoEditar: 'Gerado pelo painel /admin da Firma League.', ...draft }, null, 2)], { type: 'application/json' });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = 'liga.json';
                  a.click();
                  URL.revokeObjectURL(a.href);
                }}
              >
                <Download size={16} aria-hidden /> Exportar JSON
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => file.current?.click()}>
                <Upload size={16} aria-hidden /> Importar JSON
              </button>
              <input
                ref={file}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    const j = JSON.parse(await f.text()) as LigaData;
                    if (!Array.isArray(j.jogadores) || !Array.isArray(j.torneios)) throw new Error();
                    set({ exemplo: !!j.exemplo, atualizadoEm: j.atualizadoEm, jogadores: j.jogadores, torneios: j.torneios });
                    setMsg({ nivel: 'info', t: 'Arquivo carregado. Revise e clique em “Salvar”.' });
                  } catch {
                    setMsg({ nivel: 'erro', t: 'Esse arquivo não parece um liga.json válido.' });
                  }
                  e.target.value = '';
                }}
              />
              {origem === 'local' && (
                <button type="button" className="btn btn-ghost" onClick={() => { descartarLocal(); setSujo(false); }}>
                  <RotateCcw size={16} aria-hidden /> Descartar rascunho local
                </button>
              )}
            </div>
            <p className="muted small">
              Para dar acesso de admin a alguém: no console do Firebase, crie o documento <code>admins/&#123;uid da pessoa&#125;</code>. Veja o README.
            </p>
            <Link to="/liga" className="text-link small">
              Ver a página da Liga
            </Link>
          </section>
        )}

        {sujo && (
          <div className="admin-savebar" role="region" aria-label="Alterações não salvas">
            <p>
              <b>Alterações não salvas.</b> <span className="muted">Nada muda no site até você salvar.</span>
            </p>
            <div className="row-gap tight">
              <button type="button" className="btn btn-ghost btn-sm" onClick={descartar} disabled={salvando}>
                <RotateCcw size={15} aria-hidden /> Descartar
              </button>
              <button type="button" className="btn btn-sm" onClick={() => publicar(false)} disabled={salvando}>
                <Save size={15} aria-hidden /> Salvar
              </button>
              <button type="button" className="btn btn-coral btn-sm" onClick={() => publicar(true)} disabled={salvando}>
                {salvando ? 'Salvando…' : 'Salvar e ver na Liga'} <ArrowRight size={15} aria-hidden />
              </button>
            </div>
          </div>
        )}
      </main>
    </Consult>
  );
}
