'use client';

import { useRef, useState } from 'react';
import { AlertTriangle, ImageOff, ImagePlus, Loader2, Trash2 } from 'lucide-react';

/**
 * A capa da aula.
 *
 * Duas formas de preencher, porque as duas acontecem na vida real:
 *   - subir um PNG/JPG do seu computador (a sua arte, com a sua marca);
 *   - colar um link, que é o que o Panda preenche sozinho quando você
 *     escolhe o vídeo pela biblioteca.
 *
 * A prévia existe para você ver a imagem ANTES de salvar a aula. Capa errada
 * só aparece na tela da aluna, e é o tipo de erro que ninguém percebe sozinho.
 */
export function CampoCapa({
  valor,
  aoMudar,
}: {
  valor: string;
  aoMudar: (url: string) => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function enviar(arquivo: File) {
    setErro(null);
    setEnviando(true);
    try {
      const corpo = new FormData();
      corpo.append('arquivo', arquivo);
      const r = await fetch('/api/admin/capa', { method: 'POST', body: corpo });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro ?? 'Não consegui enviar a imagem.');
      aoMudar(j.url);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não consegui enviar a imagem.');
    } finally {
      setEnviando(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div>
      <label className="etiqueta mb-1.5 block">Imagem de capa</label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {/* Prévia, no mesmo formato do card da aluna */}
        <div
          className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl sm:w-52"
          style={{
            background: 'var(--fundo)',
            border: valor ? '1px solid var(--linha)' : '1px dashed var(--linha)',
          }}
        >
          {valor ? (
            <img src={valor} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-xs text-suave">
              <ImageOff className="h-4 w-4 opacity-50" />
              sem capa
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="botao-fantasma !px-3.5 !py-1.5 !text-xs inline-flex items-center gap-1.5"
              disabled={enviando}
              onClick={() => input.current?.click()}
            >
              {enviando ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> enviando…
                </>
              ) : (
                <>
                  <ImagePlus className="h-3.5 w-3.5" /> {valor ? 'trocar imagem' : 'enviar imagem'}
                </>
              )}
            </button>

            {valor && !enviando && (
              <button
                type="button"
                className="botao-fantasma !px-3.5 !py-1.5 !text-xs inline-flex items-center gap-1.5"
                onClick={() => aoMudar('')}
              >
                <Trash2 className="h-3.5 w-3.5" /> tirar
              </button>
            )}
          </div>

          <input
            ref={input}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const a = e.target.files?.[0];
              if (a) enviar(a);
            }}
          />

          <input
            className="campo"
            placeholder="ou cole o link de uma imagem"
            value={valor}
            onChange={(e) => aoMudar(e.target.value)}
          />

          <p className="text-xs text-suave">
            PNG, JPG ou WEBP, até 4 MB. O formato que fica bonito no card é o de vídeo
            (16:9) — 1280×720 é uma medida segura.
          </p>

          {erro && (
            <p
              className="flex items-start gap-2 rounded-lg p-2.5 text-[11.5px] leading-relaxed"
              style={{ background: 'rgba(229,165,75,.08)', color: 'var(--suave)' }}
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: 'var(--acento)' }} />
              {erro}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
