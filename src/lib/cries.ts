/**
 * Som (cry) dos Pokémon, vindo do repositório de áudio da PokéAPI.
 * Volume baixo de propósito e sempre um som por vez. O visitante pode desligar (fica salvo).
 * Obs.: navegadores só liberam áudio depois que a pessoa clica/toca/tecla algo na página;
 * antes disso o som simplesmente não sai (sem erro na tela).
 */
const URL_CRY = (dex: number) => `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${dex}.ogg`;
const LS = 'firma:som';
export const VOLUME_CRY = 0.18;

const cache = new Map<number, HTMLAudioElement>();
let atual: HTMLAudioElement | null = null;
let fade = 0;
const ouvintes = new Set<(on: boolean) => void>();

const suportaOgg = () => typeof Audio !== 'undefined' && new Audio().canPlayType('audio/ogg; codecs="vorbis"') !== '';

export function somLigado(): boolean {
  try {
    return localStorage.getItem(LS) !== 'off';
  } catch {
    return true;
  }
}
export function definirSom(on: boolean) {
  try {
    localStorage.setItem(LS, on ? 'on' : 'off');
  } catch {
    /* ok */
  }
  if (!on) pararCry();
  ouvintes.forEach((f) => f(on));
}
export function ouvirSom(f: (on: boolean) => void) {
  ouvintes.add(f);
  return () => void ouvintes.delete(f);
}

function audioDe(dex: number) {
  let a = cache.get(dex);
  if (!a) {
    a = new Audio(URL_CRY(dex));
    a.preload = 'auto';
    cache.set(dex, a);
  }
  return a;
}

/** Baixa o som antes (chamar quando o mouse se aproxima), para tocar sem atraso. */
export function prepararCry(dex: number) {
  if (suportaOgg() && somLigado()) audioDe(dex);
}

export function tocarCry(dex: number) {
  if (!somLigado() || !suportaOgg()) return;
  pararCry(true);
  const a = audioDe(dex);
  a.volume = VOLUME_CRY;
  try {
    a.currentTime = 0;
  } catch {
    /* ainda carregando */
  }
  atual = a;
  a.play().catch(() => {
    /* bloqueado até a primeira interação, ou falha de rede: fica em silêncio */
  });
}

/** Para o som atual com um fade curto (ou na hora). */
export function pararCry(imediato = false) {
  const a = atual;
  if (!a) return;
  cancelAnimationFrame(fade);
  if (imediato || a.paused) {
    a.pause();
    atual = null;
    return;
  }
  const v0 = a.volume;
  const ini = performance.now();
  const passo = (t: number) => {
    const k = Math.min(1, (t - ini) / 220);
    a.volume = v0 * (1 - k);
    if (k < 1) fade = requestAnimationFrame(passo);
    else {
      a.pause();
      a.volume = VOLUME_CRY;
      if (atual === a) atual = null;
    }
  };
  fade = requestAnimationFrame(passo);
}
