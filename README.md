# barangpas.id

Web etalase affiliate — "Pintu 2" dari sistem 3 pintu (DM Otomatis + Web Etalase + Story Link).

## Menjalankan lokal
```
npm install
npm run dev
```
Buka http://localhost:3000

## Edit produk
Edit file `data/products.json`. Tiap produk:
```json
{
  "id": "004",
  "title": "Nama Produk",
  "category": "Kategori",
  "platform": "shopee",  // shopee | tiktok | lazada | tokopedia
  "image": "https://url-gambar.jpg",
  "url": "https://link-affiliate-kamu"
}
```

## Deploy ke Vercel + domain barangpas.id (Hari 1: 27–28 Juli)

1. Push folder ini ke repo GitHub baru (bisa lewat GitHub Desktop atau `git init && git add . && git commit -m "init" && git push`).
2. Buka https://vercel.com → New Project → Import repo GitHub tadi. Vercel otomatis mendeteksi Next.js, tinggal klik Deploy.
3. Setelah deploy sukses, buka Project → Settings → Domains → tambahkan `barangpas.id`.
4. Vercel akan kasih instruksi DNS (biasanya A record ke `76.76.21.21` atau CNAME `cname.vercel-dns.com`). Masuk ke dashboard tempat kamu beli domain, tambahkan record itu di pengaturan DNS.
5. Tunggu propagasi DNS (biasanya 10–60 menit, kadang sampai beberapa jam). Vercel otomatis mengaktifkan SSL begitu DNS terverifikasi.

## Roadmap selanjutnya
- 29 Juli — Sambungkan ManyChat ke Instagram, buat trigger kata kunci "SPILL" / "KODE"
- 30 Juli — Isi 5–10 data produk asli di `data/products.json`, uji coba alur komen → Auto DM → Beli
- 31 Juli — Grand Launching: posting Reels/Feed perdana dengan CTA sistem 3 pintu
