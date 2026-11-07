import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react';
import { definirSom, ouvirSom, pararCry, prepararCry, somLigado, tocarCry } from '../lib/cries';
import { artworkUrl } from '../lib/pokeapi';

export interface Lendario {
  dex: number;
  nome: string;
  regiao: string;
}

/**
 * Leque de lendários da Home.
 * - Mouse: ao passar por cima, a carta sobe e o Pokémon solta o som dele (baixinho).
 * - Toque (celular, sem "hover"): o 1º toque levanta a carta e toca o som; o 2º abre a Pokédex.
 */
export function LegendFan({ itens }: { itens: Lendario[] }) {
  const [som, setSom] = useState(somLigado);
  const [armado, setArmado] = useState<number | null>(null);
  const espera = useRef(0);
  const ultimo = useRef<{ dex: number; t: number }>({ dex: 0, t: 0 });
  const tipoPonteiro = useRef<string>('mouse');
  const lista = useRef<HTMLUListElement>(null);
  const nav = useNavigate();
  useEffect(() => ouvirSom(setSom), []);
  useEffect(() => () => window.clearTimeout(espera.current), []);

  // toque fora do leque desarma a carta levantada
  useEffect(() => {
    if (armado === null) return;
    const fora = (e: PointerEvent) => {
      if (!lista.current?.contains(e.target as Node)) setArmado(null);
    };
    document.addEventListener('pointerdown', fora);
    return () => document.removeEventListener('pointerdown', fora);
  }, [armado]);

  const tocar = (dex: number) => {
    const agora = performance.now();
    if (ultimo.current.dex === dex && agora - ultimo.current.t < 1500) return;
    ultimo.current = { dex, t: agora };
    tocarCry(dex);
  };
  const entrar = (dex: number) => {
    window.clearTimeout(espera.current);
    // pequena espera: passar o mouse correndo pelo leque não dispara 5 sons
    espera.current = window.setTimeout(() => tocar(dex), 140);
  };
  const sair = () => window.clearTimeout(espera.current);

  return (
    <>
      <ul
        ref={lista}
        className={`legend-fan${armado !== null ? ' has-armed' : ''}`}
        onPointerEnter={() => itens.forEach((p) => prepararCry(p.dex))}
        onPointerLeave={(e) => e.pointerType === 'mouse' && pararCry()}
      >
        {itens.map((p, i) => (
          <li key={p.dex} style={{ ['--i' as string]: i - 2 }} className={armado === p.dex ? 'armed' : undefined}>
            <Link
              to={`/pokedex/${p.dex}`}
              className="legend-card"
              onPointerDown={(e) => {
                tipoPonteiro.current = e.pointerType;
                if (e.pointerType !== 'mouse') prepararCry(p.dex);
              }}
              onPointerEnter={(e) => e.pointerType === 'mouse' && entrar(p.dex)}
              onPointerLeave={sair}
              onFocus={() => tipoPonteiro.current === 'mouse' && entrar(p.dex)}
              onBlur={sair}
              onClick={(e) => {
                if (tipoPonteiro.current === 'mouse') return;
                // toque: 1º levanta e toca o som, 2º abre
                if (armado !== p.dex) {
                  e.preventDefault();
                  setArmado(p.dex);
                  ultimo.current = { dex: 0, t: 0 };
                  tocar(p.dex);
                } else {
                  e.preventDefault();
                  nav(`/pokedex/${p.dex}`);
                }
              }}
            >
              <span className="legend-top">
                <span className="legend-region">{p.regiao}</span>
                <span className="pixel legend-num">#{String(p.dex).padStart(4, '0')}</span>
              </span>
              <span className="legend-art">
                <img src={artworkUrl(p.dex)} alt={p.nome} width={220} height={220} loading="lazy" />
              </span>
              <span className="legend-name display">{p.nome}</span>
              <span className="legend-tap-hint" aria-hidden="true">
                Toque de novo para abrir
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="legend-sound"
        aria-pressed={som}
        onClick={() => definirSom(!som)}
        title={som ? 'Desligar os sons dos lendários' : 'Ligar os sons dos lendários'}
      >
        {som ? <Volume2 size={15} aria-hidden /> : <VolumeX size={15} aria-hidden />}
        <span>{som ? 'Som ligado' : 'Som desligado'}</span>
      </button>
    </>
  );
}
