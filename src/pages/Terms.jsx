import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#FFF9FB]">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-[#FF6FA5] mb-2">Syarat & Ketentuan</h1>
        <p className="text-sm text-[#8A6373] mb-8">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <div className="space-y-6 text-sm leading-relaxed text-[#5A4650]">
          <section>
            <h2 className="font-semibold text-[#3D2E36] mb-2">1. Tentang barangpas.id</h2>
            <p>
              barangpas.id ("kami") adalah media kurasi produk independen. Kami menyaring dan
              merekomendasikan produk dari berbagai marketplace berdasarkan kriteria editorial kami
              sendiri (rating penjual, jumlah ulasan, performa pengiriman, dan kewajaran harga).
              Kami bukan penjual, distributor, atau pihak yang memproduksi barang yang direview.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#3D2E36] mb-2">2. Sifat Konten & Link Afiliasi</h2>
            <p>
              Sebagian besar tautan produk di situs ini adalah <strong>tautan afiliasi</strong>. Jika Anda
              melakukan pembelian melalui tautan tersebut, kami dapat menerima komisi dari platform
              marketplace terkait (mis. Shopee, TikTok Shop, Tokopedia, Lazada), <strong>tanpa biaya
              tambahan apa pun bagi Anda</strong>. Keputusan produk mana yang kami tampilkan tidak
              dipengaruhi oleh besaran komisi.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#3D2E36] mb-2">3. Transaksi Ada di Pihak Ketiga</h2>
            <p>
              Semua transaksi pembelian, pembayaran, pengiriman, garansi, retur, dan layanan purna jual
              sepenuhnya menjadi tanggung jawab platform marketplace dan penjual terkait — bukan
              barangpas.id. Kami tidak memproses pembayaran maupun pengiriman barang.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#3D2E36] mb-2">4. Akurasi Informasi & Penilaian "BarangPas"</h2>
            <p>
              Label "BarangPas Tested" menandakan produk pernah dibeli/diuji langsung oleh tim kami.
              Label "BarangPas Curated" berarti penilaian disusun dari riset spesifikasi dan agregasi
              ulasan publik, tanpa pengujian fisik langsung. Skor dan verdict (Layak Dibeli/Pertimbangkan/
              Skip) mencerminkan opini editorial kami pada waktu penulisan dan dapat berubah seiring waktu.
              Harga, stok, dan spesifikasi produk mengikuti data terkini dari marketplace terkait dan dapat
              berbeda dari yang tertera di situs kami.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#3D2E36] mb-2">5. Penggunaan Situs</h2>
            <p>
              Anda setuju untuk tidak menyalahgunakan situs ini, termasuk namun tidak terbatas pada:
              scraping otomatis tanpa izin, upaya mengakses area admin tanpa otorisasi, atau tindakan
              yang mengganggu operasional situs.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#3D2E36] mb-2">6. Kekayaan Intelektual</h2>
            <p>
              Teks ulasan, skor, dan kurasi kategori di situs ini adalah karya barangpas.id. Gambar
              produk umumnya berasal dari marketplace/penjual terkait dan menjadi hak masing-masing
              pemilik.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#3D2E36] mb-2">7. Perubahan Ketentuan</h2>
            <p>
              Kami dapat memperbarui halaman ini sewaktu-waktu. Perubahan berlaku sejak dipublikasikan
              di halaman ini.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#3D2E36] mb-2">8. Kontak</h2>
            <p>
              Pertanyaan terkait ketentuan ini dapat disampaikan melalui Instagram atau WhatsApp
              barangpas.id yang tertera di footer situs.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
