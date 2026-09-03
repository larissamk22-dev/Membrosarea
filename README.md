# Área de Membros

Projeto-referência das aulas do Clube: uma área de membros com login, cadeados
por aula e vídeo hospedado no Panda Video.

**Stack:** Next.js 14 · Supabase (banco + login) · Panda Video · Vercel

---

## Como colocar de pé (25 minutos)

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Vá em **Project Settings → API** e copie três coisas: a **URL**, a chave
   **anon** e a chave **service_role**.
3. Em **Authentication → Providers**, deixe ligado só e-mail e senha.
   Para testar sem esperar e-mail, desligue "Confirm email".
4. No **SQL Editor**, rode os arquivos de `supabase/migrations/` **nesta ordem**:

   | Arquivo | O que faz |
   |---|---|
   | `001_tabelas.sql` | Cria as cinco tabelas |
   | `002_rls.sql` | Liga as travas de segurança |
   | `003_conteudo_exemplo.sql` | Põe 3 módulos e 8 aulas de exemplo |
   | `004_link_do_video.sql` | Esconde o link do vídeo do navegador |

### 2. As chaves

```bash
cp .env.local.example .env.local
```

Preencha com o que você copiou. O `.env.local` **não vai para o GitHub** —
já está no `.gitignore`, e é justamente esse o trabalho dele.

### 3. Rodar

```bash
npm install
npm run dev
```

### 4. Criar a sua conta de dona

Não existe tela para isso, e é de propósito.

1. Supabase → **Authentication → Users → Add user**. Use o seu e-mail e uma senha.
2. Copie o **UID** que aparece na lista.
3. SQL Editor:

```sql
insert into admins (user_id, nome)
values ('COLE-O-UID-AQUI', 'Seu nome');
```

Entre em `localhost:3000` e você cai no painel.

### 5. Criar uma aluna de teste

No painel, aba **Alunas → nova aluna**. Ela recebe um e-mail para criar a
própria senha. Abra uma janela anônima para ver a área dela.

---

## O desenho em uma frase

**Uma tela de login só. Quem você é decide o que você vê.**

Depois que a pessoa entra, [`lib/auth.ts`](lib/auth.ts) pergunta ao banco quem
ela é, nesta ordem:

```
entrou com e-mail e senha
  ↓
está na tabela admins?   → painel da dona
está na tabela alunas?   → área da aluna
não está em lugar nenhum → volta pro login
```

Essa função não olha nada que veio do navegador. Nem parâmetro na URL, nem
campo de formulário. Só o que está gravado no banco.

---

## Os cadeados

São **dois**, e eles se somam:

| Cadeado | Onde mora | Serve para |
|---|---|---|
| **da aula** | coluna `aulas.liberado` | Aula que ainda vai ser gravada, bônus que abre depois |
| **do módulo** | `modulos.numero` vs `alunas.modulo_atual` | Liberar o curso em etapas, no ritmo de cada aluna |

E os dois vivem **no banco**, não na tela. Essa é a parte que importa: a
policy de `aulas` no `002_rls.sql` não tem `using (true)`. Se tivesse, a tela
continuaria bonita, o cadeado continuaria aparecendo — e qualquer aluna
conseguiria puxar o curso inteiro abrindo o console do navegador.

O link do vídeo tem uma trava a mais, em `004_link_do_video.sql`: a coluna
`video_url` é invisível para o navegador. Quem lê é o servidor, e só depois de
conferir que a aula está liberada.

---

## As três chaves e onde cada uma pode aparecer

| Chave | Pode ir para o navegador? | Onde usar |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | Em qualquer lugar |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Em qualquer lugar. Quem protege os dados é a RLS, não o segredo da chave |
| `SUPABASE_SERVICE_ROLE_KEY` | **Nunca** | Só em `app/api/**` e em Server Components. Ela ignora todas as travas |

Se a `service_role` aparecer em arquivo com `'use client'` no topo, ou em
variável com `NEXT_PUBLIC_` no nome, ela vazou — e quem tiver ela lê o banco
inteiro. Nesse caso: gere uma nova no Supabase imediatamente.

---

## Mapa dos arquivos

```
supabase/migrations/     as quatro migrations, na ordem
lib/auth.ts              ← o coração: descobre o papel e roteia
lib/api.ts               porteiro das rotas do painel
middleware.ts            rede de segurança (não é a trava principal)

app/login/               a tela de entrada, única para todo mundo
app/aulas/               a área da aluna: grade com cadeados
app/aulas/[id]/          o player + "marcar como concluída"
app/admin/               o painel: aulas e alunas
app/api/admin/           tudo que escreve passa por aqui, no servidor

components/Miniatura     a capa da aula (com capa gerada quando não há imagem)
components/CardAula      os três estados: disponível, concluída, travada
app/globals.css          ← a sua marca mora nas primeiras 15 linhas
```

---

## Trocar pela sua identidade visual

Abra [`app/globals.css`](app/globals.css) e mude os valores do `:root`. São
seis cores e duas fontes. O sistema inteiro muda de cara sem tocar em mais
nenhum arquivo.

---

## Antes de vender acesso

- [ ] RLS ligada em **todas** as tabelas (o Supabase avisa na lista de tabelas)
- [ ] Nenhuma policy com `using (true)` onde deveria ter condição
- [ ] `service_role` não aparece em nenhum arquivo de cliente
- [ ] Logada como aluna, tentar abrir `/admin/aulas` na barra de endereço → barra
- [ ] Deslogada, tentar abrir `/aulas` → cai no login
- [ ] No Supabase, **Authentication → URL Configuration** com o domínio de
      produção (senão o e-mail de senha aponta para `localhost`)

---

## Notas de ambiente

Nesta máquina o `npm install` pode falhar por conflito de dependências ou por
permissão no cache. Se acontecer:

```bash
npm install --legacy-peer-deps
```

E, se der erro de `EACCES` no cache:

```bash
npm install --legacy-peer-deps --cache /tmp/npm-cache
```
