import { Link } from 'react-router-dom';
import '../styles/home.css';
import '../styles/pages.css';

export default function NotFound() {
  return (
    <main id="conteudo" className="jogar-hero notfound">
      <div className="wrap">
        <p className="pixel nf-code">404</p>
        <h1 className="display jogar-title">
          Rota <span className="serif-i">fora do mapa</span>
        </h1>
        <p className="lede">Esta página não existe, ou a Convergência engoliu ela.</p>
        <Link to="/" className="btn btn-coral">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
