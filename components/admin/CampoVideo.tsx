'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Eye } from 'lucide-react';
import { normalizarVideo } from '@/lib/video';
import { EscolherDoPanda } from './EscolherDoPanda';

/**
 * O campo do vídeo da aula.
 *
 * Aceita o link de onde a aula estiver: Panda, YouTube, Vimeo, Drive, Loom.
 * Você cola o endereço que copiou da barra do navegador e ele mostra na hora
 * de onde é, converte para o formato do player, e avisa quando a hospedagem
 * não protege o conteúdo.
 */
export function CampoVideo({
  valor,
  aoMudar,
  aoEscolherDoPanda,
}: {
  valor: string;
  aoMudar: (novo: string) => void;
  aoEscolherDoPanda: (e: { video_url: string; thumbnail_url: string; duracao_minutos: string; titulo: string }) => void;
}) {
  const [verPreview, setVerPreview] = useState(false);
  const info = useMemo(() => normalizarVideo(valor), [valor]);

  return (
    <div className="space-y-2.5">
      <div>
        <label className="etiqueta mb-1.5 block">Vídeo da aula</label>
        <input
          className="campo"
          placeholder="cole o link do vídeo (Panda, YouTube, Vimeo, Drive, Loom...)"
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
        />
      </div>

      {valor.trim() && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: 'var(--superficie-2)', color: 'var(--acento)' }}
            >
              <CheckCircle2 className="h-3 w-3" /> {info.nomeDaFonte}
            </span>

            {!info.jaEraEmbed && info.embed !== valor.trim() && (
              <span className="text-[11px]" style={{ color: 'var(--texto-fraco)' }}>
                convertido para o formato do player
              </span>
            )}

            <button
              type="button"
              onClick={() => setVerPreview((v) => !v)}
              className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-suave hover:text-texto"
            >
              <Eye className="h-3 w-3" /> {verPreview ? 'esconder' : 'testar aqui'}
            </button>
          </div>

          {info.aviso && (
            <p
              className="flex items-start gap-2 rounded-lg p-2.5 text-[11.5px] leading-relaxed"
              style={{ background: 'rgba(229,165,75,.08)', color: 'var(--suave)' }}
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: 'var(--acento)' }} />
              {info.aviso}
            </p>
          )}

          {verPreview && info.embed && (
            <div className="overflow-hidden rounded-lg bg-black" style={{ aspectRatio: '16 / 9' }}>
              <iframe
                src={info.embed}
                className="h-full w-full border-0"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          )}
        </div>
      )}

      <div className="pt-0.5">
        <EscolherDoPanda aoEscolher={aoEscolherDoPanda} />
      </div>
    </div>
  );
}
