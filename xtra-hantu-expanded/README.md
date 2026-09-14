# XTRA HANTU 👻

Paste sampai 300 link Shopee dan deteksi produk yang masih hidup tetapi tidak lagi punya Komisi XTRA.

## Arsitektur MVP

- Frontend: Vite + React + TypeScript + Tailwind CSS v4.
- Backend: 1 Vercel Edge Function di `api/check.ts`.
- Tanpa login, tanpa Supabase, tanpa database user.
- History lokal disimpan di `localStorage`.
- Hasil scan bisa dibagikan ke WhatsApp lewat `wa.me` dengan pesan siap kirim; tanpa login tambahan dan tanpa WhatsApp Business API.
- Free 30 link, Pro sampai 300 link.
- Response backend memakai NDJSON streaming supaya Edge Function bisa mengirim byte pertama segera dan UI mendapat progress real-time.

## Kenapa ada Affiliate Open API?

`/api/v4/item/get` bagus untuk metadata produk tetapi field XTRA bukan kontrak schema yang dapat diandalkan. Untuk akurasi utama, backend mendukung Shopee Affiliate Open API Indonesia (`productOfferV2`) dan membaca `sellerCommissionRate`.

Tambahkan dua environment variable di Vercel:

```bash
SHOPEE_AFFILIATE_APP_ID=...
SHOPEE_AFFILIATE_SECRET=...
```

Tanpa dua variable ini aplikasi tetap jalan memakai fallback `item/get` + HTML, tetapi confidence bisa lebih rendah.

## Jalankan lokal

```bash
npm install
npm run dev
```

## Deploy ke Vercel

1. Push folder ini ke GitHub.
2. Buka Vercel → Add New → Project → Import repository.
3. Framework akan terdeteksi sebagai Vite. Klik Deploy.
4. Tambahkan env vars di Project Settings → Environment Variables:
   - `SHOPEE_AFFILIATE_APP_ID`
   - `SHOPEE_AFFILIATE_SECRET`
   - opsional `PRO_ACCESS_KEY`
   - `VITE_LYNK_PAYWALL_URL`
5. Redeploy.
6. Tambahkan custom domain `hantu.barangpas.id` di Domains lalu pasang DNS yang diberikan Vercel.

## Pro tanpa login

Untuk MVP, Lynk.id dapat me-redirect buyer ke:

```text
https://hantu.barangpas.id/?pro=KUNCI_YANG_SAMA_DENGAN_PRO_ACCESS_KEY
```

Frontend menyimpan key ke localStorage lalu membersihkan query string. Ini sengaja sederhana untuk validasi pasar; bukan DRM kuat.
