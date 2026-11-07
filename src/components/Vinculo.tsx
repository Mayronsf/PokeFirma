import { useState } from 'react';
import { BadgeCheck, Link2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { Note } from './ui';
import '../styles/jogo.css';

/** Vincular a conta do site ao jogador do Minecraft pelo token do /vincular. */
export function VinculoMinecraft({ compacto }: { compacto?: boolean }) {
  const { user, profile, vincular } = useStore();
  const [token, setToken] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<{ nivel: 'erro' | 'info'; t: string } | null>(null);
  if (!user) return null;
  if (profile.verificado)
    return (
      <div className="vinculo">
        <p>
          <span className="selo-verificado">
            <BadgeCheck size={14} aria-hidden /> Verificado
          </span>{' '}
          Conta ligada ao jogador <b>{profile.nick}</b> · Trainer ID <b className="trainer-id">{profile.trainer_id}</b>
        </p>
        {!compacto && <p className="muted small">Nick, insígnias, time, PC e Pokédex agora vêm do servidor e atualizam sozinhos.</p>}
      </div>
    );
  const valido = /^[A-Za-z0-9-]{4,20}$/.test(token.trim());
  return (
    <div className="vinculo">
      {!compacto && (
        <ol className="small">
          <li>Entre no servidor da Firma e digite <code>/vincular</code> no chat.</li>
          <li>Copie o código que aparecer (ex.: <code>FIRMA-8K2P</code>). Ele vale por poucos minutos.</li>
          <li>Cole aqui e confirme.</li>
        </ol>
      )}
      <form
        className="vinculo-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!valido || enviando) return;
          setEnviando(true);
          setMsg(null);
          try {
            const r = await vincular(token);
            setMsg({ nivel: 'info', t: `Pronto! Você é ${r.nick}, Trainer ID ${r.trainer_id}.` });
            setToken('');
          } catch (err) {
            setMsg({ nivel: 'erro', t: err instanceof Error ? err.message : 'Não consegui vincular.' });
          } finally {
            setEnviando(false);
          }
        }}
      >
        <label className="sr-only" htmlFor={compacto ? 'tok-c' : 'tok'}>
          Código do /vincular
        </label>
        <input
          id={compacto ? 'tok-c' : 'tok'}
          className="input"
          placeholder="FIRMA-8K2P"
          value={token}
          maxLength={20}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => setToken(e.target.value.toUpperCase())}
        />
        <button type="submit" className="btn btn-green" disabled={!valido || enviando}>
          <Link2 size={16} aria-hidden /> {enviando ? 'Vinculando…' : 'Vincular conta'}
        </button>
      </form>
      {msg && <Note nivel={msg.nivel}>{msg.t}</Note>}
    </div>
  );
}
