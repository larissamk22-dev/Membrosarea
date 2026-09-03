'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Mail } from 'lucide-react';
import type { Aluna } from '@/lib/tipos';

const STATUS: Aluna['status'][] = ['ativa', 'pausada', 'cancelada'];

export function GerenciadorAlunas({ alunasIniciais }: { alunasIniciais: Aluna[] }) {
  const router = useRouter();
  const [alunas, setAlunas] = useState(alunasIniciais);
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

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
    setNome('');
    setEmail('');
    setCriando(false);
    router.refresh();
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
            <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Ela recebe um e-mail para criar a própria senha. Você não define senha por ela — e
            isso é de propósito.
          </p>
          <button type="submit" disabled={ocupado} className="botao !py-2 !text-xs">
            {ocupado ? 'cadastrando...' : 'cadastrar e enviar convite'}
          </button>
        </form>
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
