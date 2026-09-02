# Condo Documents

A production-ready condominium document portal with a public library, a secure single-administrator area, and a read-only shared-owner portal. The frontend is a React/Vite SPA. Authentication, document management, and Supabase access run only in Netlify Functions.

## Requirements

- Node.js 20.19+ or 22.12+
- A Supabase project
- A Netlify account and Netlify CLI for full-stack local development

## 1. Clone and install

```bash
git clone https://github.com/winmyintsai26-jpg/condo-documents.git
cd condo-documents
npm install
```

## 2. Create and configure Supabase

Create a new Supabase project. In its SQL Editor, run:

```text
supabase/migrations/202608220001_document_management.sql
```

The migration creates the tables, indexes, triggers, five starter categories, `documents` storage bucket, public PDF read policy, RLS configuration, and explicit `service_role` table privileges. See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).

## 3. Configure the private local environment

Copy `.env.example` to `.env` and replace every placeholder. `.env` is ignored by Git.

Required variables:

```text
ADMIN_USERNAME
ADMIN_PASSWORD_HASH
OWNER_USERNAME
OWNER_PASSWORD_HASH
SESSION_SECRET
ALLOWED_ORIGINS
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Generate each bcrypt hash without putting the password in shell history:

```bash
npm run auth:hash
npm run auth:hash -- --owner
```

Copy both complete single-quoted output lines into `.env`. Each password must contain at least 12 characters. The quotes preserve the `$` characters in the bcrypt hashes. Do not add backslashes before `$`.

Generate a session secret containing at least 32 characters:

```bash
openssl rand -base64 48
```

Check the local credential configuration without printing any secret:

```bash
npm run auth:diagnose
npm run auth:diagnose -- --owner
```

## 4. Run locally

Install Netlify CLI once if necessary, then run the frontend and functions together:

```bash
npm install -g netlify-cli
npx netlify dev
```

Use the full application URL printed by Netlify, normally `http://localhost:8888`. Plain `npm run dev` starts only Vite and does not provide the Netlify Functions.

For local Netlify Dev, use `ALLOWED_ORIGINS=http://localhost:8888`.

## 5. Verify before deployment

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The production build command is `npm run build`; Netlify publishes `dist` and bundles functions from `netlify/functions`.

## 6. Deploy to Netlify

1. Import the GitHub repository into Netlify.
2. Confirm the build command is `npm run build` and publish directory is `dist`.
3. Under **Site configuration → Environment variables**, add all eight required variables listed above.
4. Keep both password hashes, `SESSION_SECRET`, and `SUPABASE_SERVICE_ROLE_KEY` server-only. Never create `VITE_` versions of them.
5. Deploy once to obtain the final Netlify site URL.
6. Change production `ALLOWED_ORIGINS` to that exact HTTPS origin, with no path or trailing slash—for example, the real `https://your-site.netlify.app` origin assigned by Netlify.
7. Trigger a new deployment after updating the origin.

If a custom domain is added later, include each permitted exact HTTPS origin as a comma-separated value, then redeploy. Do not hardcode either origin in source code.

## Routes

- `/` — public document center
- `/admin/login` — administrator sign-in
- `/admin` — protected dashboard
- `/admin/documents` — protected document management
- `/admin/categories` — protected category management
- `/owner/login` — shared owner sign-in
- `/owner` — protected read-only owner document library

`netlify.toml` sends API routes to their Netlify Functions before the final SPA fallback. Direct refreshes of valid React routes therefore return `index.html` and React Router restores the route.

## Authentication and security

- One administrator and one shared owner credential; no registration, profiles, email authentication, invitations, or individual owner accounts.
- Password verification uses bcrypt on the server.
- Login creates a signed, approximately eight-hour `HttpOnly`, `SameSite=Strict` session cookie (`Secure` in production).
- Login and mutations require an allowed same-origin request.
- Failed logins are rate-limited per client address in each warm function instance.
- React never receives the password hash, session secret, or Supabase service-role key.
- Admin mutation functions verify both the signed session and request origin.
- Admin and owner sessions use separate cookies, exact JWT roles, and distinct subjects. Owner sessions cannot authorize admin APIs.
- The owner library API requires an owner session and returns published documents only.
- Public metadata contains published documents only.
- PDF uploads and replacements are limited to 15 MB and validated by MIME type and PDF signature.
- Category deletion is rejected while documents still reference the category.

The Supabase `documents` bucket remains public. The owner portal itself is authenticated, but direct Supabase PDF URLs are not confidential while that bucket remains public.

## Production verification checklist

After the final deployment:

1. Open `/` and confirm categories, search, counts, and a published PDF.
2. Refresh `/admin/login`, `/admin`, `/admin/documents`, and `/admin/categories` directly.
3. Confirm signed-out admin routes redirect to `/admin/login`.
4. Sign in, upload a PDF, edit it, publish/unpublish it, replace it, and delete a test document.
5. Create, edit, reorder, and delete an empty test category; confirm an occupied category cannot be deleted.
6. Log out and confirm protected routes require login again.
7. Confirm an unpublished document is absent from the public library.
