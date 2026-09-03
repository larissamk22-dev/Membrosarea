import { servicoDoAdmin } from '@/lib/api';
import { GerenciadorAlunas } from '@/components/admin/GerenciadorAlunas';

export const dynamic = 'force-dynamic';

export default async function AdminAlunasPage() {
  const servico = await servicoDoAdmin();
  const { data: alunas } = await servico
    .from('alunas')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <>
      <h1 className="font-display text-2xl font-bold">Alunas</h1>
      <p className="mt-1 max-w-xl text-sm text-suave">
        Ao cadastrar, a pessoa recebe um e-mail para criar a própria senha. Você nunca digita
        senha por ela.
      </p>
      <GerenciadorAlunas alunasIniciais={alunas ?? []} />
    </>
  );
}
