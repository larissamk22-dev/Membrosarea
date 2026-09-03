import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';
import type { Aluna } from './tipos';

export type Sessao =
  | { tipo: 'admin'; userId: string; email: string; nome: string }
  | { tipo: 'aluna'; userId: string; email: string; nome: string; aluna: Aluna };

/**
 * O coração do sistema.
 *
 * Uma tela de login só. Depois que a pessoa entra, é AQUI que o sistema
 * pergunta ao banco quem ela é — nesta ordem — e decide o que ela pode ver.
 *
 * Repare no que esta função NÃO faz: ela não olha nada que veio do
 * navegador. Nem parâmetro na URL, nem campo de formulário, nem cookie
 * inventado por nós. Só o que está gravado no banco.
 *
 * O cache() do React faz a consulta rodar uma vez por requisição, mesmo
 * que várias partes da página peçam a sessão.
 */
export const getSessao = cache(async (): Promise<Sessao> => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Nem entrou.
  if (!user) redirect('/login');

  // 2. É a dona?
  const { data: admin } = await supabase
    .from('admins')
    .select('user_id, nome')
    .eq('user_id', user.id)
    .maybeSingle();

  if (admin) {
    return {
      tipo: 'admin',
      userId: user.id,
      email: user.email ?? '',
      nome: admin.nome ?? 'Administradora',
    };
  }

  // 3. É aluna com matrícula ativa?
  const { data: aluna } = await supabase
    .from('alunas')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (aluna && aluna.status === 'ativa') {
    return {
      tipo: 'aluna',
      userId: user.id,
      email: user.email ?? '',
      nome: aluna.nome,
      aluna: aluna as Aluna,
    };
  }

  // 4. Autenticou, mas não está em lugar nenhum (ou a matrícula não está
  //    ativa). A porta fecha por padrão — este é o comportamento correto.
  redirect('/login?erro=sem-acesso');
});

/** Usada nas páginas de /admin: exige que seja a dona. */
export async function exigirAdmin() {
  const sessao = await getSessao();
  if (sessao.tipo !== 'admin') redirect('/aulas');
  return sessao;
}

/** Usada nas páginas da área da aluna. */
export async function exigirAluna() {
  const sessao = await getSessao();
  if (sessao.tipo !== 'aluna') redirect('/admin/aulas');
  return sessao;
}
