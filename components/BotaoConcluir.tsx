'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function BotaoConcluir({
  alunaId,
  aulaId,
  concluida,
}: {
  alunaId: string;
  aulaId: string;
  concluida: boolean;
}) {
  const router = useRouter();
  const [feita, setFeita] = useState(concluida);
  const [salvando, setSalvando] = useState(false);

  async function alternar() {
    setSalvando(true);
    const novo = !feita;
    // A RLS de progresso já garante que ninguém marque a aula de outra pessoa:
    // mesmo que alguém troque o alunaId aqui, o banco recusa a escrita.
    const { error } = await createClient()
      .from('progresso')
      .upsert(
        { aluna_id: alunaId, aula_id: aulaId, concluida: novo, atualizado_em: new Date().toISOString() },
        { onConflict: 'aluna_id,aula_id' }
      );
    setSalvando(false);
    if (!error) {
      setFeita(novo);
      router.refresh();
    }
  }

  return (
    <button onClick={alternar} disabled={salvando} className={feita ? 'botao-fantasma' : 'botao'}>
      <Check className="h-4 w-4" strokeWidth={2.5} />
      {salvando ? 'salvando...' : feita ? 'Concluída' : 'Marcar como concluída'}
    </button>
  );
}
