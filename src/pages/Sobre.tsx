import { useState } from 'react';
import { config } from '../config';
import { Tbd } from '../components/ui';
import '../styles/home.css';
import '../styles/pages.css';

function Logo({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [ok, setOk] = useState(true);
  return ok ? (
    <img src={src} alt={alt} height={96} onError={() => setOk(false)} className={`about-logo ${className}`.trim()} />
  ) : (
    <span className="logo-slot-empty">
      {alt} · <code>{src.replace(/^\//, '')}</code> <Tbd />
    </span>
  );
}

export default function Sobre() {
  return (
    <main id="conteudo" className="doc">
      <section className="jogar-hero">
        <div className="wrap">
          <h1 className="display jogar-title">
            Sobre o <span className="serif-i">site</span>
          </h1>
        </div>
      </section>
      <section className="paper">
        <div className="wrap doc-text narrow">
          <p>
            Este é o site oficial do modpack <b>{config.modpack.nome}</b> e do servidor da Firma League: um grupo de amigos jogando uma campanha
            Pokémon por quatro regiões e disputando uma liga entre si.
          </p>
          <h2 className="h-sub">Desenvolvido por {config.desenvolvedor}</h2>
          <div className="about-logos">
            <Logo src="/assets/logo-firma.png" alt="Logo Firma League" />
            <Logo src="/assets/logo-fourtech.jpg" alt="Logo Fourtech Solutions, soluções em produtos digitais" className="about-logo-card" />
          </div>
          <h2 className="h-sub">Fontes de dados</h2>
          <ul>
            <li>Pokédex: PokéAPI (pokeapi.co), com cache no seu navegador.</li>
            <li>Skins: mc-heads.net, a partir do nick do Minecraft.</li>
            <li>Status do servidor: api.mcsrvstat.us.</li>
            <li>Dados da Liga e do modpack: arquivos editados pela organização da Firma.</li>
          </ul>
          <h2 className="h-sub">Aviso legal</h2>
          <p>
            Projeto de fãs, sem fins lucrativos. Pokémon e seus personagens são marcas da Nintendo, Game Freak, Creatures e The Pokémon Company.
            Minecraft é marca da Mojang/Microsoft. Não afiliado a esses donos de marca nem à equipe do Cobblemon.
          </p>
        </div>
      </section>
    </main>
  );
}
