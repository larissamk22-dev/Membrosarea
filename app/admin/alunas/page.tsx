import { servicoDoAdmin, faltaChaveDeServico } from '@/lib/api';
import { GerenciadorAlunas } from '@/components/admin/GerenciadorAlunas';

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

export default async function AdminAlunasPage() {
  if (faltaChaveDeServico()) return <AvisoChaveFaltando />;

  const servico = await servicoDoAdmin();
  const { data: alunas } = await servico
    .from('alunas')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <>
      <h1 className="font-display text-2xl font-bold">Alunas</h1>
      <p className="mt-1 max-w-xl text-sm text-suave">
        Ao cadastrar, aparece um link de acesso para você enviar a ela — por WhatsApp, e-mail,
        onde ela realmente lê. É ela quem cria a própria senha; você nunca digita senha por
        ninguém.
      </p>
      <GerenciadorAlunas alunasIniciais={alunas ?? []} />
    </>
  );
}
