import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { config } from '../config';
import { categorias } from '../content/mods';
import { clauses, versaoRegulamento } from '../content/regras';
import '../styles/home.css';
import '../styles/dex.css';
import '../styles/pages.css';

export default function Mods() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('todas');
  const filtradas = useMemo(() => {
    const t = q.trim().toLowerCase();
    return categorias
      .filter((c) => cat === 'todas' || c.id === cat)
      .map((c) => ({
        ...c,
        mods: c.mods.filter((m) => !t || m.nome.toLowerCase().includes(t) || m.funcao.toLowerCase().includes(t) || m.arquivos.some((a) => a.toLowerCase().includes(t))),
      }))
      .filter((c) => c.mods.length);
  }, [q, cat]);
  const total = filtradas.reduce((a, c) => a + c.mods.length, 0);

  return (
    <main id="conteudo" className="mods-page">
      <section className="jogar-hero">
        <div className="wrap">
          <h1 className="display jogar-title">
            Mods & <span className="serif-i">regras</span>
          </h1>
          <p className="lede">
            Firma League v{config.modpack.versao} · {config.modpack.loader} {config.modpack.loaderVersao} · Minecraft {config.modpack.minecraft}.{' '}
            {config.modpack.modsCliente} mods no cliente, {config.modpack.modsServidor} no servidor dedicado (os puramente visuais ficam de fora).
          </p>
        </div>
      </section>

      <section className="paper mods-list-sec">
        <div className="wrap">
          <div className="mods-toolbar">
            <label className="dex-search">
              <Search size={18} aria-hidden />
              <span className="sr-only">Buscar mod</span>
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar mod, função ou arquivo .jar" />
            </label>
            <label className="field inline">
              <span className="sr-only">Categoria</span>
              <select className="input" value={cat} onChange={(e) => setCat(e.target.value)}>
                <option value="todas">Todas as categorias</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="dex-count" role="status">
            <span className="pixel tabular">{total}</span> entradas (alguns itens agrupam mais de um .jar)
          </p>
          {filtradas.map((c) => (
            <section key={c.id} className="mod-cat" aria-labelledby={`cat-${c.id}`}>
              <h2 id={`cat-${c.id}`} className="h-sub">
                {c.nome}
              </h2>
              <div className="mod-table-wrap">
                <table className="mod-table">
                  <thead>
                    <tr>
                      <th scope="col">Mod</th>
                      <th scope="col">Função no modpack</th>
                      <th scope="col">Arquivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.mods.map((m) => (
                      <tr key={m.nome}>
                        <th scope="row">
                          {m.nome}
                          {m.lado && <span className="side">{m.lado}</span>}
                        </th>
                        <td>{m.funcao}</td>
                        <td>
                          {m.arquivos.map((a) => (
                            <code key={a}>{a}</code>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
          {!filtradas.length && <p className="muted-ink">Nenhum mod encontrado.</p>}
        </div>
      </section>

      <section className="mods-sum">
        <div className="wrap">
          <div className="community-head">
            <h2 className="h-sec">
              Regras <span className="serif-i">da Liga</span>
            </h2>
            <Link to="/regulamento" className="text-link on-dark">
              Regulamento completo v{versaoRegulamento} <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
          <ul className="mod-cards">
            {clauses.map((c) => (
              <li key={c.nome}>
                <h3>{c.nome}</h3>
                <p>{c.texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
