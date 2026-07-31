# barangpas

**barangpas** is a mobile-first "link in bio" affiliate storefront built for
Instagram-driven affiliate marketing in Indonesia. Visitors arrive from an
Instagram bio link, story, or DM automation and browse a curated catalog of
products (cosmetics, fashion, gadgets, home goods). Each product redirects to
an external affiliate link (Shopee, TikTok Shop, Tokopedia, Lazada) — this is
a curated link directory with click tracking, **not** an e-commerce checkout.

## Tech Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- react-router-dom
- Supabase (Postgres) via `@supabase/supabase-js`
- Vercel serverless functions (`api/` directory)

## Database Schema

| Table | Purpose |
|---|---|
| `products` | id, name, description, price, image_url, category, affiliate_platform (shopee/tiktok/tokopedia/lazada), affiliate_url, is_featured, is_active, created_at, click_count |
| `categories` | id, name, slug, icon |
| `click_logs` | id, product_id, clicked_at, referrer_source (tracks which IG Story/DM/bio link drove the click) |
| `admin_users` | id, username, password_hash, salt (scrypt-hashed admin credentials — never plaintext) |

## Environment Variables

These are required for the app to run. Supabase-related vars are provisioned
automatically by the platform (`.env` / `vercel.json`) — do not hand-edit them.

| Variable | Where used | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | frontend | Public Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | frontend | Public Supabase anon key |
| `NEXT_PUBLIC_SUPABASE_URL` | api/ | Same Supabase URL, used server-side |
| `SUPABASE_SERVICE_ROLE_KEY` | api/ | Service-role key, used server-side only (never exposed to the client) |
| `ADMIN_SESSION_SECRET` | api/, admin auth | **You must set this** in your Vercel project settings (or `.env` locally) — a long random string used to sign admin session tokens (HMAC-SHA256). If unset, a fallback dev secret is used (not safe for production). Generate one with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

### Admin credentials

Admin login uses `admin_users` table with **scrypt password hashing + a random
salt per user** — no plaintext passwords are ever stored or hardcoded in code.
A demo admin account was seeded:

- Username: `admin`
- Password: `BarangPas2024!`

Change this password by updating the `admin_users` row with a new
scrypt hash + salt (see `src/lib/adminAuth.js` for the hashing helper).

## Instagram Source Tracking

Links shared from Instagram can append a `?src=` query parameter, e.g.:

- `https://barangpas.id/produk/12?src=story`
- `https://barangpas.id/produk/12?src=dm`
- `https://barangpas.id/produk/12?src=bio`

The value is captured on page load (`SourceContext`), persisted for the
session, and sent along with every `POST /api/track-click` call, stored in
`click_logs.referrer_source`. Admin analytics aggregates clicks by source.

## API Routes

- `GET /api/products?category=&featured=&admin=` — list products (public sees only active products; `admin=true` bypasses this, requires no filter change but is intended for the authenticated dashboard)
- `GET /api/product-detail?id=` — single product
- `GET /api/categories` — list categories
- `POST /api/track-click` — `{ product_id, referrer_source }` → logs click, increments `click_count`, returns `{ affiliate_url }`
- `POST /api/admin-login` — `{ username, password }` → `{ token, username }`
- `POST/PUT/DELETE /api/products` — admin CRUD, requires `Authorization: Bearer <token>`
- `GET /api/admin-analytics` — click analytics per product + source breakdown, requires `Authorization: Bearer <token>`

## Custom Domain (barangpas.id)

The app has no hardcoded localhost or preview URLs anywhere in the codebase —
all links are relative (`/api/...`, `/produk/:id`, etc.) and Open Graph tags
read `window.location.href` at runtime. To connect `barangpas.id`:

1. In the Vercel dashboard, open this project → **Settings → Domains**.
2. Add `barangpas.id` (and optionally `www.barangpas.id`).
3. Point your domain's DNS `A`/`CNAME` records to Vercel as instructed in the dashboard.
4. No code changes are required — the app works identically on any domain.

## Local Development

```bash
npm install
npm run dev
```

## Build & Deploy

```bash
npm run build
```

Deploy via Vercel. Ensure `ADMIN_SESSION_SECRET` is set in the Vercel project's
Environment Variables before going to production.
