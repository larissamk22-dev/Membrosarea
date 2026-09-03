-- =====================================================================
-- ÁREA DE MEMBROS · parte 1 de 3: as tabelas
-- Cole no Supabase > SQL Editor e clique em Run.
-- =====================================================================

-- Quem é dona do sistema. Ninguém entra aqui por formulário: só você,
-- na mão, no SQL Editor. É a única coisa deste sistema que não tem tela.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  created_at timestamptz not null default now()
);

-- Quem comprou o curso. O login mora no auth do Supabase; esta tabela
-- guarda o que é do negócio: status da matrícula e até onde ela avançou.
create table if not exists public.alunas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  nome text not null,
  email text not null unique,
  status text not null default 'ativa' check (status in ('ativa', 'pausada', 'cancelada')),
  modulo_atual int not null default 1 check (modulo_atual between 1 and 12),
  created_at timestamptz not null default now()
);

create index if not exists alunas_user_id_idx on public.alunas(user_id);

-- Os módulos do curso.
create table if not exists public.modulos (
  id uuid primary key default gen_random_uuid(),
  numero int not null unique check (numero between 1 and 12),
  titulo text not null,
  descricao text
);

-- As aulas.
--   liberado   = a chavinha que VOCÊ vira. Aula que ainda vai ser gravada
--                fica em false.
--   libera_em  = data prevista, só para a mensagem "libera em 12/09".
--                Não trava nada sozinha; quem trava é o liberado.
--   video_url  = o link do PLAYER do Panda Video (copiado do painel, nunca
--                montado na mão a partir do id do vídeo).
--   thumbnail_url = a imagem de capa do vídeo, também copiada do Panda.
create table if not exists public.aulas (
  id uuid primary key default gen_random_uuid(),
  modulo_id uuid not null references public.modulos(id) on delete cascade,
  titulo text not null,
  descricao text,
  video_url text,
  thumbnail_url text,
  duracao_segundos int,
  ordem int not null default 0,
  liberado boolean not null default false,
  libera_em date,
  created_at timestamptz not null default now()
);

create index if not exists aulas_modulo_idx on public.aulas(modulo_id);

-- O que cada aluna já assistiu. É o que alimenta a barra de progresso
-- e o botão "continuar de onde parei".
create table if not exists public.progresso (
  aluna_id uuid not null references public.alunas(id) on delete cascade,
  aula_id uuid not null references public.aulas(id) on delete cascade,
  concluida boolean not null default false,
  atualizado_em timestamptz not null default now(),
  primary key (aluna_id, aula_id)
);
