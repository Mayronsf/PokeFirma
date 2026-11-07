/**
 * Paisagens em pixel desenhadas no navegador, usadas enquanto não houver prints reais
 * do mundo (config.imagens). Determinísticas (seed fixa) e geradas uma vez por sessão.
 */

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const memo = new Map<string, string>();

/** Vista lateral: céu noturno, serras ao fundo, colinas de grama, árvores e água. */
export function sideWorld(): string {
  if (memo.has('side')) return memo.get('side')!;
  if (typeof document === 'undefined') return '';
  const W = 256, H = 112;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  const r = rng(7);

  // céu em faixas
  const sky = ['#0e1a22', '#112029', '#142632', '#182d39', '#1c3541'];
  sky.forEach((col, i) => {
    g.fillStyle = col;
    g.fillRect(0, i * 10, W, 10);
  });
  g.fillStyle = '#1c3541';
  g.fillRect(0, 50, W, H);
  // estrelas
  for (let i = 0; i < 40; i++) {
    g.fillStyle = r() > 0.7 ? '#cfe3d8' : '#6f8f8a';
    g.fillRect(Math.floor(r() * W), Math.floor(r() * 36), 1, 1);
  }
  // lua quadrada
  g.fillStyle = '#e9efd9';
  g.fillRect(196, 10, 8, 8);
  g.fillStyle = '#c9d3b6';
  g.fillRect(198, 12, 2, 2);
  g.fillRect(201, 15, 2, 1);

  const ridge = (base: number, amp: number, step: number, color: string, seed: number) => {
    const rr = rng(seed);
    let h = base;
    g.fillStyle = color;
    for (let x = 0; x < W; x += step) {
      h += Math.round((rr() - 0.5) * amp);
      h = Math.max(base - amp * 2, Math.min(base + amp, h));
      g.fillRect(x, h, step, H - h);
    }
  };
  ridge(46, 6, 4, '#1a2f2c', 3);
  ridge(58, 5, 3, '#1d3a2a', 11);

  // colinas de grama com terra
  const heights: number[] = [];
  let h = 74;
  for (let x = 0; x < W; x += 2) {
    h += Math.round((r() - 0.5) * 3);
    h = Math.max(66, Math.min(84, h));
    heights.push(h);
  }
  heights.forEach((hy, i) => {
    const x = i * 2;
    g.fillStyle = '#4f2f1c';
    g.fillRect(x, hy + 2, 2, H - hy);
    g.fillStyle = '#5c3a22';
    for (let y = hy + 3; y < H; y += 3) if (r() > 0.6) g.fillRect(x + (r() > 0.5 ? 1 : 0), y, 1, 1);
    g.fillStyle = '#3f8a2a';
    g.fillRect(x, hy, 2, 2);
    g.fillStyle = '#5aa83a';
    if (r() > 0.5) g.fillRect(x, hy, 1, 1);
    // pedra mais funda
    g.fillStyle = '#3d3f3e';
    g.fillRect(x, hy + 14 + Math.floor(r() * 3), 2, H);
  });

  // água
  g.fillStyle = '#1f4f7a';
  g.fillRect(96, 80, 38, H);
  g.fillStyle = '#2b649a';
  for (let x = 96; x < 134; x += 4) g.fillRect(x, 80, 2, 1);

  // árvores
  const tree = (x: number, base: number, tall: number) => {
    g.fillStyle = '#5b3f22';
    g.fillRect(x, base - tall, 2, tall);
    g.fillStyle = '#245d1c';
    g.fillRect(x - 4, base - tall - 4, 10, 5);
    g.fillRect(x - 2, base - tall - 7, 6, 3);
    g.fillStyle = '#2f7424';
    g.fillRect(x - 3, base - tall - 4, 3, 2);
    g.fillRect(x + 2, base - tall - 6, 2, 2);
  };
  [14, 34, 52, 150, 170, 214, 238].forEach((x) => {
    const hy = heights[Math.floor(x / 2)] ?? 74;
    tree(x, hy, 6 + Math.floor(r() * 4));
  });

  // uma torre (ginásio) de blocos
  const tx = 186, ty = heights[93] ?? 74;
  g.fillStyle = '#6f6a62';
  g.fillRect(tx, ty - 18, 12, 18);
  g.fillStyle = '#8a8478';
  g.fillRect(tx - 2, ty - 20, 16, 3);
  g.fillStyle = '#e8b54a';
  g.fillRect(tx + 3, ty - 13, 2, 3);
  g.fillRect(tx + 7, ty - 13, 2, 3);
  g.fillRect(tx + 5, ty - 6, 2, 6);

  const url = c.toDataURL('image/png');
  memo.set('side', url);
  return url;
}

/** Vista de cima: campo de grama com flores, grama alta e caminho de terra. Ladrilhável. */
export function grassField(): string {
  if (memo.has('grass')) return memo.get('grass')!;
  if (typeof document === 'undefined') return '';
  const S = 128;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const g = c.getContext('2d')!;
  const r = rng(42);
  const greens = ['#4f9a32', '#58a63a', '#4a9030', '#5fae40', '#478a2c'];
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      g.fillStyle = greens[Math.floor(r() * greens.length)];
      g.fillRect(x, y, 1, 1);
    }
  // bordas sutis dos blocos 16×16
  g.fillStyle = 'rgba(0,0,0,0.06)';
  for (let i = 0; i < S; i += 16) {
    g.fillRect(i, 0, 1, S);
    g.fillRect(0, i, S, 1);
  }
  // caminho de terra
  g.fillStyle = '#8b6a3e';
  for (let y = 0; y < S; y++) {
    const x0 = 84 + Math.round(Math.sin(y / 14) * 6);
    for (let x = x0; x < x0 + 10; x++) {
      g.fillStyle = r() > 0.5 ? '#8b6a3e' : '#7a5c35';
      g.fillRect(x, y, 1, 1);
    }
  }
  // grama alta e flores
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(r() * S), y = Math.floor(r() * S);
    if (x > 80 && x < 98) continue;
    g.fillStyle = '#3a7a24';
    g.fillRect(x, y, 1, 2);
    g.fillRect(x + 2, y + 1, 1, 2);
  }
  const flowers = ['#e04a3a', '#f2d24a', '#f4f0e6', '#7aa2e8'];
  for (let i = 0; i < 22; i++) {
    const x = Math.floor(r() * S), y = Math.floor(r() * S);
    if (x > 80 && x < 98) continue;
    g.fillStyle = flowers[i % flowers.length];
    g.fillRect(x, y, 2, 2);
    g.fillStyle = '#2f6a1e';
    g.fillRect(x, y + 2, 1, 1);
  }
  const url = c.toDataURL('image/png');
  memo.set('grass', url);
  return url;
}
