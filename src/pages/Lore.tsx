import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Lock, Trophy } from 'lucide-react';
import { capitulos, colapso, convergencia, eras, lendarios } from '../content/lore';
import { ChapterPicker, SpoilerGate, chapterState, useChapter } from '../components/Quest';
import { artworkUrl, spriteUrl } from '../lib/pokeapi';
import '../styles/home.css';
import '../styles/lore.css';

export default function Lore() {
  const [cap] = useChapter();
  return (
    <main id="conteudo" className="lore">
      <section className="lore-hero">
        <div className="wrap lore-hero-grid">
          <div>
            <h1 className="display lore-title">
              A Anomalia das <span className="serif-i">4 regiões</span>
            </h1>
          </div>
          <div className="lore-intro">
            <h2 className="h-sub">{convergencia.titulo}</h2>
            {convergencia.resumo.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className="muted-dark">{convergencia.porQueOsGinasios}</p>
          </div>
        </div>
        <div className="wrap" id="capitulo">
          <div className="lore-picker">
            <ChapterPicker />
            <p className="muted-dark small">Os capítulos depois do seu ficam borrados. O capítulo fica salvo no seu perfil.</p>
          </div>
        </div>
      </section>

      {/* ---------- capítulos ---------- */}
      <section className="paper lore-chapters" aria-labelledby="caps-title">
        <div className="wrap">
          <h2 id="caps-title" className="h-sec">
            Os quatro <span className="serif-i">capítulos</span>
          </h2>
          <ol className="questline">
            {capitulos.map((c) => {
              const st = chapterState(c.numero, cap);
              return (
                <li key={c.numero} id={`cap-${c.numero}`} className={`quest ${st}`}>
                  <div className="quest-rail" aria-hidden="true">
                    <span className="quest-node">
                      <span className="pixel">{c.numero}</span>
                    </span>
                  </div>
                  <div className="quest-body">
                    <header className="quest-head">
                      <span className="quest-region display">{c.regiao}</span>
                      <h3 className="quest-title serif-i">{c.titulo}</h3>
                      {st === 'current' && <span className="quest-here">Você está aqui</span>}
                    </header>
                    <SpoilerGate
                      capitulo={c.numero}
                      locked={(revelar) => (
                        <div className="quest-locked">
                          <Lock size={20} aria-hidden />
                          <p>Trancado até você chegar ao capítulo {c.numero}.</p>
                          <button type="button" className="btn btn-sm btn-ghost" onClick={revelar}>
                            <Eye size={15} aria-hidden /> Revelar spoiler
                          </button>
                        </div>
                      )}
                    >
                      <div className="quest-grid">
                        <div className="quest-story">
                          <h4>O que está acontecendo</h4>
                          {c.acontecendo.map((p, i) => (
                            <p key={i}>{p}</p>
                          ))}
                          <h4>Clímax</h4>
                          <ol className="climax">
                            {c.climax.map((p, i) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ol>
                        </div>
                        <aside className="quest-facts">
                          <img src={artworkUrl(c.destaque.dex)} alt={c.destaque.nome} width={200} height={200} loading="lazy" />
                          <dl>
                            <div>
                              <dt>{c.ameacaRotulo === 'Vilão' ? 'Vilões' : 'Ameaça'}</dt>
                              <dd>{c.viloes.join(' · ')}</dd>
                            </div>
                            <div>
                              <dt>Lendários</dt>
                              <dd>
                                {lendarios
                                  .filter((l) => l.capitulo === c.numero)
                                  .map((l) => l.nome)
                                  .join(' · ')}
                              </dd>
                            </div>
                            <div>
                              <dt>Locais</dt>
                              <dd>{c.locais.join(' · ')}</dd>
                            </div>
                            <div>
                              <dt>Ginásios</dt>
                              <dd>{c.ginasios}</dd>
                            </div>
                            <div>
                              <dt>Campeão</dt>
                              <dd>{c.campeao}</dd>
                            </div>
                          </dl>
                        </aside>
                      </div>
                      <div className="cup-card">
                        <Trophy size={26} aria-hidden />
                        <div>
                          <h4 className="display">{c.torneio.nome}</h4>
                          <p>{c.torneio.texto}</p>
                        </div>
                        <Link to="/liga" className="btn btn-sm">
                          Ver na Liga <ArrowRight size={15} aria-hidden />
                        </Link>
                      </div>
                    </SpoilerGate>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ---------- engenharia ---------- */}
      <section className="engenharia" aria-labelledby="eng-title">
        <div className="wrap">
          <div className="eng-head">
            <h2 id="eng-title" className="h-sec">
              Engenharia <span className="serif-i">da Firma</span>
            </h2>
            <div className="eng-intro">
              <h3 className="h-sub">{colapso.titulo}</h3>
              {colapso.texto.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <ol className="eras">
            {eras.map((e) => (
              <li key={e.numero} className="era">
                <div className="era-tag">
                  <span className="era-num display">Era {e.numero}</span>
                  <span className="era-region">{e.regiao}</span>
                </div>
                <div className="era-main">
                  <h3 className="era-title">{e.titulo}</h3>
                  <div className="recipe">
                    <ul className="recipe-in" aria-label="Itens-chave">
                      {e.chave.map((k) => (
                        <li key={k.nome} className="item-slot">
                          <b>{k.nome}</b>
                          {k.id && <code>{k.id}</code>}
                        </li>
                      ))}
                    </ul>
                    <span className="recipe-arrow" aria-hidden="true">
                      <ArrowRight size={26} />
                    </span>
                    <ul className="recipe-out" aria-label="O que libera">
                      {e.libera.map((l) => (
                        <li key={l}>{l}</li>
                      ))}
                    </ul>
                  </div>
                  {e.nota && <p className="era-note">{e.nota}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- mapa dos lendários ---------- */}
      <section className="paper" aria-labelledby="map-title">
        <div className="wrap">
          <h2 id="map-title" className="h-sec">
            Mapa dos <span className="serif-i">lendários</span>
          </h2>
          <p className="muted-ink map-intro">Cada lendário citado na lore, a estrutura onde aparece e a página dele na Pokédex.</p>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="map-region">
              <h3 className="map-region-name display">{capitulos[n - 1].regiao}</h3>
              <SpoilerGate
                capitulo={n}
                locked={(revelar) => (
                  <div className="map-locked">
                    <ul className="map-locked-slots" aria-label={`${lendarios.filter((l) => l.capitulo === n).length} lendários trancados`}>
                      {lendarios
                        .filter((l) => l.capitulo === n)
                        .map((l) => (
                          <li key={l.dex} className="slot locked" />
                        ))}
                    </ul>
                    <button type="button" className="btn btn-sm btn-ghost" onClick={revelar}>
                      <Eye size={15} aria-hidden /> Revelar capítulo
                    </button>
                  </div>
                )}
              >
                <ul className="legend-grid">
                  {lendarios
                    .filter((l) => l.capitulo === n)
                    .map((l) => (
                      <li key={l.dex}>
                        <Link to={`/pokedex/${l.dex}`} className="legend-tile">
                          <img src={spriteUrl(l.dex)} alt="" width={72} height={72} loading="lazy" />
                          <span>
                            <b>{l.nome}</b>
                            <span>{l.local}</span>
                          </span>
                          <span className="pixel legend-tile-num">#{String(l.dex).padStart(4, '0')}</span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </SpoilerGate>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
