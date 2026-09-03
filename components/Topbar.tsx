'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function Topbar({ nome, admin = false }: { nome: string; admin?: boolean }) {
  const router = useRouter();

  async function sair() {
    await createClient().auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header
      className="sticky top-0 z-20 border-b backdrop-blur"
      style={{ borderColor: 'var(--linha)', background: 'rgba(19,17,16,.82)' }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <Link href={admin ? '/admin/aulas' : '/aulas'} className="font-display text-lg font-bold">
          Área de Membros
        </Link>

        <div className="flex items-center gap-3">
          {admin && (
            <nav className="hidden items-center gap-1 sm:flex">
              <Link href="/admin/aulas" className="rounded-full px-3 py-1.5 text-sm text-suave hover:text-texto">
                Aulas
              </Link>
              <Link href="/admin/alunas" className="rounded-full px-3 py-1.5 text-sm text-suave hover:text-texto">
                Alunas
              </Link>
            </nav>
          )}
          <span className="hidden text-sm text-suave sm:inline">{nome}</span>
          <button onClick={sair} className="text-suave transition hover:text-texto" aria-label="Sair">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
