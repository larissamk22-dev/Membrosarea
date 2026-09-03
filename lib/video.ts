/**
 * De onde vem o vídeo da aula.
 *
 * O sistema aceita vídeo de qualquer lugar — Panda, YouTube, Vimeo, Google
 * Drive, Loom. O problema é que o link que a pessoa tem em mãos quase nunca
 * é o link de INCORPORAR, e colar o link errado dá tela preta.
 *
 * Esta função recebe o link que você copiou da barra de endereço e devolve o
 * endereço certo para o player, mais um aviso honesto sobre proteção quando
 * for o caso.
 */

export type Fonte = 'panda' | 'youtube' | 'vimeo' | 'drive' | 'loom' | 'outro';

export interface VideoNormalizado {
  /** O endereço que vai no player. Vazio quando não deu para entender o link. */
  embed: string;
  fonte: Fonte;
  nomeDaFonte: string;
  /** Aviso sobre proteção do conteúdo. Null quando não há o que avisar. */
  aviso: string | null;
  /** True quando o link já veio pronto e não precisou de conversão. */
  jaEraEmbed: boolean;
}

const SEM_PROTECAO =
  'Quem tiver este link assiste sem passar pelo seu login. Serve para começar; quando o curso for pago, vale mudar para uma hospedagem com proteção.';

export function normalizarVideo(bruto: string): VideoNormalizado {
  const url = (bruto ?? '').trim();

  if (!url) {
    return { embed: '', fonte: 'outro', nomeDaFonte: '', aviso: null, jaEraEmbed: false };
  }

  // ---- Panda Video ----
  // O link do player já vem pronto quando você escolhe da biblioteca.
  if (url.includes('pandavideo.com.br')) {
    return {
      embed: url,
      fonte: 'panda',
      nomeDaFonte: 'Panda Video',
      aviso: url.includes('/embed/')
        ? null
        : 'Este não parece o link do player. No Panda, use o botão de incorporar — o endereço do player não se monta a partir do id do vídeo.',
      jaEraEmbed: url.includes('/embed/'),
    };
  }

  // ---- YouTube ----
  // Aceita youtube.com/watch?v=ID, youtu.be/ID e o /embed/ já pronto.
  const yt =
    url.match(/[?&]v=([A-Za-z0-9_-]{6,})/) ||
    url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/) ||
    url.match(/youtube\.com\/(?:embed|live|shorts)\/([A-Za-z0-9_-]{6,})/);
  if (yt) {
    return {
      // O domínio -nocookie evita rastrear sua aluna sem necessidade.
      embed: `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0`,
      fonte: 'youtube',
      nomeDaFonte: 'YouTube',
      aviso: SEM_PROTECAO,
      jaEraEmbed: url.includes('/embed/'),
    };
  }

  // ---- Vimeo ----
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    return {
      embed: `https://player.vimeo.com/video/${vimeo[1]}`,
      fonte: 'vimeo',
      nomeDaFonte: 'Vimeo',
      aviso: url.includes('player.vimeo.com')
        ? null
        : 'No Vimeo, confira as permissões do vídeo: se ele estiver público, o link funciona fora da sua área de membros.',
      jaEraEmbed: url.includes('player.vimeo.com'),
    };
  }

  // ---- Google Drive ----
  // O link de compartilhar termina em /view; o player quer /preview.
  const drive = url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/);
  if (drive) {
    return {
      embed: `https://drive.google.com/file/d/${drive[1]}/preview`,
      fonte: 'drive',
      nomeDaFonte: 'Google Drive',
      aviso: `${SEM_PROTECAO} No Drive, lembre também de deixar o arquivo como "qualquer pessoa com o link", senão sua aluna vê "sem permissão".`,
      jaEraEmbed: url.endsWith('/preview'),
    };
  }

  // ---- Loom ----
  const loom = url.match(/loom\.com\/(?:share|embed)\/([A-Za-z0-9]+)/);
  if (loom) {
    return {
      embed: `https://www.loom.com/embed/${loom[1]}`,
      fonte: 'loom',
      nomeDaFonte: 'Loom',
      aviso: SEM_PROTECAO,
      jaEraEmbed: url.includes('/embed/'),
    };
  }

  // ---- Qualquer outro ----
  // Usa como veio. Se for um endereço de página em vez de player, o aviso
  // avisa antes de a aluna descobrir com a tela preta.
  const pareceEmbed = /\/(embed|preview|player)\//.test(url);
  return {
    embed: url,
    fonte: 'outro',
    nomeDaFonte: 'Outro serviço',
    aviso: pareceEmbed
      ? null
      : 'Não reconheci esse serviço. Confira se é o link de INCORPORAR (embed), e não o endereço da página — o da página costuma dar tela preta.',
    jaEraEmbed: pareceEmbed,
  };
}
