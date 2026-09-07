# Área de Membros

Uma área de membros pronta para você clonar, conectar ao seu banco e deixar
com a sua cara: login com e-mail e senha, aulas com cadeado, vídeo hospedado
no Panda Video e um painel para você subir as aulas.

Feito nas aulas do **Clube Divos da IA**.

**Stack:** Next.js 14 · Supabase · Panda Video · Vercel

---

## O que você vai ter no fim

- Uma tela de login só. Quem entra vai para o lugar certo: você para o
  painel, sua aluna para as aulas.
- Aulas com **cadeado de verdade** — travado no banco, não escondido na tela.
- Liberação em etapas: cada aluna avança no ritmo dela.
- Painel para cadastrar aluna e publicar aula, escolhendo o vídeo direto da
  sua biblioteca do Panda.
- **Capa da aula com a sua arte**: você sobe um PNG ou JPG e ele aparece no
  card e na frente do player, no lugar do quadro que a hospedagem escolheu.
- Matrícula por **link de acesso**: a aluna cria a própria senha, e você nunca
  digita senha por ninguém.

---

## Passo 0 · O prompt que conduz tudo

Crie uma pasta nova e vazia (botão direito na área de trabalho → Nova pasta),
abra ela no seu editor e, com o Claude Code aberto ali dentro, cole o prompt
abaixo. Ele faz o Claude te guiar passo a passo, esperando você a cada etapa —
em vez de sair fazendo tudo sozinho e te deixar sem entender o que aconteceu.

```
Você é meu copiloto para montar a minha área de membros. Eu não programo, e
quero entender o que está acontecendo em cada etapa.

COMO VOCÊ DEVE ME CONDUZIR:
- Fale em português simples. Se precisar usar um termo técnico, explique ele
  na mesma frase.
- UM passo por vez. Depois de cada passo, PARE e espere eu dizer "próximo".
  Nunca emende dois passos.
- VOCÊ executa os comandos por mim. Eu não vou digitar comando nenhum.
- Quando eu precisar fazer alguma coisa fora daqui (clicar em algo num site,
  copiar uma chave), me diga exatamente onde clicar e espere eu confirmar
  que fiz.
- Se der erro, explique em português o que aconteceu antes de corrigir.
- Não apague nem mude nada que já existe no meu computador.

O QUE VAMOS FAZER, NESTA ORDEM:

1. Baixe para esta pasta o projeto que está em
   https://github.com/Amandardiniz/area-de-membros
   e deixe ele pronto para rodar, instalando o que ele precisar. Se der
   algum erro de instalação, resolva sozinho e me conte o que você fez.

2. Me explique, em 5 linhas, o que veio dentro dessa pasta.

3. Me guie para criar o meu banco de dados no Supabase:
   - onde eu clico para criar o projeto
   - como eu rodo, na ordem certa, os cinco arquivos que estão na pasta
     supabase/migrations
   - me lembre de desligar a confirmação de e-mail

4. Me diga quais chaves eu preciso copiar e onde exatamente elas ficam.
   Depois coloque essas chaves no lugar certo do projeto para mim.

5. Rode o projeto e me diga qual endereço eu abro no navegador.

6. Me guie para criar a minha conta de administradora, e escreva para mim
   o comando que eu preciso colar no Supabase.

Comece pelo passo 1 e pare quando terminar.
```

Se preferir fazer na mão, o passo a passo completo está abaixo.

---

## Passo 1 · Clonar

```bash
git clone https://github.com/Amandardiniz/area-de-membros.git minha-area
cd minha-area
npm install
```

Se o `npm install` reclamar de dependências, use:
`npm install --legacy-peer-deps`

---

## Passo 2 · Criar o banco no Supabase

1. Crie uma conta em [supabase.com](https://supabase.com) e um projeto novo.
   Guarde a senha do banco.
2. Abra o **SQL Editor** e rode os cinco arquivos de `supabase/migrations/`,
   **nesta ordem**. Cole o conteúdo de um, clique em Run, e vá para o próximo:

   | Arquivo | O que faz |
   |---|---|
   | `001_tabelas.sql` | Cria as cinco tabelas |
   | `002_rls.sql` | Liga as travas de segurança |
   | `003_conteudo_exemplo.sql` | Põe 3 módulos e 8 aulas de exemplo, para a tela não nascer vazia |
   | `004_link_do_video.sql` | Esconde o link do vídeo do navegador |
   | `005_capas.sql` | Cria o lugar onde ficam as capas que você sobe |

3. Vá em **Authentication → Providers** e deixe ligado só e-mail e senha.
4. Ainda em Authentication, **desligue "Confirm email"** enquanto estiver
   testando — senão sua aluna de teste não consegue entrar.

---

## Passo 3 · As chaves

```bash
cp .env.local.example .env.local
```

Abra o `.env.local` e preencha com o que está em
**Project Settings → API** no Supabase.

O `.env.local` **nunca vai para o GitHub** — já está no `.gitignore`, e é
exatamente esse o trabalho dele.

### Qual chave pode aparecer onde

| Chave | Vai para o navegador? | Onde vive |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | Qualquer lugar. É só o endereço. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Sim** | Qualquer lugar. Ela é pública de propósito: quem protege os dados é a RLS, não o segredo da chave. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Nunca** | Só em `app/api/**` e Server Components. Ela ignora todas as travas. |
| `PANDA_VIDEO_TOKEN` | **Nunca** | Só no servidor. Opcional. |

> **A regra em uma frase:** no Next.js, tudo que começa com `NEXT_PUBLIC_`
> vai para o navegador. Se a variável tem esse prefixo, considere que ela
> está publicada na internet.

**Se uma chave vazar** (foi para o GitHub, apareceu numa gravação): não
adianta apagar o arquivo. Gere uma nova no Supabase — a antiga continua
valendo até você trocar.

---

## Passo 4 · Rodar

```bash
npm run dev
```

Abra `localhost:3000`. Você vai cair no login, e ainda não tem conta.

---

## Passo 5 · Criar a sua conta de dona

Não existe tela para isso, e é **de propósito**: se existisse um botão
"virar administradora", qualquer pessoa apertaria.

1. Supabase → **Authentication → Users → Add user → Create new user**. Use o
   seu e-mail e uma senha, e **ligue "Auto Confirm User"**. Sem essa chavinha,
   o Supabase espera você clicar num link de confirmação que talvez nem
   chegue — e você fica trancada para fora do seu próprio sistema.
2. Copie o **UID** que aparece na lista.
3. No SQL Editor:

```sql
insert into admins (user_id, nome)
values ('COLE-O-UID-AQUI', 'Seu nome');
```

Entre em `localhost:3000` e você cai no painel.

---

## De onde vem o vídeo da aula

Você publica a aula **no painel**, não no código. O campo do vídeo aceita o
link de onde a sua aula estiver:

| Onde a aula está | O que colar | Proteção |
|---|---|---|
| **Panda Video** | Escolha da biblioteca, ou cole o link do player | Boa: player próprio, dificulta download |
| **YouTube não listado** | O link normal (`watch?v=...`) | **Nenhuma:** quem tiver o link assiste sem passar pelo seu login |
| **Vimeo** | O link do vídeo | Depende das permissões que você configurar lá |
| **Google Drive** | O link de compartilhar | **Nenhuma**, e o arquivo precisa estar como "qualquer pessoa com o link" |
| **Loom** | O link de compartilhar | **Nenhuma** |

**A capa da aula** fica no mesmo formulário, logo abaixo do vídeo. Você sobe
um PNG ou JPG do seu computador (até 4 MB, 16:9 — 1280×720 vai bem) e vê a
prévia antes de salvar. Ela aparece no card da aluna e também na página da
aula, na frente do player: enquanto ninguém clica, é a sua capa que está ali,
não o quadro que a hospedagem escolheu. Quando o vídeo vem do Panda, esse
campo já vem preenchido com a capa de lá — subir a sua por cima é opcional.

Você cola o endereço que copiou da barra do navegador e o painel faz o
resto: identifica de onde é, converte para o formato que o player entende,
avisa quando a hospedagem não protege o conteúdo, e tem um botão
**"testar aqui"** para você ver o vídeo rodando antes de publicar.

> **Por que a conversão importa:** o link que aparece na barra do navegador
> quase nunca é o link de *incorporar*. Colar o endereço da página do
> YouTube ou o link `/view` do Drive dá tela preta. O painel converte
> sozinho — mas vale saber que é isso que está acontecendo.

**A recomendação honesta:** comece com o que você já tem. Se as aulas estão
no Drive, use o Drive e coloque o curso no ar hoje. Quando o produto estiver
vendendo, migre para o Panda — o campo é o mesmo, você só troca o link.

---

## Passo 6 · Conectar o Panda Video (opcional)

O sistema funciona sem isso: você pode colar o link de qualquer player no
campo do vídeo. Mas conectando, fica bem melhor.

1. No Panda: menu lateral → **Configurações → Avançado → "Gerar nova chave
   API"**. Copie a chave que aparecer.

   > ⚠️ **A armadilha:** essa tela tem outras chaves, e elas se parecem. A
   > chave de API é longa (~70 caracteres) e começa com `panda-`. Se você
   > copiar uma sequência de 64 caracteres só com números e letras de a-f, é
   > outra coisa — o Panda vai responder `401 Unauthorized` e a lista virá
   > vazia.

2. Coloque em `PANDA_VIDEO_TOKEN` no `.env.local`. Em desenvolvimento o Next
   relê esse arquivo sozinho; **no site publicado**, a variável precisa ser
   cadastrada no painel da Vercel e o projeto republicado.
3. No painel, ao criar uma aula, clique em **"escolher da minha biblioteca do
   Panda"**: o sistema lista seus vídeos e preenche o link do player, a capa e
   a duração sozinho.

### Por que isso importa mais do que parece

O link do player **não** se monta a partir do id do vídeo. O Panda entrega o
endereço pronto num campo separado (`video_player`). Quem tenta deduzir
a URL acaba com um botão que não abre nada — e é o erro mais comum de quem
integra o Panda pela primeira vez.

Deixando o sistema perguntar para a API, ele lê o campo certo e o erro
simplesmente não acontece.

---

## Passo 7 · Cadastrar uma aluna

No painel, aba **Alunas → nova aluna**. Ao salvar, aparece na tela um **link
de acesso**: é com ele que ela cria a própria senha e entra. Copie e mande por
onde a sua aluna de fato lê — na prática, WhatsApp. Tem um botão de "copiar
mensagem pronta" que já monta o texto do convite.

Você nunca digita senha por ninguém, e isso é de propósito: ninguém pode dizer
depois que você sabia a senha dela.

O link vale por tempo limitado e some depois de usado. Se ela demorar, o botão
**link de acesso**, ao lado do nome dela na lista, gera outro.

> **Por que link e não e-mail automático?** A função do Supabase que gera esse
> link (`generateLink`) devolve o link para quem chamou — ela não dispara
> e-mail. E o servidor de e-mail que vem junto com o Supabase é só para teste:
> tem limite baixo por hora e não entrega de forma confiável para quem não é
> membro do projeto. Para enviar de verdade, é preciso conectar um SMTP seu
> (Resend, SendGrid, SES) em **Authentication → Emails → SMTP Settings**.
>
> Enquanto você não conectar um SMTP, o botão **"esqueci minha senha"** da tela
> de login também não entrega e-mail nenhum. A aluna vê a mensagem de "link a
> caminho" e nada chega. Por isso a tela orienta ela a pedir um link novo para
> você — e por isso existe o botão **link de acesso** no seu painel. Se a sua
> turma for grande, conectar o SMTP deixa de ser opcional.

Abra uma **janela anônima** para ver a área dela sem perder o seu login.

---

## Deixar com a sua cara

Abra [`app/globals.css`](app/globals.css). As primeiras 15 linhas são a sua
marca: seis cores e duas fontes. Mude ali e o sistema inteiro muda, sem tocar
em nenhum outro arquivo.

```css
:root {
  --fundo: #131110;        /* fundo da página */
  --superficie: #1D1A18;   /* cards */
  --texto: #F5F0EA;
  --acento: #E5A54B;       /* a cor da sua marca: botões, destaques */
  --feito: #6FA86B;        /* "aula concluída" */
  --fonte-display: 'Bricolage Grotesque';
  --fonte-corpo: 'Inter';
}
```

Ou peça ao Claude Code:

> Troque a identidade visual deste projeto para a minha marca. Minha cor
> principal é [COR], meu fundo é [claro/escuro], e minhas fontes são [FONTES].
> Mexa só no `app/globals.css` e no `app/layout.tsx` — quero poder trocar de
> novo depois mudando um lugar só.

---

## Colocar no ar

1. Suba para o **seu** GitHub (o Claude Code faz o commit e cria o repositório).
2. Importe no [Vercel](https://vercel.com).

   > Se o seu repositório estiver dentro de uma **organização** do GitHub, a
   > Vercel pode não conseguir se conectar a ele. Nesse caso publique pela
   > linha de comando: `npx vercel link` e depois `npx vercel --prod`. Funciona
   > igual; o que muda é que cada publicação é um comando em vez de um
   > `git push`.

3. **Antes do primeiro build**, cadastre as variáveis de ambiente no painel da
   Vercel, uma por uma. O `.env.local` não sobe junto — é aqui que quase todo
   mundo quebra na primeira vez.

4. **Desligue a "Vercel Authentication".** Este é o passo que ninguém espera:
   projeto novo na Vercel nasce com uma proteção que só deixa entrar quem
   estiver logado na **sua** conta da Vercel. Sua aluna clica no link e cai na
   tela de login da *Vercel*, não na sua.

   Vá em **Settings → Deployment Protection**, mude **Vercel Authentication**
   para **Disabled** e salve.

   Isso não abre o seu conteúdo: quem protege as aulas é o login do próprio
   sistema, com a RLS do banco atrás. A parede da Vercel serve para site
   interno de time, não para área de membros.

5. No Supabase, em **Authentication → URL Configuration**, coloque o domínio da
   Vercel em **Site URL**, e adicione `https://seu-dominio.vercel.app/**` em
   **Redirect URLs**. Sem isso, o link de acesso da aluna perde o caminho e ela
   cai na raiz do site em vez da tela de criar senha.

---

## Como o sistema decide quem vê o quê

**Uma tela de login só. Quem você é decide o que você vê.**

Depois que a pessoa entra, [`lib/auth.ts`](lib/auth.ts) pergunta ao banco:

```
entrou com e-mail e senha
  ↓
está na tabela admins?            → painel da dona
está em alunas, com status ativa? → área da aluna
não está em lugar nenhum          → volta pro login
```

Essa função não olha nada que veio do navegador. Nem endereço, nem
formulário, nem cookie. Só o que está gravado no banco.

### Os dois cadeados

| Cadeado | Onde mora | Serve para |
|---|---|---|
| **da aula** | coluna `aulas.liberado` | Aula que ainda vai ser gravada, bônus que abre depois |
| **do módulo** | `modulos.numero` vs `alunas.modulo_atual` | Liberar o curso em etapas, no ritmo de cada aluna |

E os dois vivem **no banco**, não na tela. A policy de `aulas` em
`002_rls.sql` não tem `using (true)`. Se tivesse, a tela continuaria bonita,
o cadeado continuaria aparecendo — e qualquer aluna conseguiria puxar o curso
inteiro abrindo o console do navegador.

O link do vídeo tem uma trava a mais, em `004_link_do_video.sql`: a coluna
`video_url` é invisível para o navegador. Quem lê é o servidor, e só depois de
conferir que a aula está liberada.

E tem uma pegadinha do Postgres que vale guardar, porque ela engana: **revogar
uma coluna solta não funciona se o papel já tem o direito sobre a tabela
inteira** — e é assim que o Supabase cria toda tabela nova. O banco emite um
aviso e não revoga nada. Para travar coluna de verdade, o caminho é sempre o
mesmo: `revoke` na tabela toda, depois `grant` coluna por coluna, deixando de
fora a que você quer esconder. É o que a `004` faz com `video_url` e o que a
`002` faz com `status` e `modulo_atual`.

---

## Mapa dos arquivos

```
supabase/migrations/     as cinco migrations, na ordem
lib/auth.ts              ← o coração: descobre o papel e roteia
lib/api.ts               porteiro das rotas do painel
middleware.ts            rede de segurança (não é a trava principal)

app/login/               a tela de entrada, única para todo mundo
app/definir-senha/       onde a aluna cria a senha dela (lê o link de acesso)
app/aulas/               a área da aluna: grade com cadeados
app/aulas/[id]/          o player + "marcar como concluída"
app/admin/               o painel: aulas e alunas

app/api/admin/panda/     lista os seus vídeos do Panda
app/api/admin/capa/      recebe a imagem de capa que você sobe
app/api/admin/convite/   gera um link de acesso novo para uma aluna

components/PlayerAula    a capa na frente do vídeo, até alguém clicar
components/Miniatura     a capa da aula (desenha uma quando não há imagem)
components/CardAula      os três estados: disponível, concluída, travada
app/globals.css          ← a sua marca mora nas primeiras 15 linhas
```

---

## Antes de vender acesso

- [ ] RLS ligada em **todas** as tabelas (o Supabase avisa na lista de tabelas)
- [ ] Nenhuma policy com `using (true)` onde deveria ter condição
- [ ] A aluna não escreve nas colunas que definem o acesso dela. Rode no SQL
      Editor e espere `false, false`:
      `select has_column_privilege('authenticated','public.alunas','modulo_atual','UPDATE'),
              has_column_privilege('authenticated','public.alunas','status','UPDATE');`
- [ ] O link do vídeo está fora do alcance do navegador, **nos dois papéis**.
      Rode e espere `false, false`:
      `select has_column_privilege('authenticated','public.aulas','video_url','SELECT'),
              has_column_privilege('anon','public.aulas','video_url','SELECT');`
- [ ] A `service_role` não aparece em nenhum arquivo com `'use client'`
- [ ] Logada como aluna, tentar abrir `/admin/aulas` na barra de endereço → barra
- [ ] Deslogada, tentar abrir `/aulas` → cai no login
- [ ] O domínio de produção configurado no Supabase (Site URL + Redirect URLs)
- [ ] A **Vercel Authentication desligada** — abra o site numa janela anônima
      e confirme que você vê a sua tela de login, não a da Vercel

Ou peça a auditoria ao Claude Code:

> Faça uma auditoria de segurança deste projeto antes de eu vender acesso.
> Confira: toda tabela com RLS; nenhuma policy com `using (true)` indevido;
> a service_role fora de arquivos de cliente; toda página de `/admin`
> conferindo o papel no servidor; nenhum caminho para alguém se tornar admin
> sozinho; a coluna `video_url` fora do grant de select; e nenhuma coluna que
> define acesso (`status`, `modulo_atual`) gravável pela aluna — lembrando que
> revoke de coluna não faz efeito se o grant existe na tabela inteira. Mostre
> arquivo, linha e correção, mas não corrija ainda.
