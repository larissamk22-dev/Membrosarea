'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import type { Fonte } from '@/lib/video';

/**
 * O player da aula, com a capa na frente.
 *
 * Enquanto a aluna não clica, ela vê a SUA capa — não o quadro que a
 * hospedagem escolheu. O iframe só entra na página depois do clique, e isso
 * traz dois ganhos de brinde: a página abre mais leve, e a hospedagem só
 * conta visualização quando alguém realmente assistiu.
 *
 * Sem capa cadastrada, o comportamento é o de antes: o player carrega direto.
 */
export function PlayerAula({
  embed,
  fonte,
  capa,
  titulo,
}: {
  embed: string;
  fonte: Fonte;
  capa: string | null;
  titulo: string;
}) {
  const [tocando, setTocando] = useState(!capa);

  // Cada hospedagem tem o seu jeito de dizer "já começa tocando". Sem isso a
  // aluna clicaria duas vezes: uma na capa e outra no play do player.
  function comAutoplay(url: string) {
    const juncao = url.includes('?') ? '&' : '?';
    if (fonte === 'panda') return `${url}${juncao}autoplay=true`;
    if (fonte === 'youtube' || fonte === 'vimeo') return `${url}${juncao}autoplay=1`;
    return url;
  }

  return (
    <div className="relative mt-5 overflow-hidden rounded-2xl bg-black" style={{ aspectRatio: '16 / 9' }}>
      {tocando ? (
        <iframe
          src={capa ? comAutoplay(embed) : embed}
          title={titulo}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setTocando(true)}
          className="group absolute inset-0 h-full w-full"
          aria-label={`Assistir ${titulo}`}
        >
          <img src={capa!} alt="" className="h-full w-full object-cover" />
          <span className="absolute inset-0 bg-black/20 transition group-hover:bg-black/10" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition group-hover:scale-105"
              style={{ background: 'var(--acento)' }}
            >
              <Play className="ml-1 h-6 w-6 fill-current" style={{ color: '#1A1206' }} />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
