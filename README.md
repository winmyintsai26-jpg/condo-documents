# Condo Documents

A public condominium document portal with a secure single-administrator area. The public React application remains a client-side Vite SPA. Authentication runs only in Netlify Functions.

## Authentication architecture

- One administrator; no registration, email identity, profiles, or roles.
- `ADMIN_USERNAME` and a bcrypt password hash live only in server environment variables.
- Login returns a signed, eight-hour session in an `HttpOnly`, `SameSite=Strict` cookie (`Secure` in production).
- Login and logout require a same-origin request. `ALLOWED_ORIGINS` supports explicit production origins.
- Failed logins are rate-limited per client address in each warm function instance.
- React checks `/api/auth/session`; it never stores credentials, hashes, or tokens.
- Future document-write functions should call the shared server-side session and origin guards in `netlify/functions/_shared/auth.ts`.

## Local setup

Requires Node.js 20.19+ or 22.12+.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and replace every placeholder. Never commit `.env`.

3. Generate the password hash without placing the plaintext password in shell history:

   ```bash
   npm run auth:hash
   ```

   Copy the complete generated `ADMIN_PASSWORD_HASH='...'` line into `.env`. The single quotes preserve every `$` character in the bcrypt hash. Do not add backslashes before `$`.

   To verify the private local values without printing them, run `npm run auth:diagnose`. To test the exact values injected by Netlify Dev, run `npx netlify dev:exec npm run auth:diagnose -- --injected`.

4. Generate a session secret, for example:

   ```bash
   openssl rand -base64 48
   ```

5. Install the Netlify CLI once if needed, then start the frontend and functions together:

   ```bash
   npm install -g netlify-cli
   npm run dev:full
   ```

   Use the local URL printed by Netlify. Plain `npm run dev` starts only the public Vite frontend; authentication endpoints require `npm run dev:full`.

## Routes

- `/` — public document center
- `/admin/login` — administrator sign-in
- `/admin` — protected dashboard
- `/admin/documents` — protected document list

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Production configuration

In Netlify, add `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, and `ALLOWED_ORIGINS` under Site configuration → Environment variables. Set `ALLOWED_ORIGINS` to the final HTTPS site origin. Never create variables prefixed with `VITE_` for authentication secrets.

Phase 3 will connect document upload, edit, replacement, deletion, and category management. Those server functions must verify both the authenticated session and same-origin request before changing data.
