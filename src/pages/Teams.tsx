import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CloudUpload, Copy, FileInput, Lock, Globe, Plus, Trash2 } from 'lucide-react';
import { Consult } from '../components/Shell';
import { TeamSprites, TeamsNav } from '../components/TeamCard';
import { ShowdownDialog } from '../components/ShowdownDialog';
import { Note } from '../components/ui';
import { useStore } from '../lib/store';
import { FORMATOS, novoTime, uid } from '../lib/team';
import { fmtData } from '../lib/pt';
import '../styles/team.css';
import '../styles/pages.css';

export default function Teams() {
  const { teams, salvarTime, excluirTime, user, entrar, firebaseEnabled, localTeamsPendentes, enviarParaNuvem } = useStore();
  const nav = useNavigate();
  const [importOpen, setImportOpen] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviados, setEnviados] = useState<number | null>(null);

  const criar = () => {
    const t = novoTime(`Time ${teams.length + 1}`);
    salvarTime(t);
    nav(`/times/${t.id}`);
  };

  return (
    <Consult
      title={
        <>
          Meus <span className="serif-i">times</span>
        </>
      }
      intro="Até 6 Pokémon por time, com análise de fraquezas e validação das regras da Liga."
      actions={
        <>
          <button type="button" className="btn btn-ghost" onClick={() => setImportOpen(true)}>
            <FileInput size={18} aria-hidden /> Importar do Showdown
          </button>
          <button type="button" className="btn btn-coral" onClick={criar}>
            <Plus size={18} aria-hidden /> Novo time
          </button>
        </>
      }
    >
      <main id="conteudo" className="teams-page">
        <TeamsNav n={teams.length} />
        {!user && (
          <Note nivel="info">
            Seus times ficam salvos neste navegador.{' '}
            {firebaseEnabled ? (
              <>
                <button type="button" className="link-btn" onClick={entrar}>
                  Entre com Google
                </button>{' '}
                para guardar na nuvem e compartilhar times públicos.
              </>
            ) : (
              'O login com Google ainda não foi configurado neste site.'
            )}
          </Note>
        )}
        {user && localTeamsPendentes > 0 && (
          <div className="cloud-offer">
            <CloudUpload size={22} aria-hidden />
            <p>
              Você tem <b>{localTeamsPendentes}</b> {localTeamsPendentes === 1 ? 'time salvo' : 'times salvos'} neste navegador antes do login.
            </p>
            <button
              type="button"
              className="btn btn-green"
              disabled={enviando}
              onClick={async () => {
                setEnviando(true);
                setEnviados(await enviarParaNuvem());
                setEnviando(false);
              }}
            >
              {enviando ? 'Enviando…' : 'Enviar meus times para a nuvem'}
            </button>
          </div>
        )}
        {enviados !== null && <Note nivel="info">{enviados} {enviados === 1 ? 'time enviado' : 'times enviados'} para a nuvem.</Note>}

        {teams.length === 0 ? (
          <div className="empty-teams">
            <div className="team-sprites ghost" aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} className="slot locked" />
              ))}
            </div>
            <h2 className="h-sub">Nenhum time ainda</h2>
            <p className="muted">Crie um time do zero, cole um time do Showdown ou adicione Pokémon direto pela Pokédex.</p>
            <div className="row-gap">
              <button type="button" className="btn btn-coral" onClick={criar}>
                <Plus size={18} aria-hidden /> Criar primeiro time
              </button>
              <Link to="/pokedex" className="btn btn-ghost">
                Abrir a Pokédex
              </Link>
            </div>
          </div>
        ) : (
          <ul className="my-teams">
            {teams.map((t) => (
              <li key={t.id} className="my-team">
                <Link to={`/times/${t.id}`} className="my-team-main">
                  <span className="my-team-top">
                    <span className="team-card-fmt">{FORMATOS.find((f) => f.id === t.formato)?.nome}</span>
                    <span className="vis" title={t.publico ? 'Público' : 'Privado'}>
                      {t.publico ? <Globe size={14} aria-hidden /> : <Lock size={14} aria-hidden />}
                      {t.publico ? 'Público' : 'Privado'}
                    </span>
                  </span>
                  <span className="team-card-name">{t.nome}</span>
                  <TeamSprites team={t} size={48} />
                  <span className="muted small">Atualizado em {fmtData(t.atualizadoEm)}</span>
                </Link>
                <div className="my-team-actions">
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => salvarTime({ ...t, id: uid(), nome: `${t.nome} (cópia)`, publico: false })}
                  >
                    <Copy size={15} aria-hidden /> Duplicar
                  </button>
                  {confirm === t.id ? (
                    <span className="confirm">
                      Excluir “{t.nome}”?
                      <button type="button" className="btn btn-sm danger" onClick={() => { excluirTime(t.id); setConfirm(null); }}>
                        Excluir
                      </button>
                      <button type="button" className="btn btn-sm btn-ghost" onClick={() => setConfirm(null)}>
                        Cancelar
                      </button>
                    </span>
                  ) : (
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => setConfirm(t.id)}>
                      <Trash2 size={15} aria-hidden /> Excluir
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

      </main>
      {importOpen && (
        <ShowdownDialog
          mode="import"
          onClose={() => setImportOpen(false)}
          onImport={(slots) => {
            const t = { ...novoTime('Time importado'), pokemon: slots };
            salvarTime(t);
            setImportOpen(false);
            nav(`/times/${t.id}`);
          }}
        />
      )}
    </Consult>
  );
}
