/**
 * Skins do Minecraft.
 * - Por nick: renders prontos do mc-heads.net (cabeça e corpo) e a textura em /skin/{nick}.
 * - Por arquivo (.png 64×64 ou 64×32): a cabeça é recortada da textura num canvas e o corpo
 *   é renderizado em 3D com o skinview3d (carregado só quando necessário).
 */
const clean = (nick: string) => encodeURIComponent((nick || 'MHF_Steve').trim());

export const headUrl = (nick: string, size = 64) => `https://mc-heads.net/avatar/${clean(nick)}/${size}`;
export const bodyUrl = (nick: string, size = 320, facing: 'left' | 'right' = 'right') =>
  `https://mc-heads.net/body/${clean(nick)}/${size}${facing === 'left' ? '/left' : ''}`;
export const textureUrl = (nick: string) => `https://mc-heads.net/skin/${clean(nick)}`;

export const FALLBACK_HEAD =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges"><rect width="8" height="8" fill="#6b4a2f"/><rect y="2" width="8" height="6" fill="#c9926b"/><rect x="1" y="4" width="2" height="1" fill="#fff"/><rect x="5" y="4" width="2" height="1" fill="#fff"/><rect x="2" y="4" width="1" height="1" fill="#3b2a8f"/><rect x="5" y="4" width="1" height="1" fill="#3b2a8f"/><rect x="3" y="6" width="2" height="1" fill="#8a5a3c"/></svg>',
  );

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = () => rej(new Error('Não consegui carregar a skin'));
    img.src = src;
  });
}

const headCache = new Map<string, Promise<string>>();
/** Recorta o rosto (com a camada do chapéu) de uma textura de skin. */
export function headFromTexture(tex: string, size = 64): Promise<string> {
  const key = tex.slice(0, 200) + tex.length + ':' + size;
  if (!headCache.has(key)) {
    headCache.set(
      key,
      loadImage(tex).then((img) => {
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const g = c.getContext('2d')!;
        g.imageSmoothingEnabled = false;
        g.drawImage(img, 8, 8, 8, 8, 0, 0, size, size);
        g.drawImage(img, 40, 8, 8, 8, 0, 0, size, size);
        return c.toDataURL('image/png');
      }),
    );
  }
  return headCache.get(key)!;
}

const bodyCache = new Map<string, Promise<string>>();
/** Render 3D de corpo inteiro (PNG transparente) a partir de uma textura. */
export function bodyFromTexture(tex: string, facing: 'left' | 'right' = 'right', height = 420): Promise<string> {
  const key = tex.slice(0, 200) + tex.length + ':' + facing + ':' + height;
  if (!bodyCache.has(key)) {
    bodyCache.set(
      key,
      (async () => {
        const { SkinViewer } = await import('skinview3d');
        const canvas = document.createElement('canvas');
        const width = Math.round(height * 0.62);
        const viewer = new SkinViewer({ canvas, width, height, preserveDrawingBuffer: true, zoom: 0.92, fov: 30 });
        try {
          await viewer.loadSkin(tex, { model: 'auto-detect' });
          viewer.playerObject.rotation.y = facing === 'right' ? 0.55 : -0.55;
          viewer.playerObject.skin.rightArm.rotation.x = facing === 'right' ? -0.25 : 0.2;
          viewer.playerObject.skin.leftArm.rotation.x = facing === 'right' ? 0.2 : -0.25;
          viewer.render();
          return canvas.toDataURL('image/png');
        } finally {
          viewer.dispose();
        }
      })(),
    );
  }
  return bodyCache.get(key)!;
}

/** Lê um arquivo de skin enviado e devolve a textura como data URL. */
export async function readSkinFile(file: File): Promise<string> {
  if (!/png$/i.test(file.type) && !/\.png$/i.test(file.name)) throw new Error('A skin precisa ser um arquivo .png.');
  if (file.size > 200 * 1024) throw new Error('Arquivo grande demais para uma skin (máx. 200 KB).');
  const data = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(new Error('Não consegui ler o arquivo.'));
    r.readAsDataURL(file);
  });
  const img = await loadImage(data);
  if (img.width !== 64 || (img.height !== 64 && img.height !== 32))
    throw new Error(`A skin precisa ter 64×64 ou 64×32 pixels (esta tem ${img.width}×${img.height}).`);
  return data;
}

/** Membro da Firma exibido no site: nick e, opcionalmente, um arquivo de skin próprio. */
export type Membro = string | { nick: string; skin?: string };
export const membroNick = (m: Membro | undefined, fallback: string) => (typeof m === 'string' ? m : m?.nick) ?? fallback;
export const membroSkin = (m: Membro | undefined) => (typeof m === 'string' ? undefined : m?.skin);
