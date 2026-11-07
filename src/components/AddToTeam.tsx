import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Plus } from 'lucide-react';
import { useStore } from '../lib/store';
import { novoSlot, novoTime } from '../lib/team';

/** Botão "Adicionar ao time": escolhe um time com vaga ou cria um novo. */
export function AddToTeam({ dex, especie, nome, compact }: { dex: number; especie: string; nome: string; compact?: boolean }) {
  const { teams, salvarTime } = useStore();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<{ id: string; nome: string } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(null), 4000);
    return () => clearTimeout(t);
  }, [done]);

  const add = (teamId?: string) => {
    const base = teamId ? teams.find((t) => t.id === teamId)! : novoTime(`Time de ${nome}`);
    const t = { ...base, pokemon: [...base.pokemon, novoSlot(dex, especie)] };
    salvarTime(t);
    setDone({ id: t.id, nome: t.nome });
    setOpen(false);
  };

  return (
    <div className={`add-team${compact ? ' compact' : ''}`} ref={ref}>
      <button
        type="button"
        className={compact ? 'add-team-mini' : 'btn btn-coral'}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={compact ? `Adicionar ${nome} a um time` : undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <Plus size={compact ? 16 : 18} aria-hidden />
        {!compact && 'Adicionar ao time'}
      </button>
      {open && (
        <div className="add-team-pop" role="menu" onClick={(e) => e.stopPropagation()}>
          <p className="add-team-label">Adicionar {nome} a…</p>
          {teams.map((t) => {
            const full = t.pokemon.length >= 6;
            return (
              <button key={t.id} type="button" role="menuitem" disabled={full} onClick={() => add(t.id)}>
                <span>{t.nome}</span>
                <span className="pixel tabular">{t.pokemon.length}/6</span>
              </button>
            );
          })}
          <button type="button" role="menuitem" className="add-team-new" onClick={() => add()}>
            <Plus size={16} aria-hidden /> Novo time
          </button>
        </div>
      )}
      {done && (
        <p className="add-team-done" role="status">
          <Check size={16} aria-hidden /> Adicionado em <Link to={`/times/${done.id}`}>{done.nome}</Link>
        </p>
      )}
    </div>
  );
}
