import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react';
import { definirSom, ouvirSom, pararCry, prepararCry, somLigado, tocarCry } from '../lib/cries';
import { artworkUrl } from '../lib/pokeapi';

export interface Lendario {
  dex: number;
  nome: string;
  regiao: string;
}

/** Leque de lendários da Home: ao passar o mouse, a carta sobe e o Pokémon solta o som dele (baixinho). */
export function LegendFan({ itens }: { itens: Lendario[] }) {
  const [som, setSom] = useState(somLigado);
  const espera = useRef(0);
  const ultimo = useRef<{ dex: number; t: number }>({ dex: 0, t: 0 });
  useEffect(() => ouvirSom(setSom), []);
  useEffect(() => () => window.clearTimeout(espera.current), []);

  const entrar = (dex: number) => {
    window.clearTimeout(espera.current);
    // pequena espera: passar o mouse correndo pelo leque não dispara 5 sons
    espera.current = window.setTimeout(() => {
      const agora = performance.now();
      if (ultimo.current.dex === dex && agora - ultimo.current.t < 1500) return;
      ultimo.current = { dex, t: agora };
      tocarCry(dex);
    }, 140);
  };
  const sair = () => window.clearTimeout(espera.current);

  return (
    <>
      <ul className="legend-fan" onPointerEnter={() => itens.forEach((p) => prepararCry(p.dex))} onPointerLeave={() => pararCry()}>
        {itens.map((p, i) => (
          <li key={p.dex} style={{ ['--i' as string]: i - 2 }}>
            <Link
              to={`/pokedex/${p.dex}`}
              className="legend-card"
              onPointerEnter={(e) => e.pointerType === 'mouse' && entrar(p.dex)}
              onPointerLeave={sair}
              onFocus={() => entrar(p.dex)}
              onBlur={sair}
            >
              <span className="legend-top">
                <span className="legend-region">{p.regiao}</span>
                <span className="pixel legend-num">#{String(p.dex).padStart(4, '0')}</span>
              </span>
              <span className="legend-art">
                <img src={artworkUrl(p.dex)} alt={p.nome} width={220} height={220} loading="lazy" />
              </span>
              <span className="legend-name display">{p.nome}</span>
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
