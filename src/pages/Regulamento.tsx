import { clauses, filosofiaCLT, formatoTorneio, mecanicas, targetDummy, temporadas, versaoRegulamento } from '../content/regras';
import '../styles/home.css';
import '../styles/pages.css';

export default function Regulamento() {
  return (
    <main id="conteudo" className="doc">
      <section className="jogar-hero">
        <div className="wrap">
          <h1 className="display jogar-title">
            Regulamento <span className="serif-i">oficial</span>
          </h1>
          <p className="lede">A Firma League e suas temporadas · versão {versaoRegulamento}.</p>
        </div>
      </section>
      <article className="paper">
        <div className="wrap doc-body">
          <nav className="doc-toc" aria-label="Seções">
            <ol>
              <li><a href="#temporadas">As 4 temporadas</a></li>
              <li><a href="#mecanicas">Mecânicas especiais</a></li>
              <li><a href="#dummy">Boneco de treino</a></li>
              <li><a href="#clauses">Clauses</a></li>
              <li><a href="#clt">Filosofia CLT</a></li>
              <li><a href="#torneio">Formato do torneio</a></li>
            </ol>
          </nav>
          <div className="doc-text">
            <section id="temporadas">
              <h2 className="h-sub">1. As 4 temporadas do servidor</h2>
              <p>Cada região tem a própria História (PvE), o Desafio dos 8 Ginásios, as Masmorras da Convergência e termina no Torneio Oficial da Liga dos Amigos.</p>
              <div className="doc-table-wrap">
                <table className="mod-table">
                  <thead>
                    <tr>
                      <th scope="col">Temporada</th>
                      <th scope="col">História (PvE)</th>
                      <th scope="col">Estruturas</th>
                      <th scope="col">Torneio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {temporadas.map((t) => (
                      <tr key={t.nome}>
                        <th scope="row">{t.nome}</th>
                        <td>{t.historia}</td>
                        <td>{t.estruturas}</td>
                        <td>{t.torneio}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section id="mecanicas">
              <h2 className="h-sub">2. Mecânicas especiais e o Omni Ring</h2>
              <ul>{mecanicas.map((m) => <li key={m}>{m}</li>)}</ul>
            </section>
            <section id="dummy">
              <h2 className="h-sub">3. Boneco de treino (Target Dummy)</h2>
              <p>{targetDummy}</p>
            </section>
            <section id="clauses">
              <h2 className="h-sub">4. Clauses competitivas</h2>
              <ol>{clauses.map((c) => <li key={c.nome}><b>{c.nome}:</b> {c.texto}</li>)}</ol>
            </section>
            <section id="clt">
              <h2 className="h-sub">5. Filosofia “CLT”</h2>
              <p>A maioria da Firma trabalha e joga em horários curtos. Por isso:</p>
              <ul>{filosofiaCLT.map((c) => <li key={c.nome}><b>{c.nome}:</b> {c.texto}</li>)}</ul>
            </section>
            <section id="torneio">
              <h2 className="h-sub">6. Formato do torneio</h2>
              <ol>{formatoTorneio.map((c) => <li key={c.nome}><b>{c.nome}:</b> {c.texto}</li>)}</ol>
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}
