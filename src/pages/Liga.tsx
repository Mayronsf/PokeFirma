import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { config } from '../config';
import { clauses, formatoTorneio } from '../content/regras';
import { ExemploFlag, Podium, RankList, TournamentCard } from '../components/League';
import { Tbd } from '../components/ui';
import { useLiga } from '../lib/liga';
import { grassField } from '../lib/pixelWorld';
import { fmtData } from '../lib/pt';
import '../styles/home.css';
import '../styles/pages.css';

export default function Liga() {
  const { data: ligaData, aoVivo } = useLiga();
  const bg = config.imagens.rankingMundo ?? grassField();
  const [sp, setSp] = useSearchParams();
  const aberto = sp.get('torneio');
  // Vindo da Home (/liga?torneio=id): rola até o torneio aberto.
  const rolou = useRef(false);
  useEffect(() => {
    if (!aberto || rolou.current) return;
    rolou.current = true;
    requestAnimationFrame(() => document.getElementById(`torneio-${aberto}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  }, [aberto]);
  return (
    <main id="conteudo" className="liga">
      <section className="jogar-hero">
        <div className="wrap">
          <h1 className="display jogar-title">
            A <span className="serif-i">Liga</span>
          </h1>
          <p className="lede">
            Quatro Copas, uma por região, e a Grande Final. Fase de grupos com 3 pontos por vitória e playoffs em melhor de 3.
          </p>
        </div>
      </section>

      <section className="ranking liga-ranking" style={{ backgroundImage: `url(${bg})` }} aria-labelledby="rk">
        <div className="wrap ranking-inner">
          <header className="ranking-head">
            <h2 id="rk" className="h-sec">
              Ranking geral
            </h2>
            <p>
              Atualizado em {fmtData(ligaData.atualizadoEm)} {aoVivo && <span className="live-flag">Ao vivo</span>} <ExemploFlag />
            </p>
          </header>
          <Podium />
          <RankList from={3} />
        </div>
      </section>

      <section className="paper" aria-labelledby="tr">
        <div className="wrap">
          <h2 id="tr" className="h-sec">
            Torneios <ExemploFlag />
          </h2>
          <p className="muted small tourney-hint">Toque num torneio para ver o chaveamento, as tabelas dos grupos e os times.</p>
          <div className="tourney-grid light">
            {ligaData.torneios.map((t) => (
              <TournamentCard
                key={t.id}
                t={t}
                full
                aberto={aberto === t.id}
                onToggle={() => setSp(aberto === t.id ? {} : { torneio: t.id }, { replace: true, preventScrollReset: true })}
              />
            ))}
          </div>
          {!ligaData.torneios.length && <p className="muted">Nenhum torneio anunciado ainda.</p>}
        </div>
      </section>

      <section className="mods-sum" aria-labelledby="rg">
        <div className="wrap">
          <div className="community-head">
            <h2 id="rg" className="h-sec">
              Regulamento <span className="serif-i">resumido</span>
            </h2>
            <Link to="/regulamento" className="text-link on-dark">
              Documento completo <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
          <div className="liga-rules">
            <div>
              <h3 className="h-sub">Formatos</h3>
              <ul className="rule-list">
                {formatoTorneio.map((f) => (
                  <li key={f.nome}>
                    <b>{f.nome}.</b> {f.texto}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="h-sub">Clauses</h3>
              <ul className="rule-list">
                {clauses.map((c) => (
                  <li key={c.nome}>
                    <b>{c.nome}.</b> {c.texto}
                  </li>
                ))}
              </ul>
              <h3 className="h-sub">Level cap por capítulo</h3>
              <ul className="cap-list">
                {(['Kanto', 'Johto', 'Hoenn', 'Sinnoh'] as const).map((r, i) => {
                  const v = config.levelCaps[(i + 1) as 1 | 2 | 3 | 4];
                  return (
                    <li key={r}>
                      <span>{r}</span>
                      {v ? <b className="pixel">Nv {v}</b> : <Tbd />}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
