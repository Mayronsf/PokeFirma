/**
 * Animações leves da Home, sem bibliotecas:
 * - TitleReveal: título entrando letra a letra (como texto de RPG).
 * - CountUp: números que sobem até o valor quando aparecem na tela.
 * - Reveal: bloco que surge ao rolar a página.
 * Com "reduzir movimento" ligado no sistema, tudo aparece pronto, sem animação.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export const reduzMovimento = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Dispara uma vez quando o elemento entra na tela. */
export function useVisivel<T extends Element>(margem = '0px 0px -12% 0px') {
  const ref = useRef<T>(null);
  const [visivel, setVisivel] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduzMovimento() || typeof IntersectionObserver === 'undefined') return setVisivel(true);
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setVisivel(true);
          io.disconnect();
        }
      },
      { rootMargin: margem },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margem]);
  return [ref, visivel] as const;
}

export function TitleReveal({ text, className, id }: { text: string; className?: string; id?: string }) {
  const palavras = text.split(' ');
  let n = 0;
  return (
    <h1 id={id} className={`${className ?? ''} title-reveal`} aria-label={text}>
      {palavras.map((p, wi) => [
        wi > 0 ? ' ' : null,
        <span key={wi} className="tr-word" aria-hidden="true">
          {[...p].map((ch, ci) => (
            <span key={ci} className="tr-char" style={{ '--n': n++ } as CSSProperties}>
              {ch}
            </span>
          ))}
        </span>,
      ])}
    </h1>
  );
}

export function CountUp({ value, duracao = 1100 }: { value: number; duracao?: number }) {
  const [ref, visivel] = useVisivel<HTMLSpanElement>('0px');
  const [v, setV] = useState(() => (reduzMovimento() ? value : 0));
  useEffect(() => {
    if (!visivel) return;
    if (reduzMovimento()) return setV(value);
    let raf = 0;
    const ini = performance.now();
    const passo = (t: number) => {
      const k = Math.min(1, (t - ini) / duracao);
      setV(Math.round(value * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [visivel, value, duracao]);
  return (
    <span ref={ref} aria-label={String(value)}>
      <span aria-hidden="true">{v}</span>
    </span>
  );
}

/** Surge ao rolar. `stagger` faz os filhos diretos entrarem um após o outro. */
export function Reveal({
  children,
  className,
  stagger,
  delay = 0,
  as: Tag = 'div',
  ...rest
}: {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
  delay?: number;
  as?: 'div' | 'section' | 'header';
} & Record<`aria-${string}`, string | undefined>) {
  const [ref, visivel] = useVisivel<HTMLDivElement>();
  return (
    <Tag
      ref={ref}
      className={`reveal${stagger ? ' reveal-stagger' : ''}${visivel ? ' is-in' : ''} ${className ?? ''}`.trim()}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
