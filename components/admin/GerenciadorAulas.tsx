'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Pencil, Eye, EyeOff } from 'lucide-react';
import { duracao } from '@/lib/formato';
import { CampoVideo } from './CampoVideo';
import type { Aula, Modulo } from '@/lib/tipos';
import { CampoCapa } from '@/components/admin/CampoCapa';

const vazia = {
  titulo: '',
  descricao: '',
  video_url: '',
  thumbnail_url: '',
  duracao_minutos: '',
  libera_em: '',
  ordem: '',
};

export function GerenciadorAulas({
  modulos,
  aulasIniciais,
}: {
  modulos: Modulo[];
  aulasIniciais: Aula[];
}) {
  const router = useRouter();
  const [aulas, setAulas] = useState(aulasIniciais);
  const [criandoEm, setCriandoEm] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function chamar(metodo: 'POST' | 'PATCH' | 'DELETE', corpo: unknown) {
    setOcupado(true);
    const r = await fetch('/api/admin/aulas', {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    });
    setOcupado(false);
    const json = await r.json();
    if (!r.ok) {
      alert(json.erro ?? 'Não consegui salvar.');
      return null;
    }
    router.refresh();
    return json;
  }

  async function alternarLiberado(aula: Aula) {
    // Liberar é visível para a turma inteira no mesmo segundo. Confirma.
    if (!aula.liberado && !confirm(`Liberar "${aula.titulo}" para todas as alunas agora?`)) return;
    const ok = await chamar('PATCH', { id: aula.id, liberado: !aula.liberado });
    if (ok) {
      setAulas((prev) =>
        prev.map((a) => (a.id === aula.id ? { ...a, liberado: !aula.liberado } : a))
      );
    }
  }

  async function excluir(aula: Aula) {
    if (!confirm(`Excluir "${aula.titulo}"? Isso não volta atrás.`)) return;
    const ok = await chamar('DELETE', { id: aula.id });
    if (ok) setAulas((prev) => prev.filter((a) => a.id !== aula.id));
  }

  return (
    <div className="mt-8 space-y-9">
      {modulos.map((modulo) => {
        const doModulo = aulas.filter((a) => a.modulo_id === modulo.id);
        return (
          <section key={modulo.id}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <span className="etiqueta">Módulo {modulo.numero}</span>
                <h2 className="mt-0.5 font-display text-lg font-bold">{modulo.titulo}</h2>
              </div>
              <button
                onClick={() => setCriandoEm(criandoEm === modulo.id ? null : modulo.id)}
                className="botao-fantasma !px-4 !py-2 !text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> nova aula
              </button>
            </div>

            {criandoEm === modulo.id && (
              <Formulario
                ocupado={ocupado}
                aoCancelar={() => setCriandoEm(null)}
                aoSalvar={async (campos) => {
                  const r = await chamar('POST', { ...campos, modulo_id: modulo.id });
                  if (r?.aula) {
                    setAulas((prev) => [...prev, r.aula]);
                    setCriandoEm(null);
                  }
                }}
              />
            )}

            {doModulo.length === 0 ? (
              <p className="cartao px-4 py-6 text-center text-sm text-suave" style={{ borderStyle: 'dashed' }}>
                Nenhuma aula neste módulo ainda.
              </p>
            ) : (
              <ul className="space-y-2">
                {doModulo.map((aula) => (
                  <li key={aula.id} className="cartao p-3.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{aula.titulo}</p>
                        <p className="mt-0.5 text-xs" style={{ color: 'var(--texto-fraco)' }}>
                          {[
                            duracao(aula.duracao_segundos),
                            aula.video_url ? 'com vídeo' : 'sem vídeo',
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>

                      <button
                        onClick={() => alternarLiberado(aula)}
                        disabled={ocupado}
                        className="botao-fantasma !px-3.5 !py-1.5 !text-xs"
                        style={
                          aula.liberado
                            ? { borderColor: 'var(--feito)', color: 'var(--feito)' }
                            : undefined
                        }
                      >
                        {aula.liberado ? (
                          <>
                            <Eye className="h-3.5 w-3.5" /> visível
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3.5 w-3.5" /> escondida
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setEditando(editando === aula.id ? null : aula.id)}
                        className="text-suave hover:text-texto"
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => excluir(aula)}
                        className="text-suave hover:text-texto"
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {editando === aula.id && (
                      <Formulario
                        ocupado={ocupado}
                        inicial={{
                          titulo: aula.titulo,
                          descricao: aula.descricao ?? '',
                          video_url: aula.video_url ?? '',
                          thumbnail_url: aula.thumbnail_url ?? '',
                          duracao_minutos: aula.duracao_segundos
                            ? String(Math.round(aula.duracao_segundos / 60))
                            : '',
                          libera_em: aula.libera_em ?? '',
                          ordem: String(aula.ordem),
                        }}
                        aoCancelar={() => setEditando(null)}
                        aoSalvar={async (campos) => {
                          const ok = await chamar('PATCH', { id: aula.id, ...campos });
                          if (ok) {
                            // O formulário devolve tudo como texto; a lista da
                            // tela guarda número e nulo. Converte antes de salvar.
                            const atualizada: Aula = {
                              ...aula,
                              titulo: campos.titulo,
                              descricao: campos.descricao || null,
                              video_url: campos.video_url || null,
                              thumbnail_url: campos.thumbnail_url || null,
                              libera_em: campos.libera_em || null,
                              ordem: Number(campos.ordem) || 0,
                              duracao_segundos: campos.duracao_minutos
                                ? Math.round(Number(campos.duracao_minutos) * 60)
                                : null,
                            };
                            setAulas((prev) =>
                              prev.map((a) => (a.id === aula.id ? atualizada : a))
                            );
                            setEditando(null);
                          }
                        }}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function Formulario({
  inicial,
  aoSalvar,
  aoCancelar,
  ocupado,
}: {
  inicial?: typeof vazia;
  aoSalvar: (campos: typeof vazia) => void;
  aoCancelar: () => void;
  ocupado: boolean;
}) {
  const [f, setF] = useState({ ...vazia, ...inicial });
  const set = (k: keyof typeof vazia, v: string) => setF((p) => ({ ...p, [k]: v }));

  return (
    <div className="cartao mt-3 space-y-3 p-4" style={{ background: 'var(--superficie-2)' }}>
      <div>
        <label className="etiqueta mb-1.5 block">Título</label>
        <input className="campo" value={f.titulo} onChange={(e) => set('titulo', e.target.value)} />
      </div>
      <div>
        <label className="etiqueta mb-1.5 block">Descrição</label>
        <textarea
          className="campo"
          rows={2}
          value={f.descricao}
          onChange={(e) => set('descricao', e.target.value)}
        />
      </div>
      <CampoVideo
        valor={f.video_url}
        aoMudar={(v) => set('video_url', v)}
        aoEscolherDoPanda={(e) =>
          setF((p) => ({
            ...p,
            video_url: e.video_url,
            thumbnail_url: e.thumbnail_url,
            duracao_minutos: e.duracao_minutos || p.duracao_minutos,
            // Só usa o nome do arquivo do Panda se você ainda não deu um título.
            titulo: p.titulo || e.titulo,
          }))
        }
      />
      <CampoCapa valor={f.thumbnail_url} aoMudar={(v) => set('thumbnail_url', v)} />
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="etiqueta mb-1.5 block">Duração (min)</label>
          <input
            className="campo"
            inputMode="numeric"
            value={f.duracao_minutos}
            onChange={(e) => set('duracao_minutos', e.target.value)}
          />
        </div>
        <div>
          <label className="etiqueta mb-1.5 block">Ordem</label>
          <input
            className="campo"
            inputMode="numeric"
            value={f.ordem}
            onChange={(e) => set('ordem', e.target.value)}
          />
        </div>
        <div>
          <label className="etiqueta mb-1.5 block">Libera em</label>
          <input
            className="campo"
            type="date"
            value={f.libera_em}
            onChange={(e) => set('libera_em', e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => aoSalvar(f)} disabled={ocupado} className="botao !py-2 !text-xs">
          {ocupado ? 'salvando...' : 'salvar'}
        </button>
        <button onClick={aoCancelar} className="botao-fantasma !py-2 !text-xs">
          cancelar
        </button>
      </div>
    </div>
  );
}
