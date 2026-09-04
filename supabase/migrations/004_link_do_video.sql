-- =====================================================================
-- ÁREA DE MEMBROS · 4: escondendo o link do vídeo
--
-- A RLS trava LINHA. Aqui a gente precisa de algo mais fino: a aluna pode
-- ver a ficha da aula (para o cadeado aparecer bonito), mas não pode pegar
-- o link do vídeo de uma aula que ainda não foi liberada.
--
-- A solução é travar a COLUNA. Em Postgres funciona assim: primeiro tira o
-- direito de ler a tabela, depois devolve o direito coluna por coluna —
-- deixando video_url de fora da lista.
--
-- Resultado: mesmo abrindo o console do navegador e chamando a API na mão,
-- ninguém consegue selecionar video_url. Nem a aluna, nem alguém que roube
-- a chave anon (que é pública mesmo).
--
-- Então quem lê o link? O SERVIDOR. A página do player confere que a aula
-- está liberada e só então busca a URL com a chave de serviço, que nunca
-- sai de lá. É o mesmo princípio do cofre atrás do balcão: o produto existe,
-- mas quem alcança é o atendente, não o cliente.
-- =====================================================================

revoke select on public.aulas from authenticated;

grant select (
  id,
  modulo_id,
  titulo,
  descricao,
  thumbnail_url,
  duracao_segundos,
  ordem,
  liberado,
  libera_em,
  created_at
) on public.aulas to authenticated;

-- E o mesmo para o papel anon, que é o visitante deslogado.
--
-- Hoje isso não muda nada: o anon não tem policy nenhuma nesta tabela, então
-- a RLS já devolve zero linha para ele. É defesa em profundidade, para o dia
-- em que você criar uma "aula de degustação" aberta ao público — nesse dia a
-- ficha da aula abre, e o link do vídeo continua fechado. Sem isto, ele iria
-- junto sem ninguém perceber.
revoke select on public.aulas from anon;

grant select (
  id,
  modulo_id,
  titulo,
  descricao,
  thumbnail_url,
  duracao_segundos,
  ordem,
  liberado,
  libera_em,
  created_at
) on public.aulas to anon;

-- Conferindo: esta consulta tem que dar ERRO de permissão quando rodada
-- como aluna, e funcionar quando rodada aqui no SQL Editor.
--   select video_url from aulas limit 1;
--
-- E esta tem que responder false, false:
--   select has_column_privilege('authenticated','public.aulas','video_url','SELECT'),
--          has_column_privilege('anon','public.aulas','video_url','SELECT');
