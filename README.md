# GameDealCentral

Aplicativo Vite + React para encontrar ofertas de jogos de PC, comparar preços e salvar jogos monitorados no Supabase.

## Configuração

1. Instale dependências:
   ```bash
   npm install
   ```

2. Configure as variáveis públicas do Supabase em `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_public_key
   ```

   O app também aceita os aliases de integração da Vercel:
   `GD_PUBLIC_SUPABASE_URL`, `GD_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
   `GAMEDEALBD_GD_PUBLIC_SUPABASE_URL` e
   `GAMEDEALBD_GD_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

3. Crie as tabelas no Supabase executando `supabase/schema.sql` no SQL Editor.

4. Rode localmente:
   ```bash
   npm run dev
   ```

## Segurança

Nunca coloque `service_role`, senha do Postgres, JWT secret ou `sb_secret_*` no frontend. Use apenas URL pública e publishable/anon key.
