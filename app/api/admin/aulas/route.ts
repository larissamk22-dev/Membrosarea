import { NextResponse, type NextRequest } from 'next/server';
import { exigirAdminApi } from '@/lib/api';

// Criar aula.
export async function POST(request: NextRequest) {
  const { erro, status, servico } = await exigirAdminApi();
  if (erro || !servico) return NextResponse.json({ erro }, { status });

  const c = await request.json();
  if (!c.modulo_id || !c.titulo?.trim()) {
    return NextResponse.json({ erro: 'Informe o módulo e o título.' }, { status: 400 });
  }

  const { data, error } = await servico
    .from('aulas')
    .insert({
      modulo_id: c.modulo_id,
      titulo: String(c.titulo).trim(),
      descricao: c.descricao?.trim() || null,
      video_url: c.video_url?.trim() || null,
      thumbnail_url: c.thumbnail_url?.trim() || null,
      duracao_segundos: c.duracao_minutos ? Math.round(Number(c.duracao_minutos) * 60) : null,
      ordem: Number(c.ordem) || 0,
      liberado: Boolean(c.liberado),
      libera_em: c.libera_em || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ erro: 'Não consegui criar a aula.' }, { status: 400 });
  return NextResponse.json({ aula: data });
}

// Editar aula — inclusive virar a chavinha do "liberado".
export async function PATCH(request: NextRequest) {
  const { erro, status, servico } = await exigirAdminApi();
  if (erro || !servico) return NextResponse.json({ erro }, { status });

  const { id, ...c } = await request.json();
  if (!id) return NextResponse.json({ erro: 'Faltou o id.' }, { status: 400 });

  const campos: Record<string, unknown> = {};
  for (const k of ['titulo', 'descricao', 'video_url', 'thumbnail_url', 'libera_em', 'liberado', 'ordem']) {
    if (c[k] !== undefined) campos[k] = c[k] === '' ? null : c[k];
  }
  if (c.duracao_minutos !== undefined) {
    campos.duracao_segundos = c.duracao_minutos ? Math.round(Number(c.duracao_minutos) * 60) : null;
  }

  const { error } = await servico.from('aulas').update(campos).eq('id', id);
  if (error) return NextResponse.json({ erro: 'Não consegui salvar.' }, { status: 400 });

  return NextResponse.json({ ok: true });
}

// Excluir aula.
export async function DELETE(request: NextRequest) {
  const { erro, status, servico } = await exigirAdminApi();
  if (erro || !servico) return NextResponse.json({ erro }, { status });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ erro: 'Faltou o id.' }, { status: 400 });

  const { error } = await servico.from('aulas').delete().eq('id', id);
  if (error) return NextResponse.json({ erro: 'Não consegui excluir.' }, { status: 400 });

  return NextResponse.json({ ok: true });
}
