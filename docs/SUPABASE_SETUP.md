# Supabase setup

## New project

1. Create a Supabase project and open **SQL Editor**.
2. Run `supabase/migrations/202608220001_document_management.sql` in full.
3. Confirm the `categories` and `documents` tables exist and the `documents` storage bucket was created.
4. Confirm the five starter categories appear.
5. Copy the project URL and service-role key into the server-side `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables.

The migration explicitly grants schema usage and table `select`, `insert`, `update`, and `delete` privileges to `service_role`. This is required for projects created with automatic table exposure disabled. No undocumented manual grant step should be necessary.

RLS remains enabled on both application tables and no browser table policies are created. The service-role key is used only by authenticated Netlify Functions. Document metadata is returned only after owner-session validation; browsers never query the tables directly.

The storage bucket is public so published PDF links can open directly. Its only browser policy is select access for objects in the `documents` bucket. Upload, replacement, and deletion use the server-side service role after authentication and same-origin checks.

## Existing project created from the earlier migration

It is safe to run these idempotent grants once in SQL Editor if the project was created before the migration was updated:

```sql
grant usage on schema public to service_role;
grant select, insert, update, delete on table public.categories to service_role;
grant select, insert, update, delete on table public.documents to service_role;
```

Do not grant table writes to `anon` or `authenticated`. Do not put the service-role key in React code or any variable beginning with `VITE_`.

## Netlify variables

Configure these under **Site configuration → Environment variables**:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ADMIN_USERNAME
ADMIN_PASSWORD_HASH
SESSION_SECRET
ALLOWED_ORIGINS
```

For local development, `ALLOWED_ORIGINS` is normally `http://localhost:8888`. For production, replace it with the exact final HTTPS Netlify origin after Netlify assigns the site URL, then redeploy.
