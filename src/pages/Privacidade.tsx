import { Link } from 'react-router-dom';
import '../styles/home.css';
import '../styles/pages.css';

export default function Privacidade() {
  return (
    <main id="conteudo" className="doc">
      <section className="jogar-hero">
        <div className="wrap">
          <h1 className="display jogar-title">
            Política de <span className="serif-i">privacidade</span>
          </h1>
        </div>
      </section>
      <section className="paper">
        <div className="wrap doc-text narrow">
          <h2 className="h-sub">O que fica no seu navegador</h2>
          <p>Sem login, seu perfil (nick, bio, favorito, capítulo, insígnias), seus times e o tema escolhido ficam só no armazenamento local do navegador. Respostas da PokéAPI ficam em cache para não repetir downloads.</p>
          <h2 className="h-sub">O que vai para a nuvem</h2>
          <p>Ao entrar com Google, guardamos no Firebase (Google Cloud): seu identificador de conta, nick, bio, Pokémon favorito, capítulo, insígnias e times. Seu e-mail fica só na autenticação do Firebase e não aparece no site.</p>
          <h2 className="h-sub">O que é público</h2>
          <p>Só o que você marcar: times públicos (com link e na lista da comunidade) e, se ativado, o perfil em /jogador/seu-nick (nick, bio, favorito, capítulo e insígnias).</p>
          <h2 className="h-sub">Serviços de terceiros</h2>
          <p>O site carrega imagens de skin do mc-heads.net (enviando o nick), dados da PokéAPI e o status do servidor do api.mcsrvstat.us.</p>
          <h2 className="h-sub">Excluir seus dados</h2>
          <p>
            Em <Link to="/perfil">Perfil → Conta e dados</Link> você exclui a conta, o perfil e todos os times da nuvem, ou apaga os dados locais.
          </p>
        </div>
      </section>
    </main>
  );
}
