'use client';

import { useState } from 'react';
import { Check, Copy, Link2 } from 'lucide-react';

/**
 * O link que a aluna usa para criar a senha dela.
 *
 * Por que isto aparece na tela em vez de virar e-mail: a função do Supabase
 * que gera este link não envia e-mail nenhum — ela devolve o link para quem
 * chamou. Mostrar aqui é o caminho honesto, e tem uma vantagem prática:
 * você manda por onde a sua aluna realmente lê.
 */
export function LinkDeConvite({ nome, link }: { nome: string; link: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Navegador que bloqueia a área de transferência: o link está à vista,
      // dá para selecionar e copiar na mão.
    }
  }

  const mensagem =
    `Oi, ${nome.split(' ')[0]}! Seu acesso está liberado. ` +
    `Clique aqui para criar sua senha e entrar: ${link}`;

  async function copiarMensagem() {
    try {
      await navigator.clipboard.writeText(mensagem);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {}
  }

  return (
    <div
      className="cartao space-y-2.5 p-3.5"
      style={{ background: 'rgba(229,165,75,.07)', borderColor: 'var(--acento)' }}
    >
      <p className="flex items-center gap-2 text-xs font-semibold">
        <Link2 className="h-3.5 w-3.5" style={{ color: 'var(--acento)' }} />
        Link de acesso de {nome}
      </p>

      <p
        className="break-all rounded-lg p-2.5 text-[11px] leading-relaxed"
        style={{ background: 'var(--fundo)', color: 'var(--texto-suave)' }}
      >
        {link}
      </p>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={copiar} className="botao-fantasma !px-3.5 !py-1.5 !text-xs">
          {copiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copiado ? 'copiado' : 'copiar link'}
        </button>
        <button type="button" onClick={copiarMensagem} className="botao-fantasma !px-3.5 !py-1.5 !text-xs">
          <Copy className="h-3.5 w-3.5" /> copiar mensagem pronta
        </button>
      </div>

      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--texto-fraco)' }}>
        Mande por WhatsApp ou e-mail. Ao clicar, ela cria a própria senha e entra direto.
        O link vale por tempo limitado e some depois de usado — se ela demorar, gere outro
        no botão “link de acesso” ao lado do nome dela.
      </p>
    </div>
  );
}
