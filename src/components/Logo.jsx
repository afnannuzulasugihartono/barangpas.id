export default function Logo({ size = 'md' }) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl md:text-5xl',
  };
  return (
    <span className={`font-heading ${sizes[size]} tracking-tight select-none`}>
      <span className="text-[#FF6FA5]">barang</span>
      <span className="text-[#2D2D2D]">pas</span>
      <span className="text-[#FFB6D0]">.</span>
    </span>
  );
}
