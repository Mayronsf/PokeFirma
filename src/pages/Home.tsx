import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Lock } from 'lucide-react';
import { config } from '../config';
import { capitulos, convergencia } from '../content/lore';
import { CurveMarquee } from '../components/CurveMarquee';
import { ExemploFlag, Podium, RankingTabs, RankList, TournamentCard } from '../components/League';
import { SpoilerGate, chapterState, useChapter } from '../components/Quest';
import { TeamCard } from '../components/TeamCard';
import { HeroSkin } from '../components/HeroSkin';
import { LegendFan } from '../components/LegendFan';
import { Reveal, TitleReveal, useVisivel } from '../components/Motion';
import { CopyIP, ServerPill, Socials } from '../components/ui';
import { timesExemplo, type CommunityTeam } from '../lib/hooks';
import { useLiga } from '../lib/liga';
import { artworkUrl } from '../lib/pokeapi';
import { grassField, sideWorld } from '../lib/pixelWorld';
import { lerTimesPublicos } from '../lib/store';
import { membroNick, membroSkin } from '../lib/skins';
import '../styles/home.css';

const FAN = [
  { dex: 150, nome: 'Mewtwo', regiao: 'Kanto' },
  { dex: 250, nome: 'Ho-Oh', regiao: 'Johto' },
  { dex: 493, nome: 'Arceus', regiao: 'Sinnoh' },
  { dex: 384, nome: 'Rayquaza', regiao: 'Hoenn' },
  { dex: 483, nome: 'Dialga', regiao: 'Sinnoh' },
];

function useCommunity(): CommunityTeam[] {
  const [list, set] = useState<CommunityTeam[]>(timesExemplo);
  useEffect(() => {
    lerTimesPublicos(6)
      .then((ts) => {
        if (ts.length)
          set(
            ts.map((t) => ({
              team: t,
              autor: t.autorNick || 'Treinador',
              to: `/time/${t.autorUid}/${t.id}`,
            })),
          );
      })
      .catch(() => {});
  }, []);
  return list;
}

export default function Home() {
  const [cap] = useChapter();
  const { data: ligaData } = useLiga();
  const community = useCommunity();
  const heroBg = config.imagens.heroMundo ?? sideWorld();
  const grassBg = config.imagens.rankingMundo ?? grassField();
  const m = config.membros;
  const [trilhaRef, trilhaIn] = useVisivel<HTMLOListElement>();

  return (
    <main id="conteudo" className="home">
      {/* ---------- HERO ---------- */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="wrap hero-copy">
          <p className="hero-kicker">Modpack Cobblemon • {config.modpack.minecraft}</p>
          <TitleReveal id="hero-title" className="display hero-title" text="Firma League" />
          <p className="hero-pitch">
            Campanha Pokémon por quatro regiões e uma liga competitiva entre amigos, no mesmo servidor. Aqui você{' '}
            <Link to="/lore">lê a lore</Link>, <Link to="/pokedex">consulta a Pokédex</Link> e{' '}
            <Link to="/times">monta seus times</Link>.
          </p>
          <Socials />
        </div>

        <div className="wrap hero-stage">
          <HeroSkin nick={membroNick(m[0], 'MHF_Steve')} skin={membroSkin(m[0])} lado="left" />
          <div className="hero-card" style={{ backgroundImage: `url(${heroBg})` }}>
            <div className="hero-card-inner">
              <h2 className="hero-card-title display">
                Uma liga. Quatro regiões. Um <span className="serif-i">campeão.</span>
              </h2>
              <div className="hero-card-actions">
                <Link to="/jogar" className="btn btn-coral btn-lg">
                  Jogar agora <ArrowRight size={18} aria-hidden />
                </Link>
                <CopyIP />
              </div>
              <ServerPill className="server-pill on-card" />
            </div>
          </div>
          <HeroSkin nick={membroNick(m[1], 'MHF_Alex')} skin={membroSkin(m[1])} lado="right" />
        </div>
      </section>

      {/* ---------- FAIXA + LENDÁRIOS ---------- */}
      <section className="legend-band" aria-label="Os lendários das quatro regiões">
        <CurveMarquee text="KANTO • JOHTO • HOENN • SINNOH • FIRMA LEAGUE •" />
        <LegendFan itens={FAN} />
      </section>

      {/* ---------- A ANOMALIA + REGIÕES ---------- */}
      <section className="paper" aria-labelledby="anomalia-title">
        <Reveal className="wrap anomalia">
          <h2 id="anomalia-title" className="h-sec">
            A <span className="serif-i">Anomalia</span>
          </h2>
          <div className="anomalia-text">
            {convergencia.resumo.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <Link to="/lore" className="text-link">
              Ler a história completa <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </Reveal>

        <div className="wrap">
          <Reveal className="trail-head">
            <h2 className="h-sub">As quatro regiões</h2>
            <p className="muted-ink">
              Você está no capítulo <b>{cap}</b>. Os capítulos seguintes ficam trancados até você chegar lá.{' '}
              <Link to="/lore#capitulo">Mudar capítulo</Link>
            </p>
          </Reveal>
          <ol className="trail reveal-list" style={{ ['--progress' as string]: (cap - 1) / 3 }} ref={trilhaRef} data-in={trilhaIn || undefined}>
            {capitulos.map((c) => {
              const st = chapterState(c.numero, cap);
              return (
                <li key={c.numero} className={`trail-stop ${st}`}>
                  <span className="trail-node" aria-hidden="true">
                    <span className="pixel">{c.numero}</span>
                  </span>
                  <SpoilerGate
                    capitulo={c.numero}
                    locked={(revelar) => (
                      <div className="region-card region-locked">
                        <span className="region-name display">{c.regiao}</span>
                        <span className="region-lock-line">
                          <Lock size={16} aria-hidden /> Capítulo {c.numero} trancado
                        </span>
                        <button type="button" className="btn btn-sm btn-ghost" onClick={revelar}>
                          <Eye size={15} aria-hidden /> Revelar spoiler
                        </button>
                      </div>
                    )}
                  >
                    <Link to={`/lore#cap-${c.numero}`} className="region-card">
                      <span className="region-name display">{c.regiao}</span>
                      <span className="region-title serif-i">{c.titulo}</span>
                      <img src={artworkUrl(c.destaque.dex)} alt="" width={160} height={160} loading="lazy" className="region-art" />
                      <dl className="region-facts">
                        <div>
                          <dt>Lendário</dt>
                          <dd>{c.destaque.nome}</dd>
                        </div>
                        <div>
                          <dt>{c.ameacaRotulo}</dt>
                          <dd>{c.ameaca}</dd>
                        </div>
                      </dl>
                    </Link>
                  </SpoilerGate>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ---------- RANKING ---------- */}
      <section className="ranking" aria-labelledby="ranking-title" style={{ backgroundImage: `url(${grassBg})` }}>
        <div className="wrap ranking-inner">
          <Reveal as="header" className="ranking-head">
            <h2 id="ranking-title" className="h-sec">
              Ranking
            </h2>
            <p>
              Pontos corridos da Liga · atualizado em {new Date(ligaData.atualizadoEm + 'T12:00:00').toLocaleDateString('pt-BR')}{' '}
              <ExemploFlag />
            </p>
          </Reveal>
          <Reveal className="ranking-body" delay={120}>
          <RankingTabs>
            {(tab) =>
              tab === 'jogadores' ? (
                <>
                  <Podium />
                  <RankList from={3} limit={6} />
                  <Link to="/liga" className="btn btn-ghost on-green">
                    Ver ranking completo <ArrowRight size={16} aria-hidden />
                  </Link>
                </>
              ) : (
                <div className="tourney-grid">
                  {ligaData.torneios.map((t) => (
                    <TournamentCard key={t.id} t={t} />
                  ))}
                  {!ligaData.torneios.length && <p className="rank-empty">Nenhum torneio anunciado ainda.</p>}
                </div>
              )
            }
          </RankingTabs>
          </Reveal>
        </div>
      </section>

      {/* ---------- TIMES DA COMUNIDADE ---------- */}
      <section className="paper community" aria-labelledby="community-title">
        <div className="wrap">
          <Reveal className="community-head">
            <h2 id="community-title" className="h-sec">
              Times da <span className="serif-i">comunidade</span>
            </h2>
            <Link to="/times/comunidade" className="text-link">
              Ver todos <ArrowRight size={16} aria-hidden />
            </Link>
          </Reveal>
          <Reveal className="team-grid" stagger>
            {community.map((c) => (
              <TeamCard key={c.team.id} team={c.team} autor={c.autor} skin={c.skin} to={c.to} />
            ))}
          </Reveal>
          {community.some((c) => c.exemplo) && <p className="muted-ink small">Times de exemplo, enquanto a Firma não publica os seus.</p>}
        </div>
      </section>
    </main>
  );
}
