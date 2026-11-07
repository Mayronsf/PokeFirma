import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Eye, Lock } from 'lucide-react';
import type { Chapter } from '../config';
import { useStore } from '../lib/store';

const REGIOES = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh'];

/** Capítulo atual: do perfil (local ou nuvem). */
export function useChapter(): [Chapter, (c: Chapter) => void] {
  const { profile, salvarPerfil } = useStore();
  return [profile.capitulo, (c) => salvarPerfil({ capitulo: c })];
}

export function ChapterPicker({ label = 'Estou no capítulo' }: { label?: string }) {
  const [cap, setCap] = useChapter();
  return (
    <div className="chapter-picker">
      <span className="label" id="cap-label">
        {label}
      </span>
      <div role="radiogroup" aria-labelledby="cap-label" className="chapter-steps">
        {REGIOES.map((r, i) => {
          const n = (i + 1) as Chapter;
          return (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={cap === n}
              className={`chapter-step${n < cap ? ' done' : ''}${n === cap ? ' current' : ''}`}
              onClick={() => setCap(n)}
            >
              <span className="pixel">{n}</span> {r}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Conteúdo de um capítulo além do progresso do jogador fica borrado. */
export function SpoilerGate({
  capitulo,
  children,
  compact,
  locked: lockedView,
}: {
  capitulo: number;
  children: ReactNode;
  compact?: boolean;
  /** Quando informado, o conteúdo trancado não é renderizado: aparece só este nó trancado. */
  locked?: (revelar: () => void) => ReactNode;
}) {
  const [cap] = useChapter();
  const [revealed, setRevealed] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const altura0 = useRef<number | null>(null);
  const [brilho, setBrilho] = useState(false);
  const locked = capitulo > cap && !revealed;
  const revelar = () => {
    altura0.current = wrap.current?.offsetHeight ?? null;
    setRevealed(true);
  };

  // Ao revelar: a caixa cresce da altura do cadeado até a do conteúdo, e o conteúdo sai do desfoque.
  useLayoutEffect(() => {
    const el = wrap.current;
    const h0 = altura0.current;
    if (!revealed || !el || h0 === null) return;
    altura0.current = null;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !el.animate) return;
    const h1 = el.offsetHeight;
    const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
    el.style.overflow = 'hidden';
    const anim = el.animate([{ height: `${h0}px` }, { height: `${h1}px` }], { duration: 650, easing: ease });
    anim.onfinish = anim.oncancel = () => {
      el.style.overflow = '';
    };
    const filhos = Array.from((el.querySelector('.spoiler-content') ?? el.firstElementChild)?.children ?? []) as HTMLElement[];
    (filhos.length ? filhos : [el.firstElementChild as HTMLElement]).forEach((c, i) =>
      c?.animate(
        [
          { opacity: 0, filter: 'blur(10px)', transform: 'translateY(14px) scale(0.985)' },
          { opacity: 1, filter: 'blur(0px)', transform: 'none' },
        ],
        { duration: 700, delay: 80 + i * 70, easing: ease, fill: 'backwards' },
      ),
    );
    setBrilho(true);
    const t = window.setTimeout(() => setBrilho(false), 1000);
    return () => window.clearTimeout(t);
  }, [revealed]);

  const flash = brilho && <span className="spoiler-flash" aria-hidden="true" />;
  if (locked && lockedView)
    return (
      <div ref={wrap} className="spoiler-wrap">
        {lockedView(revelar)}
      </div>
    );
  if (lockedView)
    return (
      <div ref={wrap} className="spoiler-wrap">
        {children}
        {flash}
      </div>
    );
  return (
    <div className={`spoiler${locked ? ' is-locked' : ''}${compact ? ' compact' : ''}`}>
      <div
        className="spoiler-content"
        aria-hidden={locked}
        ref={(el) => {
          if (el) locked ? el.setAttribute('inert', '') : el.removeAttribute('inert');
        }}
      >
        {children}
      </div>
      {locked && (
        <div className="spoiler-cover">
          <Lock size={compact ? 18 : 22} aria-hidden />
          <span>
            Capítulo {capitulo} · {REGIOES[capitulo - 1]}
          </span>
          <button type="button" className="btn btn-sm btn-ghost" onClick={revelar}>
            <Eye size={15} aria-hidden /> Revelar spoiler
          </button>
        </div>
      )}
    </div>
  );
}

export function QuestNode({ state, children, label }: { state: 'done' | 'current' | 'locked'; children: ReactNode; label: string }) {
  return (
    <span className={`quest-node ${state}`} aria-label={label}>
      {children}
      {state === 'current' && <i className="quest-pip" aria-hidden />}
    </span>
  );
}

export const chapterState = (n: number, cap: number): 'done' | 'current' | 'locked' =>
  n < cap ? 'done' : n === cap ? 'current' : 'locked';
