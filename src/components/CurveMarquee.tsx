import { useEffect, useRef } from 'react';

const REPEATS = 14;

/**
 * Faixa curva com texto repetido (SVG textPath). O deslocamento anda exatamente uma
 * frase por ciclo, então o loop é contínuo. Para quando o sistema pede menos movimento
 * ou quando a faixa sai da tela.
 */
export function CurveMarquee({ text, flip = false }: { text: string; flip?: boolean }) {
  const tp = useRef<SVGTextPathElement>(null);
  const textEl = useRef<SVGTextElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    let visible = true;
    let pos = 0;
    let last = performance.now();
    const unit = () => (textEl.current ? textEl.current.getComputedTextLength() / REPEATS : 300);
    const apply = () => {
      const u = unit();
      const o = flip ? -u + (pos % u) : -(pos % u);
      tp.current?.setAttribute('startOffset', String(o - u));
    };
    const step = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      pos += dt * 0.06;
      apply();
      if (visible && !reduce.matches) raf = requestAnimationFrame(step);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      if (!reduce.matches) raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    if (svg.current) io.observe(svg.current);
    document.fonts?.ready.then(apply);
    apply();
    start();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [flip]);
  const id = flip ? 'curve-b' : 'curve-a';
  const d = flip
    ? 'M -100 250 C 260 60, 540 390, 820 230 S 1280 60, 1620 250'
    : 'M -100 110 C 220 330, 560 10, 860 170 S 1330 330, 1620 100';
  const run = Array(REPEATS).fill(text + ' ').join('');
  return (
    <svg ref={svg} className={`curve-marquee${flip ? ' flip' : ''}`} viewBox="0 0 1500 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <path id={id} d={d} />
      </defs>
      <use href={`#${id}`} className="curve-band" />
      <text ref={textEl} className="curve-text" dy="0.36em">
        <textPath ref={tp} href={`#${id}`}>
          {run}
        </textPath>
      </text>
    </svg>
  );
}
