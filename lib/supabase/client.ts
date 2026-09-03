import { createBrowserClient } from '@supabase/ssr';

// Cliente que roda NO NAVEGADOR.
// Ele usa a chave anon, que é pública de propósito: quem protege os dados
// não é o segredo da chave, é a RLS lá no banco.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
