import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { exigirAluna } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Topbar } from '@/components/Topbar';
import { BotaoConcluir } from '@/components/BotaoConcluir';
import { PlayerAula } from '@/components/PlayerAula';
import { duracao } from '@/lib/formato';
import { normalizarVideo } from '@/lib/video';
import { COLUNAS_AULA, type Aula } from '@/lib/tipos';

export const dynamic = 'force-dynamic';

/**
 * O link do vídeo não pode ser lido pelo navegador (ver migration 004).
 * Quem busca é o servidor, com a chave de serviço — e só depois de a página
 * já ter confirmado que esta aula está liberada para esta aluna.
 *
 * Esta chave NUNCA aparece em arquivo com 'use client'.
 */
async function linkDoVideo(aulaId: string): Promise<string | null> {
  const servico = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { data } = await servico.from('aulas').select('video_url').eq('id', aulaId).maybeSingle();
  return data?.video_url ?? null;
}

export default async function AulaPage({ params }: { params: { id: string } }) {
  const { nome, aluna } = await exigirAluna();
  const supabase = createClient();

  // 1. A RLS já barra aula de módulo que não abriu para ela: se não vier
  //    nada, é porque ela não tem acesso — não porque a aula não existe.
  const { data: aula } = await supabase
    .from('aulas')
    .select(COLUNAS_AULA)
    .eq('id', params.id)
    .maybeSingle();
  if (!aula) redirect('/aulas');

  // 2. Confere o cadeado AQUI TAMBÉM, no servidor. Nunca confie em ter
  //    escondido o card na tela anterior: a barra de endereço é editável.
  if (!aula.liberado) redirect('/aulas');

  // 3. Só agora o link do vídeo. Passa pela normalização para funcionar
  //    com vídeo de qualquer fonte — se alguém salvou o endereço da página
  //    do YouTube em vez do link de incorporar, converte aqui.
  const bruto = await linkDoVideo(aula.id);
  const normalizado = bruto ? normalizarVideo(bruto) : null;
  const video = normalizado?.embed || null;

  // Aulas vizinhas, para o "anterior / próxima"
  const { data: irmas } = await supabase
    .from('aulas')
    .select(COLUNAS_AULA)
    .eq('modulo_id', aula.modulo_id)
    .order('ordem');
  const lista = ((irmas ?? []) as Aula[]).filter((a) => a.liberado);
  const i = lista.findIndex((a) => a.id === aula.id);
  const anterior = i > 0 ? lista[i - 1] : null;
  const proxima = i >= 0 && i < lista.length - 1 ? lista[i + 1] : null;

  const { data: prog } = await supabase
    .from('progresso')
    .select('concluida')
    .eq('aluna_id', aluna.id)
    .eq('aula_id', aula.id)
    .maybeSingle();

  return (
    <>
      <Topbar nome={nome} />

      <main className="mx-auto max-w-4xl px-5 pb-24 pt-6">
        <Link href="/aulas" className="inline-flex items-center gap-1.5 text-sm text-suave hover:text-texto">
          <ArrowLeft className="h-3.5 w-3.5" /> todas as aulas
        </Link>

        {/* O player, com a capa da aula na frente enquanto ninguém clica */}
        {video ? (
          <PlayerAula
            embed={video}
            fonte={normalizado!.fonte}
            capa={aula.thumbnail_url}
            titulo={aula.titulo}
          />
        ) : (
          <div
            className="mt-5 flex items-center justify-center overflow-hidden rounded-2xl bg-black px-6 text-center text-sm text-suave"
            style={{ aspectRatio: '16 / 9' }}
          >
            Esta aula ainda não tem gravação publicada.
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold leading-snug">{aula.titulo}</h1>
            {duracao(aula.duracao_segundos) && (
              <p className="mt-1 text-sm" style={{ color: 'var(--texto-fraco)' }}>
                {duracao(aula.duracao_segundos)}
              </p>
            )}
          </div>
          <BotaoConcluir alunaId={aluna.id} aulaId={aula.id} concluida={Boolean(prog?.concluida)} />
        </div>

        {aula.descricao && (
          <p className="mt-5 max-w-2xl leading-relaxed text-suave">{aula.descricao}</p>
        )}

        {/* Navegação entre aulas do módulo */}
        {(anterior || proxima) && (
          <nav className="mt-10 flex items-center justify-between gap-4 border-t pt-6" style={{ borderColor: 'var(--linha)' }}>
            {anterior ? (
              <Link href={`/aulas/${anterior.id}`} className="group flex min-w-0 items-center gap-2 text-sm text-suave hover:text-texto">
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span className="truncate">{anterior.titulo}</span>
              </Link>
            ) : (
              <span />
            )}
            {proxima && (
              <Link href={`/aulas/${proxima.id}`} className="group flex min-w-0 items-center gap-2 text-right text-sm text-suave hover:text-texto">
                <span className="truncate">{proxima.titulo}</span>
                <ChevronRight className="h-4 w-4 shrink-0" />
              </Link>
            )}
          </nav>
        )}
      </main>
    </>
  );
}
