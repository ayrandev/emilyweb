# 🚀 Guia de Configuração do Supabase

Siga os passos abaixo para criar o seu banco de dados gratuito e conectar ao seu convite online.

---

### Passo 1: Criar a Conta e o Projeto
1. Acesse o site do [Supabase](https://supabase.com) e crie uma conta gratuita (você pode fazer login com sua conta do GitHub).
2. Clique em **New Project** (Novo Projeto).
3. Dê um nome ao seu projeto (por exemplo, `emy-web`) e defina uma senha segura para o banco de dados.
4. Escolha uma região geográfica próxima de você (por exemplo, `South America (São Paulo) - sa-east-1`).
5. Clique em **Create new project** e aguarde alguns minutos enquanto o Supabase prepara o seu banco de dados.

---

### Passo 2: Criar a Tabela e as Políticas de Segurança
Para que o site consiga salvar e ler os dados publicamente sem exigir login dos convidados, precisamos criar a tabela `party_guests` e configurar as políticas de acesso.

1. No menu lateral esquerdo do Supabase, clique no ícone **SQL Editor** (um ícone de folha de código `>_`).
2. Clique em **New query** (Nova consulta).
3. Copie o script SQL abaixo, cole no editor e clique no botão **Run** (ou aperte `Ctrl + Enter`):

```sql
-- 1. Criação da tabela de convidados
create table public.party_guests (
  id uuid default gen_random_uuid() primary key,
  chefe text not null,
  telefone text not null,
  email text not null,
  acompanhantes jsonb default '[]'::jsonb,
  "confirmedAt" timestamp with time zone default timezone('utc'::text, now()) not null,
  "reservedGiftId" text,
  "reservedGift" text
);

-- 2. Habilita o RLS (Row Level Security) na tabela
alter table public.party_guests enable row level security;

-- 3. Cria políticas para permitir que qualquer pessoa (usuário anon) possa inserir, ler e atualizar
create policy "Permitir inserções públicas" 
on public.party_guests for insert 
with check (true);

create policy "Permitir leitura pública" 
on public.party_guests for select 
using (true);

create policy "Permitir atualização pública" 
on public.party_guests for update 
using (true);

create policy "Permitir exclusão pública" 
on public.party_guests for delete 
using (true);
```

4. Você verá a mensagem `Success. No rows returned.` indicando que a tabela foi criada corretamente.

---

### Passo 3: Conectar o Banco ao Projeto
Agora você só precisa pegar as credenciais do seu projeto e colocar no arquivo de configuração do seu código.

1. No menu lateral esquerdo do painel do Supabase, clique no ícone de engrenagem **Project Settings** (Configurações do Projeto).
2. Clique na aba **API**.
3. Copie a informação do campo **Project URL** e coloque no seu arquivo [.env](file:///C:/Users/Flowit/emy-web/.env):
   ```env
   VITE_SUPABASE_URL=sua_url_copiada_aqui
   ```
4. Copie a chave anon (chave pública do tipo `public` / `anon`) localizada no campo **Project API keys** e coloque no seu arquivo [.env](file:///C:/Users/Flowit/emy-web/.env):
   ```env
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_copiada_aqui
   ```

---

### Passo 4: Testar!
Após salvar as chaves no seu arquivo [.env](file:///C:/Users/Flowit/emy-web/.env):
1. Se o seu servidor local estiver rodando, **reinicie o servidor** (pare com `Ctrl + C` e rode `npm run dev` novamente) para que as variáveis do `.env` sejam carregadas pelo Vite.
2. Faça um teste de confirmação de presença no navegador.
3. Acesse a página `/confirmados` do seu computador ou outro dispositivo. Todos os registros novos salvos de qualquer lugar agora aparecerão instantaneamente! 💖
