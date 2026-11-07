import { Link, NavLink } from 'react-router-dom';
import { spriteUrl } from '../lib/pokeapi';
import { prettyName } from '../lib/pt';
import { FORMATOS, type Team } from '../lib/team';
import { SkinHead } from './ui';

export function TeamSprites({ team, size = 56 }: { team: Pick<Team, 'pokemon'>; size?: number }) {
  const slots = Array.from({ length: 6 }, (_, i) => team.pokemon[i]);
  return (
    <ul className="team-sprites" aria-label="Pokémon do time">
      {slots.map((s, i) => (
        <li key={i} className={`slot${s ? '' : ' locked'}`}>
          {s ? (
            <img src={spriteUrl(s.dex, s.shiny)} alt={s.apelido || prettyName(s.especie)} width={size} height={size} loading="lazy" style={{ imageRendering: 'pixelated' }} />
          ) : (
            <span className="sr-only">Vazio</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export function TeamCard({ team, autor, skin, to }: { team: Team; autor: string; skin?: string; to?: string }) {
  const fmt = FORMATOS.find((f) => f.id === team.formato)?.nome;
  const body = (
    <>
      <header className="team-card-head">
        <SkinHead nick={skin ?? autor} size={34} />
        <span className="team-card-author">{autor}</span>
        <span className="team-card-fmt">{fmt}</span>
      </header>
      <h3 className="team-card-name">{team.nome}</h3>
      <TeamSprites team={team} />
    </>
  );
  return to ? (
    <Link to={to} className="team-card">
      {body}
    </Link>
  ) : (
    <article className="team-card">{body}</article>
  );
}

/** Abas entre "Meus times" e "Comunidade". */
export function TeamsNav({ n }: { n?: number }) {
  return (
    <nav className="seg teams-nav" aria-label="Times">
      <NavLink to="/times" end>
        Meus times{n !== undefined && <span className="pixel">{n}</span>}
      </NavLink>
      <NavLink to="/times/comunidade">Comunidade</NavLink>
    </nav>
  );
}
