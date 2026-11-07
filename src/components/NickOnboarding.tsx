import { useEffect, useRef, useState } from 'react';
import { useStore } from '../lib/store';
import { SkinBody } from './ui';
import { VinculoMinecraft } from './Vinculo';
import '../styles/onboard.css';

/**
 * No primeiro acesso com Google: vincular a conta do Minecraft pelo código do /vincular (recomendado)
 * ou só digitar o nick (vira avatar e render do perfil; dá para vincular depois em /perfil).
 */
export function NickOnboarding() {
  const { user, profile, pronto, salvarPerfil } = useStore();
  const [nick, setNick] = useState('');
  const [preview, setPreview] = useState('');
  const [dispensado, setDispensado] = useState(false);
  const [modo, setModo] = useState<'token' | 'nick'>('token');
  const dlg = useRef<HTMLDialogElement>(null);
  const open = pronto && !!user && !profile.nick && !profile.verificado && !dispensado;

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => {
    const t = setTimeout(() => setPreview(nick.trim()), 500);
    return () => clearTimeout(t);
  }, [nick]);

  const valido = /^[A-Za-z0-9_]{3,16}$/.test(nick.trim());
  return (
    <dialog ref={dlg} className="onboard" onCancel={() => setDispensado(true)} aria-labelledby="onboard-title">
      <div className="onboard-inner">
        <div className="onboard-skin" aria-hidden="true">
          {preview && /^[A-Za-z0-9_]{3,16}$/.test(preview) ? <SkinBody key={preview} nick={preview} height={240} /> : <SkinBody nick="MHF_Steve" height={240} />}
        </div>
        <div className="onboard-body">
          <h2 id="onboard-title" className="h-sub">
            {modo === 'token' ? 'Vincule sua conta do Minecraft' : 'Qual é o seu nick no Minecraft?'}
          </h2>
          {modo === 'token' ? (
            <>
              <p>
                Já jogou no servidor? Digite <code>/vincular</code> no chat do jogo e cole o código aqui. Seu nick, insígnias, time e PC passam a
                aparecer no site sozinhos.
              </p>
              <VinculoMinecraft compacto />
              <button type="button" className="text-link small onboard-alt" onClick={() => setModo('nick')}>
                Ainda não entrei no servidor: só quero digitar meu nick
              </button>
              <div className="onboard-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setDispensado(true)}>
                  Depois
                </button>
              </div>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!valido) return;
                salvarPerfil({ nick: nick.trim() });
              }}
            >
              <p>A skin vira o seu avatar no site e o render do seu perfil. Dá para vincular a conta do jogo depois, em Perfil.</p>
              <label className="field">
                <span>Nick do Minecraft</span>
                <input
                  className="input"
                  value={nick}
                  onChange={(e) => setNick(e.target.value)}
                  autoFocus
                  maxLength={16}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={nick.length > 0 && !valido}
                  aria-describedby="nick-help"
                />
              </label>
              <p id="nick-help" className="small muted">
                3 a 16 caracteres: letras, números e _.
              </p>
              <button type="button" className="text-link small onboard-alt" onClick={() => setModo('token')}>
                Tenho o código do /vincular
              </button>
              <div className="onboard-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setDispensado(true)}>
                  Depois
                </button>
                <button type="submit" className="btn btn-coral" disabled={!valido}>
                  Salvar nick
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </dialog>
  );
}
