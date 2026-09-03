'use client';

import { useEffect, useState } from 'react';
import { Film, Loader2, Check } from 'lucide-react';
import { duracao } from '@/lib/formato';

interface VideoPanda {
  id: string;
  titulo: string;
  player: string;
  capa: string;
  duracao_segundos: number | null;
  pronto: boolean;
  status: string;
}

export interface EscolhaPanda {
  video_url: string;
  thumbnail_url: string;
  duracao_minutos: string;
  titulo: string;
}

/**
 * Em vez de copiar e colar dois links do painel do Panda, você escolhe o
 * vídeo numa lista. O sistema preenche o player, a capa e a duração sozinho.
 */
export function EscolherDoPanda({ aoEscolher }: { aoEscolher: (e: EscolhaPanda) => void }) {
  const [aberto, setAberto] = useState(false);
  const [videos, setVideos] = useState<VideoPanda[] | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [escolhido, setEscolhido] = useState<string | null>(null);

  useEffect(() => {
    if (!aberto || videos) return;
    fetch('/api/admin/panda')
      .then((r) => r.json())
      .then((d) => {
        setVideos(d.videos ?? []);
        setAviso(d.aviso ?? null);
      })
      .catch(() => setAviso('Não consegui carregar a lista agora.'));
  }, [aberto, videos]);

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="botao-fantasma !px-4 !py-2 !text-xs"
      >
        <Film className="h-3.5 w-3.5" /> escolher da minha biblioteca do Panda
      </button>
    );
  }

  return (
    <div className="cartao p-3" style={{ background: 'var(--fundo)' }}>
      <div className="mb-2.5 flex items-center justify-between">
        <span className="etiqueta">Seus vídeos no Panda</span>
        <button type="button" onClick={() => setAberto(false)} className="text-xs text-suave hover:text-texto">
          fechar
        </button>
      </div>

      {aviso && (
        <p className="mb-2 text-xs" style={{ color: 'var(--texto-fraco)' }}>
          {aviso}
        </p>
      )}

      {videos === null ? (
        <p className="flex items-center gap-2 py-4 text-sm text-suave">
          <Loader2 className="h-4 w-4 animate-spin" /> carregando...
        </p>
      ) : videos.length === 0 ? (
        !aviso && <p className="py-4 text-sm text-suave">Nenhum vídeo na conta ainda.</p>
      ) : (
        <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
          {videos.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                disabled={!v.pronto}
                onClick={() => {
                  setEscolhido(v.id);
                  aoEscolher({
                    video_url: v.player,
                    thumbnail_url: v.capa,
                    duracao_minutos: v.duracao_segundos
                      ? String(Math.round(v.duracao_segundos / 60))
                      : '',
                    titulo: v.titulo,
                  });
                }}
                className="flex w-full items-center gap-3 rounded-lg border p-2 text-left transition disabled:opacity-45"
                style={{ borderColor: 'var(--linha)' }}
              >
                {v.capa ? (
                  <img src={v.capa} alt="" className="h-9 w-16 shrink-0 rounded object-cover" />
                ) : (
                  <span className="h-9 w-16 shrink-0 rounded" style={{ background: 'var(--superficie-2)' }} />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold">{v.titulo}</span>
                  <span className="block text-[11px]" style={{ color: 'var(--texto-fraco)' }}>
                    {v.pronto
                      ? duracao(v.duracao_segundos)
                      : `ainda convertendo (${v.status.toLowerCase()})`}
                  </span>
                </span>
                {escolhido === v.id && (
                  <Check className="h-4 w-4 shrink-0" style={{ color: 'var(--feito)' }} strokeWidth={3} />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
