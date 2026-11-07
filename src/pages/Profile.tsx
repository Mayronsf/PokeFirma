import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, Check, ExternalLink, LogOut, RotateCcw, Trash2, Upload } from 'lucide-react';

const SkinViewer3D = lazy(() => import('../components/SkinViewer3D'));
import { BadgeEmblem } from '../components/BadgeEmblem';
import { ChapterPicker } from '../components/Quest';
import { Consult } from '../components/Shell';
import { TeamCard, TeamSprites } from '../components/TeamCard';
import { Note, SkinBody, SkinHead, useSkinDe } from '../components/ui';
import { insignias } from '../content/lore';
import { useDexIndex } from '../lib/hooks';
import { useLiga } from '../lib/liga';
import { artworkUrl, spriteUrl } from '../lib/pokeapi';
import { useStore } from '../lib/store';
import { readSkinFile, textureUrl } from '../lib/skins';
import '../styles/dex.css';
import '../styles/lore.css';
import '../styles/home.css';
import '../styles/team.css';
import '../styles/pages.css';

export function BadgeCase({ owned, onToggle }: { owned: string[]; onToggle?: (id: string) => void }) {
  return (
    <div className="badge-case">
      {insignias.map((r) => {
        const got = r.itens.filter((i) => owned.includes(i.id)).length;
        return (
          <section key={r.regiao} className="badge-region" aria-label={`Insígnias de ${r.regiao}`}>
            <header>
              <h3 className="display">{r.regiao}</h3>
              <span className="pixel tabular">
                {got}/{r.itens.length}
              </span>
            </header>
            <ul>
              {r.itens.map((i) => {
                const on = owned.includes(i.id);
                const content = (
                  <>
                    <BadgeEmblem ins={i} owned={on} />
                    <span className="badge-name">{i.nome}</span>
                    {i.lider && <span className="badge-leader">{i.lider}</span>}
                  </>
                );
                return (
                  <li key={i.id}>
                    {onToggle ? (
                      <button type="button" className="badge" aria-pressed={on} onClick={() => onToggle(i.id)}>
                        {content}
                        <span className="sr-only">{on ? 'conquistada' : 'faltando'}</span>
                      </button>
                    ) : (
                      <span className="badge">
                        {content}
                        <span className="sr-only">{on ? 'conquistada' : 'faltando'}</span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function SkinSection() {
  const { profile, salvarPerfil } = useStore();
  const [erro, setErro] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const resolvida = useSkinDe(profile.nick || '', undefined);
  const tex = resolvida || (profile.nick ? textureUrl(profile.nick) : '');
  return (
    <section className="dex-panel skin-panel" aria-labelledby="skin-title">
      <div className="panel-head">
        <h2 id="skin-title" className="panel-title">
          Skin
        </h2>
        <span className="muted small">{profile.skin ? 'Usando o arquivo que você enviou' : resolvida ? 'Usando a skin cadastrada para o seu nick' : profile.nick ? `Usando a skin do nick ${profile.nick}` : 'Defina seu nick ou envie um arquivo'}</span>
      </div>
      <div className="skin-grid">
        <div className="skin-stage">{tex ? <Suspense fallback={<div className="skeleton" style={{ height: 300 }} />}><SkinViewer3D texture={tex} /></Suspense> : <SkinBody nick="MHF_Steve" height={260} />}</div>
        <div className="skin-actions">
          <p>
            A skin aparece no seu avatar, no perfil público e nos rankings. Ela vem automaticamente do seu <b>nick do Minecraft</b>, ou você pode
            enviar o arquivo <b>.png</b> da skin (64×64 ou 64×32), por exemplo se jogar com conta pirata ou skin personalizada.
          </p>
          <div className="row-gap">
            <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
              <Upload size={16} aria-hidden /> Enviar arquivo de skin
            </button>
            {profile.skin && (
              <button type="button" className="btn btn-ghost" onClick={() => salvarPerfil({ skin: '' })}>
                <RotateCcw size={16} aria-hidden /> Voltar para a skin do nick
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (!f) return;
              try {
                setErro('');
                salvarPerfil({ skin: await readSkinFile(f) });
              } catch (err) {
                setErro((err as Error).message);
              }
            }}
          />
          {erro && <Note nivel="erro">{erro}</Note>}
          <p className="muted small">Arraste o boneco para girar.</p>
        </div>
      </div>
    </section>
  );
}

export default function Profile() {
  const { user, profile, salvarPerfil, teams, entrar, sair, excluirConta, firebaseEnabled } = useStore();
  const idx = useDexIndex();
  const { titulosDe, ranking } = useLiga();
  const posLiga = profile.nick ? ranking.findIndex((j) => j.nick.toLowerCase() === profile.nick.toLowerCase()) : -1;
  const liga = posLiga >= 0 ? ranking[posLiga] : null;
  const nav = useNavigate();
  const [nick, setNick] = useState(profile.nick);
  const [bio, setBio] = useState(profile.bio);
  const [fav, setFav] = useState(profile.favorito ? String(profile.favorito) : '');
  const [saved, setSaved] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [delErr, setDelErr] = useState('');

  useEffect(() => {
    setNick(profile.nick);
    setBio(profile.bio);
    setFav(profile.favorito ? String(profile.favorito) : '');
  }, [profile.nick, profile.bio, profile.favorito]);

  const favEntry = idx.data?.find((p) => String(p.id) === fav || p.name.toLowerCase() === fav.toLowerCase());
  const nickOk = !nick || /^[A-Za-z0-9_]{3,16}$/.test(nick);
  const titulos = profile.nick ? titulosDe(profile.nick) : [];
  const publicos = teams.filter((t) => t.publico);

  return (
    <Consult
      title={
        <>
          Meu <span className="serif-i">perfil</span>
        </>
      }
      intro={user ? `Conectado como ${user.email ?? user.nome}.` : 'Sem login, seu perfil fica salvo só neste navegador.'}
    >
      <main id="conteudo" className="profile">
        {!user && (
          <div className="cloud-offer">
            <p>Entre com Google para salvar perfil e times na nuvem e ganhar uma página pública.</p>
            <button type="button" className="btn btn-green" onClick={entrar} disabled={!firebaseEnabled}>
              Entrar com Google
            </button>
          </div>
        )}

        <div className="profile-top">
          <div className="trainer-card">
            <div className="trainer-skin">
              <SkinBody key={profile.nick + (profile.skin?.length ?? 0)} nick={profile.nick || 'MHF_Steve'} skin={profile.skin || undefined} height={300} />
            </div>
            <div className="trainer-info">
              <div className="trainer-id">
                <SkinHead nick={profile.nick || 'MHF_Steve'} size={64} className="trainer-avatar" />
                <h2 className="display trainer-nick">{profile.nick || 'Sem nick'}</h2>
              </div>
              {profile.bio && <p className="trainer-bio">{profile.bio}</p>}
              <dl className="trainer-facts">
                <div>
                  <dt>Capítulo</dt>
                  <dd>{['Kanto', 'Johto', 'Hoenn', 'Sinnoh'][profile.capitulo - 1]}</dd>
                </div>
                <div>
                  <dt>Insígnias</dt>
                  <dd className="pixel tabular">{profile.insignias.length}</dd>
                </div>
                <div>
                  <dt>Times</dt>
                  <dd className="pixel tabular">{teams.length}</dd>
                </div>
                {liga && (
                  <>
                    <div>
                      <dt>Ranking</dt>
                      <dd className="pixel tabular">{posLiga + 1}º</dd>
                    </div>
                    <div>
                      <dt>Pontos</dt>
                      <dd className="pixel tabular">{liga.pontos}</dd>
                    </div>
                    <div>
                      <dt>V / D</dt>
                      <dd className="pixel tabular">
                        {liga.vitorias}/{liga.derrotas}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
              {profile.favorito && (
                <div className="trainer-fav">
                  <img src={artworkUrl(profile.favorito)} alt="" width={84} height={84} loading="lazy" />
                  <span>
                    Favorito
                    <b>{idx.data?.find((p) => p.id === profile.favorito)?.name ?? `#${profile.favorito}`}</b>
                  </span>
                </div>
              )}
              {(() => {
                const tp = teams.find((t) => t.id === profile.timePrincipal);
                return tp ? (
                  <div className="trainer-team">
                    <span className="trainer-team-label">Time principal · {tp.nome}</span>
                    <TeamSprites team={tp} size={40} />
                  </div>
                ) : null;
              })()}
              {user && profile.nick && profile.perfilPublico && (
                <Link to={`/jogador/${encodeURIComponent(profile.nick)}`} className="text-link on-dark">
                  Ver meu perfil público <ExternalLink size={14} aria-hidden />
                </Link>
              )}
            </div>
          </div>

          <form
            className="dex-panel profile-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!nickOk) return;
              salvarPerfil({ nick: nick.trim(), bio: bio.trim(), favorito: favEntry?.id ?? null });
              setSaved(true);
              setTimeout(() => setSaved(false), 2500);
            }}
          >
            <h2 className="panel-title">Dados</h2>
            <label className="field">
              <span>Nick do Minecraft</span>
              <input className="input" value={nick} maxLength={16} onChange={(e) => setNick(e.target.value)} aria-invalid={!nickOk} spellCheck={false} />
              {!nickOk && <span className="field-err">Use 3 a 16 caracteres: letras, números e _.</span>}
            </label>
            <label className="field">
              <span>Bio curta</span>
              <textarea className="input bio" value={bio} maxLength={160} onChange={(e) => setBio(e.target.value)} rows={3} />
              <span className="small muted">{bio.length}/160</span>
            </label>
            <label className="field">
              <span>Pokémon favorito (nome ou número)</span>
              <input className="input" list="fav-list" value={fav} onChange={(e) => setFav(e.target.value)} />
              <datalist id="fav-list">
                {idx.data?.slice(0, 493).map((p) => (
                  <option key={p.id} value={p.name} />
                ))}
              </datalist>
              {fav && !favEntry && idx.data && <span className="field-err">Não achei esse Pokémon.</span>}
              {favEntry && (
                <span className="fav-preview">
                  <img src={spriteUrl(favEntry.id)} alt="" width={48} height={48} />
                  {favEntry.name} · clique em Salvar perfil
                </span>
              )}
            </label>
            <div className="field">
              <span>Time principal</span>
              {teams.length ? (
                <select className="input" value={profile.timePrincipal ?? ''} onChange={(e) => salvarPerfil({ timePrincipal: e.target.value || '' })}>
                  <option value="">Nenhum</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome} ({t.pokemon.length}/6)
                    </option>
                  ))}
                </select>
              ) : (
                <span className="small muted">
                  Você ainda não tem times. <Link to="/times">Criar um time</Link>
                </span>
              )}
            </div>
            {user && (
              <label className="check">
                <input type="checkbox" checked={profile.perfilPublico} onChange={(e) => salvarPerfil({ perfilPublico: e.target.checked })} />
                Mostrar meu perfil em /jogador/{profile.nick || 'nick'}
              </label>
            )}
            <button type="submit" className="btn btn-coral">
              {saved ? <Check size={18} aria-hidden /> : null}
              {saved ? 'Salvo' : 'Salvar perfil'}
            </button>
          </form>
        </div>

        <SkinSection />

        <section className="dex-panel" aria-labelledby="cap-title">
          <h2 id="cap-title" className="panel-title">
            Capítulo da campanha
          </h2>
          <ChapterPicker label="Estou em" />
          <p className="muted small">Controla o modo sem spoiler da Lore e da página inicial.</p>
        </section>

        <section className="dex-panel" aria-labelledby="ins-title">
          <div className="panel-head">
            <h2 id="ins-title" className="panel-title">
              Insígnias
            </h2>
            <span className="muted small">Toque para marcar as que você já tem.</span>
          </div>
          <BadgeCase
            owned={profile.insignias}
            onToggle={(id) =>
              salvarPerfil({
                insignias: profile.insignias.includes(id) ? profile.insignias.filter((x) => x !== id) : [...profile.insignias, id],
              })
            }
          />
        </section>

        <section className="dex-panel" aria-labelledby="tit-title">
          <h2 id="tit-title" className="panel-title">
            Conquistas da Liga
          </h2>
          {titulos.length ? (
            <ul className="titles">
              {titulos.map((t) => (
                <li key={t}>
                  <Award size={20} aria-hidden /> {t}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Nenhum título ainda. Os títulos vêm dos resultados da Liga.</p>
          )}
        </section>

        <section aria-labelledby="mt-title">
          <div className="panel-head">
            <h2 id="mt-title" className="panel-title">
              Meus times
            </h2>
            <Link to="/times" className="text-link">
              Gerenciar times
            </Link>
          </div>
          {teams.length ? (
            <div className="team-grid">
              {teams.slice(0, 6).map((t) => (
                <TeamCard key={t.id} team={t} autor={profile.nick || 'Você'} skin={profile.nick || 'MHF_Steve'} to={`/times/${t.id}`} />
              ))}
            </div>
          ) : (
            <p className="muted">Nenhum time salvo.</p>
          )}
          {publicos.length > 0 && !user && <p className="small muted">Times públicos aparecem na comunidade depois que você entra com Google.</p>}
        </section>

        <section className="dex-panel danger-zone" aria-labelledby="conta-title">
          <h2 id="conta-title" className="panel-title">
            Conta e dados
          </h2>
          <div className="row-gap">
            {user && (
              <button type="button" className="btn btn-ghost" onClick={() => sair()}>
                <LogOut size={16} aria-hidden /> Sair
              </button>
            )}
            {confirmDel ? (
              <span className="confirm">
                {user ? 'Excluir conta, perfil e todos os times da nuvem? Não dá para desfazer.' : 'Apagar perfil e times deste navegador?'}
                <button
                  type="button"
                  className="btn btn-sm danger"
                  onClick={async () => {
                    try {
                      await excluirConta();
                      nav('/');
                    } catch {
                      setDelErr('Não consegui excluir a conta. Entre de novo e tente outra vez.');
                    }
                  }}
                >
                  Sim, excluir tudo
                </button>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => setConfirmDel(false)}>
                  Cancelar
                </button>
              </span>
            ) : (
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmDel(true)}>
                <Trash2 size={16} aria-hidden /> {user ? 'Excluir conta e dados' : 'Apagar dados locais'}
              </button>
            )}
          </div>
          {delErr && <Note nivel="erro">{delErr}</Note>}
        </section>
      </main>
    </Consult>
  );
}
