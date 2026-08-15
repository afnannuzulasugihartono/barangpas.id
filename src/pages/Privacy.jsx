import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#FFF9FB]">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-[#FF6FA5] mb-2">Kebijakan Privasi</h1>
        <p className="text-sm text-[#8A6373] mb-8">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <div className="space-y-6 text-sm leading-relaxed text-[#5A4650]">
          <section>
            <h2 className="font-semibold text-[#3D2E36] mb-2">1. Data yang Kami Kumpulkan</h2>
            <p>
              barangpas.id tidak mewajibkan pembuatan akun untuk pengunjung umum. Data yang kami
              kumpulkan terbatas pada:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Data klik/kunjungan pada tautan produk (untuk mengukur produk mana yang diminati, secara agregat/anonim), digunakan untuk analitik internal kami.</li>
              <li>Data teknis standar dari peramban (browser), seperti jenis perangkat dan halaman yang diakses, untuk keperluan analitik dan keamanan situs.</li>
              <li>Untuk tim internal kami (admin), data login digunakan hanya untuk otorisasi akses ke dashboard pengelolaan konten.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[#3D2E36] mb-2">2. Yang TIDAK Kami Kumpulkan</h2>
            <p>
              Kami tidak meminta atau menyimpan data pembayaran, alamat pengiriman, maupun data
              pribadi sensitif lain dari pengunjung. Proses checkout dan pembayaran seluruhnya
              terjadi di platform marketplace pihak ketiga setelah Anda diarahkan (redirect) dari
              situs kami.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#3D2E36] mb-2">3. Bagaimana Data Digunakan</h2>
            <p>
              Data klik dan analitik digunakan untuk memahami produk/kategori yang paling diminati,
              guna menyempurnakan kurasi dan pengalaman situs. Data ini tidak kami jual ke pihak ketiga.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#3D2E36] mb-2">4. Tautan & Layanan Pihak Ketiga</h2>
            <p>
              Situs ini berisi tautan afiliasi menuju marketplace pihak ketiga (Shopee, TikTok Shop,
              Tokopedia, Lazada, dsb). Setelah Anda mengklik tautan tersebut, kebijakan privasi
              platform tujuan yang berlaku, bukan kebijakan privasi kami. Kami menyarankan Anda
              membaca kebijakan privasi masing-masing platform tersebut.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#3D2E36] mb-2">5. Cookie</h2>
            <p>
              Kami dapat menggunakan cookie/local storage seperlunya untuk fungsi dasar situs (mis.
              status sesi admin). Anda dapat menonaktifkan cookie melalui pengaturan peramban Anda,
              meski beberapa fitur mungkin tidak berjalan optimal.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#3D2E36] mb-2">6. Keamanan Data</h2>
            <p>
              Kami menyimpan data yang kami kelola pada infrastruktur pihak ketiga tepercaya
              (penyedia database dan hosting) dengan praktik keamanan standar industri. Namun,
              tidak ada sistem yang sepenuhnya bebas risiko.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#3D2E36] mb-2">7. Perubahan Kebijakan</h2>
            <p>
              Kebijakan ini dapat diperbarui sewaktu-waktu; perubahan berlaku sejak dipublikasikan
              di halaman ini.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#3D2E36] mb-2">8. Kontak</h2>
            <p>
              Pertanyaan seputar privasi dapat disampaikan melalui Instagram atau WhatsApp
              barangpas.id yang tertera di footer situs.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
