-- =====================================================================
-- ÁREA DE MEMBROS · parte 2 de 3: as travas (Row Level Security)
--
-- A ideia em uma frase: ligar RLS é dizer "por padrão, ninguém vê nada".
-- Depois a gente abre porta por porta.
--
-- Esta é a parte que separa um cadeado de verdade de um cadeado desenhado.
-- Sem isto, qualquer aluna logada consegue puxar TODO o conteúdo pela API,
-- mesmo o que a tela nunca mostrou.
-- =====================================================================

alter table public.admins    enable row level security;
alter table public.alunas    enable row level security;
alter table public.modulos   enable row level security;
alter table public.aulas     enable row level security;
alter table public.progresso enable row level security;

-- Função auxiliar: "quem está pedindo é admin?".
-- security definer para poder consultar a tabela admins sem cair na
-- própria RLS; search_path fixo para ninguém trocar a tabela debaixo dela.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

-- ---------- admins ----------
-- Cada pessoa só consegue conferir o PRÓPRIO registro. Ninguém lista
-- quem são as admins, e não existe insert/update/delete por aqui.
drop policy if exists "pessoa ve o proprio registro de admin" on public.admins;
create policy "pessoa ve o proprio registro de admin"
  on public.admins for select to authenticated
  using (user_id = auth.uid());

-- ---------- alunas ----------
drop policy if exists "aluna le a propria linha" on public.alunas;
create policy "aluna le a propria linha"
  on public.alunas for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "aluna atualiza a propria linha" on public.alunas;
create policy "aluna atualiza a propria linha"
  on public.alunas for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ...mas ela NÃO pode mexer no que define o acesso dela.
--
-- Aqui mora uma pegadinha do Postgres que custa caro. O caminho que parece
-- óbvio é revogar só as duas colunas:
--
--     revoke update (status, modulo_atual) on public.alunas from authenticated;
--
-- Isso NÃO FUNCIONA. Quando o papel já tem update sobre a TABELA INTEIRA — e
-- é assim que o Supabase cria toda tabela nova — revogar coluna solta não faz
-- efeito nenhum: o banco emite um aviso e segue a vida. A trava fica só na
-- sua cabeça, e a aluna consegue escrever modulo_atual = 12 na própria linha,
-- destravando o curso inteiro pela API.
--
-- O jeito que funciona é o mesmo que a migration 004 usa com o video_url:
-- primeiro tira o direito da tabela toda, depois devolve coluna por coluna.
revoke update on public.alunas from authenticated;

-- Só o nome volta. Repare no que ficou de fora, e por quê:
--   status, modulo_atual -> definem o acesso dela; quem mexe é você, no painel
--   id, user_id          -> identidade da linha, ninguém reescreve
--   created_at           -> histórico
--   email                -> o login de verdade mora no auth do Supabase.
--                           Deixar editar só esta cópia desencontraria as duas.
grant update (nome) on public.alunas to authenticated;

-- Conferindo (esta consulta tem que responder false, false, true):
--   select has_column_privilege('authenticated','public.alunas','modulo_atual','UPDATE'),
--          has_column_privilege('authenticated','public.alunas','status','UPDATE'),
--          has_column_privilege('authenticated','public.alunas','nome','UPDATE');

drop policy if exists "admin gerencia alunas" on public.alunas;
create policy "admin gerencia alunas"
  on public.alunas for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- modulos ----------
-- Todo mundo logado vê a lista de módulos, inclusive os que ainda não
-- abriram. Isso é de propósito: é o que permite mostrar o card
-- "Módulo 3 libera quando você concluir o anterior". O TÍTULO DO MÓDULO
-- pode aparecer; o conteúdo das aulas dele, não (ver a policy de aulas).
drop policy if exists "autenticada le modulos" on public.modulos;
create policy "autenticada le modulos"
  on public.modulos for select to authenticated
  using (true);

drop policy if exists "admin gerencia modulos" on public.modulos;
create policy "admin gerencia modulos"
  on public.modulos for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- aulas ----------
-- A aluna enxerga a FICHA das aulas dos módulos que já abriram para ela —
-- inclusive as que ainda não foram liberadas. Isso é de propósito: é o que
-- permite desenhar o cadeado com "libera em 12/09" em vez de simplesmente
-- sumir com a aula da tela.
--
-- Duas condições, as duas obrigatórias:
--   1. a matrícula dela está ativa;
--   2. o módulo da aula já abriu para ela (numero <= modulo_atual).
--
-- Repare no que NÃO está escrito aqui: "using (true)". Se estivesse, a tela
-- continuaria bonita e o cadeado continuaria aparecendo — mas qualquer aluna
-- conseguiria puxar o curso inteiro pela API.
--
-- E o link do vídeo? Esse não sai por aqui. Veja a migration 004.
drop policy if exists "aluna le ficha das aulas do modulo dela" on public.aulas;
create policy "aluna le ficha das aulas do modulo dela"
  on public.aulas for select to authenticated
  using (
    exists (
      select 1
        from public.modulos m
        join public.alunas a
          on a.user_id = auth.uid()
         and a.status = 'ativa'
       where m.id = aulas.modulo_id
         and m.numero <= a.modulo_atual
    )
  );

drop policy if exists "admin gerencia aulas" on public.aulas;
create policy "admin gerencia aulas"
  on public.aulas for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- progresso ----------
-- Cada aluna escreve e lê só o próprio progresso.
drop policy if exists "aluna gerencia o proprio progresso" on public.progresso;
create policy "aluna gerencia o proprio progresso"
  on public.progresso for all to authenticated
  using (
    exists (select 1 from public.alunas a
             where a.id = progresso.aluna_id and a.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.alunas a
             where a.id = progresso.aluna_id and a.user_id = auth.uid())
  );

drop policy if exists "admin le progresso" on public.progresso;
create policy "admin le progresso"
  on public.progresso for select to authenticated
  using (public.is_admin());
