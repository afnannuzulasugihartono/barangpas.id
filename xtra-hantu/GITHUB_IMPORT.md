# XTRA HANTU — MVP staging

Source bundle untuk **XTRA HANTU — Paste 300 Link Detector**.

Branch ini sengaja terisolasi dari `main` agar website `barangpas.id` yang aktif tidak berubah.

## Isi bundle

`xtra-hantu.zip` berisi project Vite + React + TypeScript + Tailwind dan Vercel Edge Function `/api/check`.

Setelah diekstrak, struktur utamanya:

- `src/App.tsx`
- `src/lib/parseShopee.ts`
- `api/check.ts`
- `vite.config.ts`
- `vercel.json`
- `.env.example`
- `README.md`

## Environment production

Jangan commit secret. Isi di Vercel Project Settings:

- `SHOPEE_AFFILIATE_APP_ID`
- `SHOPEE_AFFILIATE_SECRET`
- `PRO_ACCESS_KEY` (opsional)
- `VITE_LYNK_PAYWALL_URL`

Target domain: `hantu.barangpas.id`.
