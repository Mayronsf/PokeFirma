import { Link, useParams } from 'react-router-dom';
import { Award } from 'lucide-react';
import { Consult } from '../components/Shell';
import { TeamCard } from '../components/TeamCard';
import { ErrorRetry, SkinBody, SkinHead } from '../components/ui';
import { TeamSprites } from '../components/TeamCard';
import { novoSlot } from '../lib/team';
import { firebaseEnabled } from '../lib/firebase';
import { useAsync, useDexIndex } from '../lib/hooks';
import { useLiga } from '../lib/liga';
import { artworkUrl } from '../lib/pokeapi';
import { lerPerfilPublico } from '../lib/store';
import { BadgeCase } from './Profile';
import '../styles/dex.css';
import '../styles/lore.css';
import '../styles/home.css';
import '../styles/team.css';
import '../styles/pages.css';

export default function PlayerPublic() {
  const { nick = '' } = useParams();
  const { data: ligaData, titulosDe, ranking } = useLiga();
  const idx = useDexIndex();
  const q = useAsync(() => lerPerfilPublico(nick), [nick]);
  const liga = ligaData.jogadores.find((j) => j.nick.toLowerCase() === nick.toLowerCase());
  const titulos = titulosDe(nick);
  const p = q.data?.perfil;
  const pos = liga ? ranking.indexOf(liga) + 1 : 0;

  if (q.error) return <Consult title={nick}><ErrorRetry onRetry={q.retry} msg="Não consegui carregar este perfil." /></Consult>;

  return (
    <Consult back={{ to: '/jogadores', label: 'Voltar' }} title={p?.nick ?? liga?.nick ?? nick} intro={p?.bio || (liga ? 'Jogador da Liga da Firma.' : undefined)}>
      <main id="conteudo" className="profile">
        {q.loading ? (
          <div className="skeleton" style={{ height: 280 }} />
        ) : !p && !liga ? (
          <div className="state-box">
            <p>
              <b>Não encontrei o jogador “{nick}”.</b>{' '}
              {firebaseEnabled ? 'O perfil pode estar privado.' : 'Os perfis públicos aparecem quando o login do site estiver configurado.'}
            </p>
            <Link to="/liga" className="btn btn-sm">
              Ver ranking da Liga
            </Link>
          </div>
        ) : (
          <>
            <div className="trainer-card wide">
              <div className="trainer-skin">
                <SkinBody nick={liga?.skin ?? p?.nick ?? nick} skin={p?.skin || undefined} height={300} />
              </div>
              <div className="trainer-info">
                  <div className="trainer-id">
                  <SkinHead nick={liga?.skin ?? p?.nick ?? nick} skin={p?.skin || undefined} size={64} className="trainer-avatar" />
                  <h2 className="display trainer-nick">{p?.nick ?? liga?.nick}</h2>
                </div>
                <dl className="trainer-facts">
                  {liga && (
                    <>
                      <div>
                        <dt>Ranking</dt>
                        <dd className="pixel tabular">{pos}º</dd>
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
                  {p && (
                    <div>
                      <dt>Capítulo</dt>
                      <dd>{['Kanto', 'Johto', 'Hoenn', 'Sinnoh'][p.capitulo - 1]}</dd>
                    </div>
                  )}
                </dl>
                {p?.timePrincipal && (
                  <div className="trainer-team">
                    <span className="trainer-team-label">Time principal · {p.timePrincipal.nome}</span>
                    <TeamSprites team={{ pokemon: p.timePrincipal.pokemon.map((s, i) => ({ ...novoSlot(s.dex, s.especie), shiny: s.shiny, uid: String(i) })) }} size={40} />
                  </div>
                )}
                {p?.favorito && (
                  <div className="trainer-fav">
                    <img src={artworkUrl(p.favorito)} alt="" width={84} height={84} loading="lazy" />
                    <span>
                      Favorito <b>{idx.data?.find((x) => x.id === p.favorito)?.name ?? `#${p.favorito}`}</b>
                    </span>
                  </div>
                )}
              </div>
            </div>
            {titulos.length > 0 && (
              <section className="dex-panel">
                <h2 className="panel-title">Conquistas da Liga</h2>
                <ul className="titles">
                  {titulos.map((t) => (
                    <li key={t}>
                      <Award size={20} aria-hidden /> {t}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {p && (
              <section className="dex-panel">
                <h2 className="panel-title">Insígnias</h2>
                <BadgeCase owned={p.insignias ?? []} />
              </section>
            )}
            {q.data?.times.length ? (
              <section>
                <h2 className="panel-title">Times públicos</h2>
                <div className="team-grid">
                  {q.data.times.map((t) => (
                    <TeamCard key={t.id} team={t} autor={p?.nick ?? nick} to={`/time/${p?.uid}/${t.id}`} />
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </main>
    </Consult>
  );
}
