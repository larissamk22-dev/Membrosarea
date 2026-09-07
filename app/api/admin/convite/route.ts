import { NextResponse, type NextRequest } from 'next/server';
import { exigirAdminApi } from '@/lib/api';

/**
 * Gera um novo link de convite para uma aluna que já está cadastrada.
 *
 * Existe porque link de convite tem prazo de validade e porque a vida
 * acontece: a aluna apagou a mensagem, trocou de celular, ou você cadastrou
 * hoje e ela só foi entrar semana que vem. Em vez de recadastrar (o que daria
 * erro de e-mail duplicado), você gera outro link aqui.
 *
 * O link é sempre novo. O anterior deixa de valer assim que este é usado.
 */
export async function POST(request: NextRequest) {
  const { erro, status, servico } = await exigirAdminApi();
  if (erro || !servico) return NextResponse.json({ erro }, { status });

  const { email } = await request.json();
  if (!email?.trim()) {
    return NextResponse.json({ erro: 'Faltou o e-mail.' }, { status: 400 });
  }

  const limpo = String(email).trim().toLowerCase();

  // Só gera convite para quem está de fato matriculada. Sem isto, esta rota
  // viraria um jeito de criar acesso para qualquer e-mail.
  const { data: aluna } = await servico
    .from('alunas')
    .select('id')
    .eq('email', limpo)
    .maybeSingle();

  if (!aluna) {
    return NextResponse.json({ erro: 'Esse e-mail não está matriculado.' }, { status: 404 });
  }

  const site = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const { data, error } = await servico.auth.admin.generateLink({
    type: 'recovery',
    email: limpo,
    options: { redirectTo: `${site}/definir-senha` },
  });

  const link = data?.properties?.action_link;
  if (error || !link) {
    return NextResponse.json({ erro: 'Não consegui gerar o link agora.' }, { status: 400 });
  }

  return NextResponse.json({ convite: link });
}
