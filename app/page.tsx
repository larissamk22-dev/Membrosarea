import { redirect } from 'next/navigation';
import { getSessao } from '@/lib/auth';

// A raiz do site não tem tela própria: ela só pergunta quem é você e
// te manda para o lugar certo. Uma porta, dois destinos.
export default async function Home() {
  const sessao = await getSessao();
  redirect(sessao.tipo === 'admin' ? '/admin/aulas' : '/aulas');
}
