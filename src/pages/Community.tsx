import { Consult } from '../components/Shell';
import { TeamCard, TeamsNav } from '../components/TeamCard';
import { timesExemplo, useAsync } from '../lib/hooks';
import { lerTimesPublicos } from '../lib/store';
import '../styles/home.css';
import '../styles/team.css';
import '../styles/pages.css';

export default function Community() {
  const q = useAsync(() => lerTimesPublicos(48).catch(() => []), []);
  const cloud = (q.data ?? []).map((t) => ({ team: t, autor: t.autorNick || 'Treinador', skin: undefined as string | undefined, to: `/time/${t.autorUid}/${t.id}` }));
  const list = cloud.length ? cloud : timesExemplo;
  return (
    <Consult
      title={
        <>
          Times da <span className="serif-i">comunidade</span>
        </>
      }
      intro="Times que a Firma deixou públicos. Abra um para ver os detalhes, exportar ou copiar para os seus."
    >
      <main id="conteudo" className="teams-page">
        <TeamsNav />
        {q.loading ? (
          <div className="team-grid">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="skeleton" style={{ height: 180 }} />
            ))}
          </div>
        ) : (
          <>
            {!cloud.length && <p className="muted small community-note">Ainda não há times públicos na nuvem. Estes são exemplos.</p>}
            <div className="team-grid">
              {list.map((c) => (
                <TeamCard key={c.team.id} team={c.team} autor={c.autor} skin={c.skin} to={c.to} />
              ))}
            </div>
          </>
        )}
      </main>
    </Consult>
  );
}
