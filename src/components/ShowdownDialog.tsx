import { useEffect, useRef, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { useDexIndex } from '../lib/hooks';
import { exportTeam, importTeam } from '../lib/showdown';
import type { Slot } from '../lib/team';
import { Note } from './ui';

export function ShowdownDialog({
  mode,
  slots = [],
  onClose,
  onImport,
}: {
  mode: 'import' | 'export';
  slots?: Slot[];
  onClose: () => void;
  onImport?: (s: Slot[]) => void;
}) {
  const dlg = useRef<HTMLDialogElement>(null);
  const idx = useDexIndex();
  const [text, setText] = useState(mode === 'export' ? exportTeam(slots) : '');
  const [erros, setErros] = useState<string[]>([]);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    dlg.current?.showModal();
  }, []);

  return (
    <dialog ref={dlg} className="sd-dialog" onClose={onClose} aria-labelledby="sd-title">
      <div className="sd-head">
        <h2 id="sd-title" className="h-sub">
          {mode === 'import' ? 'Importar do Showdown' : 'Exportar para o Showdown'}
        </h2>
        <button type="button" className="btn btn-sm btn-ghost btn-icon" aria-label="Fechar" onClick={() => dlg.current?.close()}>
          <X size={18} aria-hidden />
        </button>
      </div>
      <label className="field">
        <span>{mode === 'import' ? 'Cole o time no formato de texto do Pokémon Showdown' : 'Texto do time'}</span>
        <textarea
          className="input"
          rows={14}
          value={text}
          readOnly={mode === 'export'}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          placeholder={'Gengar @ Life Orb\nAbility: Cursed Body\nLevel: 50\nTimid Nature\n- Shadow Ball\n- Sludge Bomb'}
        />
      </label>
      {erros.map((e) => (
        <Note key={e} nivel="aviso">
          {e}
        </Note>
      ))}
      <div className="sd-actions">
        {mode === 'export' ? (
          <button
            type="button"
            className="btn btn-coral"
            onClick={() => navigator.clipboard?.writeText(text).then(() => setCopiado(true))}
          >
            {copiado ? <Check size={18} aria-hidden /> : <Copy size={18} aria-hidden />}
            {copiado ? 'Copiado' : 'Copiar texto'}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-coral"
            disabled={!text.trim() || !idx.data}
            onClick={() => {
              if (!idx.data) return;
              const r = importTeam(text, idx.data);
              if (!r.slots.length) {
                setErros(r.erros.length ? r.erros : ['Não encontrei nenhum Pokémon no texto.']);
                return;
              }
              if (r.erros.length) setErros(r.erros);
              onImport?.(r.slots);
            }}
          >
            {idx.loading ? 'Carregando Pokédex…' : 'Importar time'}
          </button>
        )}
      </div>
    </dialog>
  );
}
