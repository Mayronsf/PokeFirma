import { useEffect, useRef, useState } from 'react';
import { useStore } from '../lib/store';
import { SkinBody } from './ui';

/** No primeiro acesso com Google, pede o nick do Minecraft (vira avatar e render do perfil). */
export function NickOnboarding() {
  const { user, profile, pronto, salvarPerfil } = useStore();
  const [nick, setNick] = useState('');
  const [preview, setPreview] = useState('');
  const [dispensado, setDispensado] = useState(false);
  const dlg = useRef<HTMLDialogElement>(null);
  const open = pronto && !!user && !profile.nick && !dispensado;

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
      <form
        method="dialog"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valido) return;
          salvarPerfil({ nick: nick.trim() });
        }}
      >
        <div className="onboard-skin" aria-hidden="true">
          {preview && /^[A-Za-z0-9_]{3,16}$/.test(preview) ? <SkinBody key={preview} nick={preview} height={240} /> : <SkinBody nick="MHF_Steve" height={240} />}
        </div>
        <div className="onboard-body">
          <h2 id="onboard-title" className="h-sub">
            Qual é o seu nick no Minecraft?
          </h2>
          <p>A skin vira o seu avatar no site e o render do seu perfil. Dá para trocar depois.</p>
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
          <div className="onboard-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setDispensado(true)}>
              Depois
            </button>
            <button type="submit" className="btn btn-coral" disabled={!valido}>
              Salvar nick
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}
