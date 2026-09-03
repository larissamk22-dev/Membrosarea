import { servicoDoAdmin, faltaChaveDeServico } from '@/lib/api';
import { GerenciadorAulas } from '@/components/admin/GerenciadorAulas';

export const dynamic = 'force-dynamic';


function AvisoChaveFaltando() {
  return (
    <div className="cartao mt-6 p-6" style={{ borderColor: 'var(--acento)' }}>
      <p className="font-display text-lg font-bold" style={{ color: 'var(--acento)' }}>
        Falta a chave de serviço
      </p>
      <p className="mt-2 max-w-xl text-sm text-suave">
        O painel precisa da <code>SUPABASE_SERVICE_ROLE_KEY</code> no arquivo{' '}
        <code>.env.local</code> para funcionar. Pegue ela no Supabase em{' '}
        <strong>Project Settings → API → service_role</strong> (clique em <em>Reveal</em>), cole no
        arquivo e reinicie o <code>npm run dev</code> — chave nova só vale depois de reiniciar.
      </p>
      <p className="mt-3 text-xs" style={{ color: 'var(--texto-fraco)' }}>
        A área da aluna funciona sem ela. Só o painel precisa, porque é ele que cria login e lê o
        link do vídeo.
      </p>
    </div>
  );
}

export default async function AdminAulasPage() {
  if (faltaChaveDeServico()) return <AvisoChaveFaltando />;

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
