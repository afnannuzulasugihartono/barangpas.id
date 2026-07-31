export function formatRupiah(value) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(num)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export const PLATFORM_INFO = {
  shopee: { label: 'Shopee', color: '#EE4D2D', bg: '#FFF0EC' },
  tiktok: { label: 'TikTok Shop', color: '#161823', bg: '#FDE8F0' },
  tokopedia: { label: 'Tokopedia', color: '#42B549', bg: '#E9F9EC' },
  lazada: { label: 'Lazada', color: '#0F146D', bg: '#EAEBFB' },
};

export function platformInfo(platform) {
  return PLATFORM_INFO[platform] || { label: platform, color: '#9333ea', bg: '#F5E9FB' };
}
