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
