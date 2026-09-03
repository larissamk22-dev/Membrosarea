export interface Aluna {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  status: 'ativa' | 'pausada' | 'cancelada';
  modulo_atual: number;
  created_at: string;
}

export interface Modulo {
  id: string;
  numero: number;
  titulo: string;
  descricao: string | null;
}

export interface Aula {
  id: string;
  modulo_id: string;
  titulo: string;
  descricao: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  duracao_segundos: number | null;
  ordem: number;
  liberado: boolean;
  libera_em: string | null;
  created_at: string;
}

/**
 * As colunas de `aulas` que o navegador pode ler.
 *
 * A migration 004 trancou `video_url`: quem lê a tabela como aluna não tem
 * permissão nessa coluna. E o Postgres não devolve "tudo menos essa" — se a
 * consulta pedir `*`, ele nega a consulta inteira e a lista volta VAZIA,
 * sem erro na tela.
 *
 * Por isso toda leitura de aulas feita com a chave pública pede estas colunas
 * pelo nome. Só o servidor, com a chave de serviço, alcança o video_url.
 */
export const COLUNAS_AULA =
  'id, modulo_id, titulo, descricao, thumbnail_url, duracao_segundos, ordem, liberado, libera_em, created_at';
