import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient } from './supabase/server';

/**
 * Porteiro das rotas de API do painel.
 *
 * Toda rota administrativa começa por aqui. Ela confere no BANCO que quem
 * está pedindo é admin — usando a sessão real da pessoa, não um cabeçalho
 * ou um parâmetro que o navegador possa inventar.
 *
 * Devolve o cliente com chave de serviço só se a checagem passar.
 */
export async function exigirAdminApi() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: 'Não autenticado', status: 401 as const, servico: null };

  const { data: admin } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!admin) return { erro: 'Sem permissão', status: 403 as const, servico: null };

  const servico = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  return { erro: null, status: 200 as const, servico };
}

/** Senha temporária só para criar a conta. A aluna define a dela pelo e-mail. */
export function senhaTemporaria() {
  return `tmp-${crypto.randomUUID()}`;
}

/**
 * Versão para PÁGINAS do painel (não rotas de API).
 *
 * Precisa existir porque a coluna video_url foi trancada para todo mundo
 * (migration 004) — inclusive para você. O painel lê pelo servidor, com a
 * chave de serviço, depois de a página já ter conferido que você é admin.
 */
export function faltaChaveDeServico() {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return !k || k.trim() === '' || k.includes('COLE');
}

export async function servicoDoAdmin() {
  const { exigirAdmin } = await import('./auth');
  await exigirAdmin();
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
