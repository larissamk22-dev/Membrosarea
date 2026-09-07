'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Link2, Loader2 } from 'lucide-react';
import type { Aluna } from '@/lib/tipos';
import { LinkDeConvite } from '@/components/admin/LinkDeConvite';

const STATUS: Aluna['status'][] = ['ativa', 'pausada', 'cancelada'];

export function GerenciadorAlunas({ alunasIniciais }: { alunasIniciais: Aluna[] }) {
  const router = useRouter();
  const [alunas, setAlunas] = useState(alunasIniciais);
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [convite, setConvite] = useState<{ nome: string; link: string } | null>(null);
  const [gerando, setGerando] = useState<string | null>(null);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setOcupado(true);
    setAviso(null);
    const r = await fetch('/api/admin/alunas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email }),
    });
    const json = await r.json();
    setOcupado(false);
    if (!r.ok) {
      setAviso(json.erro ?? 'Não consegui cadastrar.');
      return;
    }
    setAlunas((prev) => [json.aluna, ...prev]);
    if (json.convite) setConvite({ nome, link: json.convite });
    else setAviso('Cadastrei a aluna, mas não consegui gerar o link. Use o botão "link de acesso" na linha dela.');
    setNome('');
    setEmail('');
    setCriando(false);
    router.refresh();
  }

  async function gerarConvite(aluna: Aluna) {
    setGerando(aluna.id);
    setAviso(null);
    try {
      const r = await fetch('/api/admin/convite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: aluna.email }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.erro ?? 'Não consegui gerar o link.');
      setConvite({ nome: aluna.nome, link: json.convite });
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'Não consegui gerar o link.');
    } finally {
      setGerando(null);
    }
  }

  async function atualizar(id: string, campos: Partial<Aluna>) {
    setAlunas((prev) => prev.map((a) => (a.id === id ? { ...a, ...campos } : a)));
    const r = await fetch('/api/admin/alunas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...campos }),
    });
    if (!r.ok) {
      alert('Não consegui salvar. Atualize a página.');
      router.refresh();
    }
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <span className="etiqueta">{alunas.length} matriculada(s)</span>
        <button onClick={() => setCriando((c) => !c)} className="botao-fantasma !px-4 !py-2 !text-xs">
          <Plus className="h-3.5 w-3.5" /> nova aluna
        </button>
      </div>

      {convite && (
        <div className="mb-5">
          <LinkDeConvite nome={convite.nome} link={convite.link} />
          <button
            onClick={() => setConvite(null)}
            className="botao-fantasma mt-2 !px-3.5 !py-1.5 !text-xs"
          >
            fechar
          </button>
        </div>
      )}

      {criando && (
        <form onSubmit={criar} className="cartao mb-5 space-y-3 p-4" style={{ background: 'var(--superficie-2)' }}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="etiqueta mb-1.5 block">Nome</label>
              <input className="campo" required value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div>
              <label className="etiqueta mb-1.5 block">E-mail</label>
              <input
                className="campo"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          {aviso && <p className="text-sm" style={{ color: '#E88B6E' }}>{aviso}</p>}
          <p className="flex items-start gap-2 text-xs" style={{ color: 'var(--texto-fraco)' }}>
            <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Ao cadastrar, aparece aqui um link de acesso para você enviar a ela. É ela quem
            cria a própria senha — você nunca digita senha por ninguém, e isso é de propósito.
          </p>
          <button type="submit" disabled={ocupado} className="botao !py-2 !text-xs">
            {ocupado ? 'cadastrando...' : 'cadastrar e gerar link'}
          </button>
        </form>
      )}

      {aviso && !criando && (
        <p className="mb-3 text-sm" style={{ color: '#E88B6E' }}>
          {aviso}
        </p>
      )}

      {alunas.length === 0 ? (
        <p className="cartao px-4 py-10 text-center text-sm text-suave" style={{ borderStyle: 'dashed' }}>
          Nenhuma aluna cadastrada ainda. Comece pelo botão acima.
        </p>
      ) : (
        <ul className="space-y-2">
          {alunas.map((aluna) => (
            <li key={aluna.id} className="cartao flex flex-wrap items-center gap-3 p-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{aluna.nome}</p>
                <p className="truncate text-xs" style={{ color: 'var(--texto-fraco)' }}>
                  {aluna.email}
                </p>
              </div>

              <button
                type="button"
                onClick={() => gerarConvite(aluna)}
                disabled={gerando === aluna.id}
                className="botao-fantasma !px-3 !py-1.5 !text-xs"
                title="Gerar um link para ela criar a senha e entrar"
              >
                {gerando === aluna.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Link2 className="h-3.5 w-3.5" />
                )}
                link de acesso
              </button>

              <label className="flex items-center gap-2 text-xs text-suave">
                módulo
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={aluna.modulo_atual}
                  onChange={(e) => atualizar(aluna.id, { modulo_atual: Number(e.target.value) })}
                  className="campo !w-16 !px-2 !py-1.5 text-center tabular-nums"
                />
              </label>

              <select
                value={aluna.status}
                onChange={(e) => atualizar(aluna.id, { status: e.target.value as Aluna['status'] })}
                className="campo !w-auto !py-1.5 !text-xs"
              >
                {STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
