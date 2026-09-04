-- =====================================================================
-- ÁREA DE MEMBROS · 5: onde moram as capas das aulas
--
-- Até aqui a capa era um LINK que você colava. Isso funciona quando o vídeo
-- vem do Panda (ele entrega a capa junto), mas te deixa na mão quando a aula
-- vem de outro lugar, ou quando você quer uma capa com a sua marca.
--
-- Este bucket é o lugar onde as imagens que você sobe pelo painel ficam
-- guardadas. Repare em duas decisões:
--
--   public = true  -> a imagem abre por link direto, sem login. Capa de aula
--                     não é conteúdo: é a vitrine. O que precisa de cadeado
--                     é o vídeo, e esse continua trancado pela 004.
--
--   sem policy de escrita -> ninguém insere aqui pela API. Quem grava é o
--                     servidor, na rota /api/admin/capa, com a chave de
--                     serviço, e só depois de conferir que quem pediu é
--                     administradora. Aluna logada não sobe imagem nenhuma.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'capas',
  'capas',
  true,
  4194304,  -- 4 MB: capa é imagem, não é vídeo
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Leitura pública das capas. É o que faz a imagem aparecer no card.
drop policy if exists "capas sao publicas para leitura" on storage.objects;
create policy "capas sao publicas para leitura"
  on storage.objects for select
  using (bucket_id = 'capas');
