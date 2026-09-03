import { exigirAdmin } from '@/lib/auth';
import { Topbar } from '@/components/Topbar';

// Todas as páginas do painel passam por aqui. Se não for admin, nem começa
// a desenhar a tela — o redirect acontece no servidor.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { nome } = await exigirAdmin();
  return (
    <>
      <Topbar nome={nome} admin />
      <main className="mx-auto max-w-5xl px-5 pb-24 pt-8">{children}</main>
    </>
  );
}
