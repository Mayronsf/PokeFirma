import { useEffect, useState } from 'react';
import { config } from '../config';

export interface ServerStatus {
  estado: 'sem-ip' | 'carregando' | 'online' | 'offline' | 'erro';
  online?: number;
  max?: number;
  versao?: string;
}

let shared: ServerStatus = { estado: config.servidor.ip ? 'carregando' : 'sem-ip' };
const listeners = new Set<(s: ServerStatus) => void>();
let timer: number | undefined;

async function poll() {
  const ip = config.servidor.ip;
  if (!ip) return;
  try {
    const r = await fetch(config.servidor.statusApi.replace('{ip}', encodeURIComponent(ip)));
    const j = await r.json();
    shared = j.online
      ? { estado: 'online', online: j.players?.online ?? 0, max: j.players?.max ?? config.servidor.limiteJogadores ?? undefined, versao: j.version }
      : { estado: 'offline' };
  } catch {
    shared = { estado: 'erro' };
  }
  listeners.forEach((l) => l(shared));
}

/** Status do servidor compartilhado entre componentes, atualizado a cada N segundos. */
export function useServerStatus(): ServerStatus {
  const [s, set] = useState(shared);
  useEffect(() => {
    listeners.add(set);
    if (config.servidor.ip && listeners.size === 1) {
      poll();
      timer = window.setInterval(poll, config.servidor.atualizarCadaSegundos * 1000);
    }
    return () => {
      listeners.delete(set);
      if (!listeners.size && timer) {
        clearInterval(timer);
        timer = undefined;
      }
    };
  }, []);
  return s;
}
