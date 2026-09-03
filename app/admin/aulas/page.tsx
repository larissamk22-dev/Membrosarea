import { servicoDoAdmin } from '@/lib/api';
import { GerenciadorAulas } from '@/components/admin/GerenciadorAulas';

export const dynamic = 'force-dynamic';

export default async function AdminAulasPage() {
  const servico = await servicoDoAdmin();

  const [{ data: modulos }, { data: aulas }] = await Promise.all([
    servico.from('modulos').select('*').order('numero'),
    servico.from('aulas').select('*').order('ordem'),
  ]);

  return (
    <>
      <h1 className="font-display text-2xl font-bold">Aulas</h1>
      <p className="mt-1 max-w-xl text-sm text-suave">
        Cadastre a aula com o link do player do Panda Video. Enquanto a chavinha estiver
        desligada, a turma vê o cadeado no lugar do vídeo.
      </p>
      <GerenciadorAulas modulos={modulos ?? []} aulasIniciais={aulas ?? []} />
    </>
  );
}
