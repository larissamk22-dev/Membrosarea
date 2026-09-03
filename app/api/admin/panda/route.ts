import { NextResponse } from 'next/server';
import { exigirAdminApi } from '@/lib/api';

/**
 * Lista os vídeos da sua conta do Panda Video.
 *
 * Por que isto existe: o link do player NÃO se monta a partir do id do
 * vídeo — o Panda usa outro identificador para o player. Quem tenta deduzir
 * o endereço acaba com um botão que não abre nada.
 *
 * Deixando o sistema perguntar para a API, ele lê o campo certo (video_player),
 * traz a capa e a duração junto, e o erro simplesmente não tem como acontecer.
 *
 * O token nunca chega ao navegador: esta rota roda no servidor e devolve só
 * o que a tela precisa mostrar.
 */
export async function GET() {
  const { erro, status } = await exigirAdminApi();
  if (erro) return NextResponse.json({ erro }, { status });

  const token = process.env.PANDA_VIDEO_TOKEN;
  if (!token) {
    // Sem token o sistema continua funcionando: você cola o link na mão.
    return NextResponse.json({
      videos: [],
      aviso: 'Sem PANDA_VIDEO_TOKEN configurado. Você ainda pode colar o link do player à mão.',
    });
  }

  try {
    // Atenção: o header é "Authorization: <token>", sem a palavra Bearer.
    const r = await fetch('https://api-v2.pandavideo.com.br/videos?limit=100', {
      headers: { Authorization: token },
      cache: 'no-store',
    });

    if (!r.ok) {
      return NextResponse.json(
        { videos: [], aviso: 'O Panda recusou a chamada. Confira se o token está correto.' },
        { status: 200 }
      );
    }

    const dados = await r.json();

    const videos = (dados.videos ?? []).map((v: Record<string, unknown>) => ({
      id: v.id,
      titulo: v.title,
      // O campo certo. Nunca construa este endereço a partir do id.
      player: v.video_player,
      capa: v.thumbnail,
      // A API devolve segundos com casas decimais.
      duracao_segundos: v.length ? Math.round(Number(v.length)) : null,
      pronto: v.status === 'CONVERTED' && v.playable === true,
      status: v.status,
    }));

    return NextResponse.json({ videos, total: dados.total ?? videos.length });
  } catch {
    return NextResponse.json(
      { videos: [], aviso: 'Não consegui falar com o Panda agora.' },
      { status: 200 }
    );
  }
}
