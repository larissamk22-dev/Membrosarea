-- =====================================================================
-- ÁREA DE MEMBROS · parte 3 de 3: conteúdo de exemplo
--
-- Serve só para a tela não nascer vazia na aula. Depois você apaga
-- estas linhas e cadastra o seu conteúdo pelo painel.
--
-- Repare que algumas aulas estão com liberado = false de propósito:
-- são elas que aparecem com cadeado na tela da aluna.
-- =====================================================================

insert into public.modulos (numero, titulo, descricao) values
  (1, 'Fundamentos', 'O que você precisa entender antes de colocar a mão na massa.'),
  (2, 'Na prática',  'Aqui a gente constrói junto, do zero ao publicado.'),
  (3, 'Escala',      'Como transformar isso em serviço e cobrar por ele.')
on conflict (numero) do nothing;

insert into public.aulas (modulo_id, titulo, descricao, duracao_segundos, ordem, liberado, libera_em)
select m.id, v.titulo, v.descricao, v.duracao, v.ordem, v.liberado, v.libera_em
  from public.modulos m
  join (values
    (1, 'Boas-vindas: como usar esta área',        'Comece por aqui. Em 6 minutos você entende como o curso funciona.', 372,  1, true,  null::date),
    (1, 'O mapa completo do método',               'A visão de cima antes do detalhe: as três etapas e por que essa ordem.', 1490, 2, true,  null),
    (1, 'Preparando suas ferramentas',             'O que instalar e configurar antes da próxima aula.', 1105, 3, true,  null),
    (2, 'Montando a base',                         'A primeira entrega, feita junto comigo na tela.', 2340, 1, true,  null),
    (2, 'Ajustando para o seu nicho',              'Onde a maioria erra: adaptar sem descaracterizar.', 1876, 2, true,  null),
    (2, 'Revisão e correções ao vivo',             'Gravação da sessão de dúvidas da turma.', 3120, 3, false, '2026-09-12'),
    (3, 'Precificando o seu serviço',              'Três modelos de cobrança e quando usar cada um.', 1650, 1, true,  null),
    (3, 'A proposta que fecha',                    'Estrutura, ordem dos blocos e o erro do preço na página errada.', 1420, 2, false, '2026-09-19')
  ) as v(modulo_numero, titulo, descricao, duracao, ordem, liberado, libera_em)
    on v.modulo_numero = m.numero
 where not exists (
   select 1 from public.aulas a where a.modulo_id = m.id and a.titulo = v.titulo
 );
