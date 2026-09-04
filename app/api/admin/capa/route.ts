import { NextResponse, type NextRequest } from 'next/server';
import { exigirAdminApi } from '@/lib/api';

/**
 * Recebe a imagem de capa da aula e devolve o link dela.
 *
 * Três travas, nesta ordem:
 *   1. quem pediu é administradora? (exigirAdminApi, no servidor)
 *   2. é mesmo uma imagem PNG/JPG/WEBP?
 *   3. cabe no limite?
 *
 * Só depois disso o arquivo é gravado — e com a chave de serviço, que nunca
 * sai do servidor. Aluna logada não tem caminho nenhum até aqui.
 */

const TIPOS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

// 4 MB. Acima disso a Vercel recusa a requisição antes de ela chegar aqui,
// então o limite existe para dar uma mensagem decente em vez de erro seco.
const LIMITE = 4 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const { erro, status, servico } = await exigirAdminApi();
  if (erro || !servico) return NextResponse.json({ erro }, { status });

  let arquivo: File | null = null;
  try {
    const form = await request.formData();
    const f = form.get('arquivo');
    if (f instanceof File) arquivo = f;
  } catch {
    return NextResponse.json({ erro: 'Não consegui ler o arquivo enviado.' }, { status: 400 });
  }

  if (!arquivo) {
    return NextResponse.json({ erro: 'Escolha uma imagem primeiro.' }, { status: 400 });
  }

  const extensao = TIPOS[arquivo.type];
  if (!extensao) {
    return NextResponse.json({ erro: 'A capa precisa ser PNG, JPG ou WEBP.' }, { status: 400 });
  }

  if (arquivo.size > LIMITE) {
    const mb = (arquivo.size / 1024 / 1024).toFixed(1);
    return NextResponse.json(
      { erro: `A imagem tem ${mb} MB e o limite é 4 MB. Salve ela menor e tente de novo.` },
      { status: 400 }
    );
  }

  // Nome novo a cada upload: nunca sobrescreve a capa de outra aula, e evita
  // que o navegador continue mostrando a imagem antiga guardada no cache.
  const nome = `${crypto.randomUUID()}.${extensao}`;

  const { error } = await servico.storage.from('capas').upload(nome, arquivo, {
    contentType: arquivo.type,
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ erro: 'Não consegui guardar a imagem.' }, { status: 400 });
  }

  const { data } = servico.storage.from('capas').getPublicUrl(nome);
  return NextResponse.json({ url: data.publicUrl });
}
