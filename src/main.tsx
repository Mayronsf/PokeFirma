import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource/big-shoulders-display/latin-800';
import '@fontsource/big-shoulders-display/latin-900';
import '@fontsource/instrument-serif/latin-400-italic';
import '@fontsource/figtree/latin-400';
import '@fontsource/figtree/latin-600';
import '@fontsource/figtree/latin-700';
import '@fontsource/figtree/latin-800';
import '@fontsource/silkscreen/latin-400';
import './styles/global.css';
import './styles/shell.css';
import App from './App';
import { recarregarUmaVez } from './components/ErrorBoundary';

// Versão nova publicada com a aba aberta: o navegador não acha os arquivos antigos.
window.addEventListener('vite:preloadError', (e) => {
  if (recarregarUmaVez()) e.preventDefault();
});
import { StoreProvider } from './lib/store';
import { LigaProvider } from './lib/liga';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <LigaProvider>
          <App />
        </LigaProvider>
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
