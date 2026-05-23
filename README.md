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

## Notificações e Cron

O projeto inclui um Vercel Cron diário em `vercel.json` que chama:

```txt
/api/check-price-alerts
```

Configure estas variáveis server-side na Vercel:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRON_SECRET=use_a_long_random_secret
CRON_MAX_DEALS=80
```

O cron verifica os jogos monitorados, busca o preço atual na CheapShark, atualiza `monitored_games` e cria registros em `notifications` quando houver queda de preço.

## Segurança

Nunca coloque `service_role`, senha do Postgres, JWT secret ou `sb_secret_*` no frontend. Use apenas URL pública e publishable/anon key.
