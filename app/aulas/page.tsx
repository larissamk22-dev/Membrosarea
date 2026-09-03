import Link from 'next/link';
import { Lock, ArrowRight } from 'lucide-react';
import { exigirAluna } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Topbar } from '@/components/Topbar';
import { CardAula } from '@/components/CardAula';
import { Miniatura } from '@/components/Miniatura';
import { BarraProgresso } from '@/components/BarraProgresso';
import { duracao } from '@/lib/formato';
import { COLUNAS_AULA, type Aula, type Modulo } from '@/lib/tipos';

export const dynamic = 'force-dynamic';

export default async function AulasPage() {
  const { nome, aluna } = await exigirAluna();
  const supabase = createClient();

  // Os três dados da tela. Repare que nenhuma consulta filtra por permissão:
  // quem faz isso é a RLS, lá no banco. Se a aluna não pode ver, não vem.
  const [{ data: modulos }, { data: aulas }, { data: progresso }] = await Promise.all([
    supabase.from('modulos').select('*').order('numero'),
    supabase.from('aulas').select(COLUNAS_AULA).order('ordem'),
    supabase.from('progresso').select('aula_id, concluida').eq('aluna_id', aluna.id),
  ]);

  const feitas = new Set(
    (progresso ?? []).filter((p) => p.concluida).map((p) => p.aula_id as string)
  );
  const todas = (aulas ?? []) as Aula[];
  const disponiveis = todas.filter((a) => a.liberado);

  // "Continuar de onde parei": a primeira aula liberada que ela ainda não
  // concluiu. Simples assim — e é a coisa mais útil da tela inteira.
  const proxima = disponiveis.find((a) => !feitas.has(a.id));

  const primeiroNome = nome.split(' ')[0];

  return (
    <>
      <Topbar nome={nome} />

      <main className="mx-auto max-w-6xl px-5 pb-24 pt-9">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Olá, {primeiroNome}</h1>
            <p className="mt-1 text-sm text-suave">
              {feitas.size === 0
                ? 'Sua primeira aula está logo abaixo.'
                : `Você já concluiu ${feitas.size} de ${disponiveis.length} aulas disponíveis.`}
            </p>
          </div>
          <div className="w-full max-w-[240px]">
            <BarraProgresso feitas={feitas.size} total={disponiveis.length} />
          </div>
        </div>

        {/* Continuar de onde parei */}
        {proxima && (
          <Link
            href={`/aulas/${proxima.id}`}
            className="cartao group mt-8 flex flex-col gap-5 p-5 transition hover:border-white/20 sm:flex-row sm:items-center"
            style={{ background: 'var(--superficie-2)' }}
          >
            <div className="w-full shrink-0 sm:w-56">
              <Miniatura
                titulo={proxima.titulo}
                url={proxima.thumbnail_url}
                estado="disponivel"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="etiqueta" style={{ color: 'var(--acento)' }}>
                {feitas.size === 0 ? 'Comece por aqui' : 'Continuar de onde parei'}
              </span>
              <h2 className="mt-2 font-display text-xl font-bold leading-snug">{proxima.titulo}</h2>
              {proxima.descricao && (
                <p className="mt-1.5 line-clamp-2 text-sm text-suave">{proxima.descricao}</p>
              )}
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--acento)' }}>
                Assistir {duracao(proxima.duracao_segundos) && `· ${duracao(proxima.duracao_segundos)}`}
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        )}

        {/* Os módulos */}
        <div className="mt-12 space-y-12">
          {(modulos ?? []).map((modulo: Modulo) => {
            const futuro = modulo.numero > aluna.modulo_atual;
            const doModulo = todas.filter((a) => a.modulo_id === modulo.id);
            const abertasNoModulo = doModulo.filter((a) => a.liberado);
            const feitasNoModulo = abertasNoModulo.filter((a) => feitas.has(a.id)).length;

            return (
              <section key={modulo.id}>
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <span className="etiqueta">Módulo {modulo.numero}</span>
                    <h2 className="mt-1 font-display text-xl font-bold">{modulo.titulo}</h2>
                  </div>
                  {!futuro && abertasNoModulo.length > 0 && (
                    <div className="w-full max-w-[200px]">
                      <BarraProgresso feitas={feitasNoModulo} total={abertasNoModulo.length} />
                    </div>
                  )}
                </div>

                {futuro ? (
                  /* Módulo que ainda não abriu. Não listamos os títulos das
                     aulas: mostrar o que ela ainda não pode ver é spoiler —
                     e entrega o seu conteúdo para quem cancelar antes. */
                  <div
                    className="cartao flex flex-col items-center justify-center px-6 py-12 text-center"
                    style={{ borderStyle: 'dashed' }}
                  >
                    <Lock className="h-5 w-5" style={{ color: 'var(--texto-fraco)' }} />
                    <p className="mt-3 max-w-xs text-sm text-suave">
                      Este módulo abre quando você concluir o anterior.
                    </p>
                  </div>
                ) : doModulo.length === 0 ? (
                  <div className="cartao px-6 py-10 text-center text-sm text-suave" style={{ borderStyle: 'dashed' }}>
                    As aulas deste módulo aparecem aqui assim que forem publicadas.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
                    {doModulo.map((aula, i) => (
                      <CardAula
                        key={aula.id}
                        aula={aula}
                        numero={i + 1}
                        concluida={feitas.has(aula.id)}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
}
