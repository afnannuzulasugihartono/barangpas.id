import { Instagram, MessageCircle } from 'lucide-react';
import Logo from './Logo';
import CuratorSeal from './CuratorSeal';

export default function Footer() {
  return (
    <footer className="bg-[#FFF3F7] border-t border-[#FFE4EC] mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10 text-center">
        <div className="flex justify-center mb-2">
          <CuratorSeal size="sm" />
        </div>
        <Logo size="md" />
        <p className="mt-3 text-sm text-[#8A6373] max-w-md mx-auto">
          Kumpulan barang pas di hati, pas di kantong — semua rekomendasi favorit
          dari Instagram, terkurasi jadi satu tempat.
        </p>
        <div className="flex items-center justify-center gap-4 mt-5">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram barangpas" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#FF6FA5] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="https://wa.me" target="_blank" rel="noreferrer" aria-label="WhatsApp barangpas" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#FF6FA5] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
            <MessageCircle className="w-5 h-5" />
          </a>
        </div>
        <p className="mt-6 text-[11px] text-[#C79BAC]">
          © {new Date().getFullYear()} barangpas.id — Link afiliasi ini dapat menghasilkan komisi untuk kami tanpa biaya tambahan bagi Anda.
        </p>
        <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-[#D89AB0]">
          <a href="/terms" className="hover:text-[#FF6FA5] underline">Syarat & Ketentuan</a>
          <span>·</span>
          <a href="/privacy" className="hover:text-[#FF6FA5] underline">Kebijakan Privasi</a>
          <span>·</span>
          <a href="/admin/login" className="hover:text-[#FF6FA5] underline">Admin</a>
        </div>
      </div>
    </footer>
  );
}
