import { NextResponse, type NextRequest } from 'next/server';
import { exigirAdminApi, senhaTemporaria } from '@/lib/api';

// Criar aluna: cria o login no auth e a linha na tabela alunas.
export async function POST(request: NextRequest) {
  const { erro, status, servico } = await exigirAdminApi();
  if (erro || !servico) return NextResponse.json({ erro }, { status });

  const { nome, email } = await request.json();
  if (!nome?.trim() || !email?.trim()) {
    return NextResponse.json({ erro: 'Informe nome e e-mail.' }, { status: 400 });
  }

  const limpo = String(email).trim().toLowerCase();

  const { data: criado, error: erroAuth } = await servico.auth.admin.createUser({
    email: limpo,
    password: senhaTemporaria(),
    email_confirm: true,
  });

  if (erroAuth || !criado.user) {
    const jaExiste = erroAuth?.message?.toLowerCase().includes('already');
    return NextResponse.json(
      { erro: jaExiste ? 'Já existe uma conta com esse e-mail.' : 'Não consegui criar a conta.' },
      { status: 400 }
    );
  }

  const { data: aluna, error: erroTabela } = await servico
    .from('alunas')
    .insert({ user_id: criado.user.id, nome: String(nome).trim(), email: limpo })
    .select()
    .single();

  if (erroTabela) {
    // Desfaz o login órfão: melhor não deixar conta sem matrícula.
    await servico.auth.admin.deleteUser(criado.user.id);
    return NextResponse.json({ erro: 'Não consegui salvar a matrícula.' }, { status: 400 });
  }

  // O convite para ela criar a própria senha.
  //
  // Atenção ao que generateLink faz e ao que NÃO faz: ele GERA o link e
  // devolve, sem enviar e-mail nenhum. Quem envia é você. Por isso o link
  // volta aqui na resposta, para o painel mostrar na tela — daí você manda
  // por onde a sua aluna realmente lê, que na prática é o WhatsApp.
  const site = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const { data: convite } = await servico.auth.admin.generateLink({
    type: 'recovery',
    email: limpo,
    options: { redirectTo: `${site}/definir-senha` },
  });

  return NextResponse.json({
    aluna,
    convite: convite?.properties?.action_link ?? null,
  });
}

// Mudar status ou avançar o módulo.
export async function PATCH(request: NextRequest) {
  const { erro, status, servico } = await exigirAdminApi();
  if (erro || !servico) return NextResponse.json({ erro }, { status });

  const { id, ...campos } = await request.json();
  if (!id) return NextResponse.json({ erro: 'Faltou o id.' }, { status: 400 });

  // Lista fechada: só estes campos podem ser alterados por aqui, mesmo que
  // alguém mande outros no corpo da requisição.
  const permitido: Record<string, unknown> = {};
  if (campos.status !== undefined) permitido.status = campos.status;
  if (campos.modulo_atual !== undefined) permitido.modulo_atual = Number(campos.modulo_atual);

  const { error } = await servico.from('alunas').update(permitido).eq('id', id);
  if (error) return NextResponse.json({ erro: 'Não consegui salvar.' }, { status: 400 });

  return NextResponse.json({ ok: true });
}
