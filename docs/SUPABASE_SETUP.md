# Supabase setup

1. Create a Supabase project and open **SQL Editor**.
2. Run `supabase/migrations/202608220001_document_management.sql`. This creates the tables, indexes, public `documents` bucket, read-only public storage policy, and the five initial categories.
3. In Netlify, add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` under **Site configuration → Environment variables**. The service-role key is server-only; never prefix it with `VITE_` or expose it to browser code.
4. Keep the Phase 2 variables configured: `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, and `ALLOWED_ORIGINS`.
5. For local full-stack development, copy `.env.example` to `.env`, fill the values, and run `npm run dev:full`.

The migration enables RLS on application tables without browser policies. All database writes use the service-role key in authenticated Netlify Functions. Public users read published document metadata through `/api/library` and PDF bytes through the bucket's select-only policy.
