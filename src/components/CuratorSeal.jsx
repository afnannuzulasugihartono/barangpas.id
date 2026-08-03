// Signature visual mark: a stamp-like seal that stands in for what barangpas
// actually does — filtering thousands of products down to picks you can
// trust. Reused small in the footer, larger (and rotated) in the hero.
export default function CuratorSeal({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-14 h-14 text-[8px]',
    md: 'w-24 h-24 text-[10px]',
    lg: 'w-32 h-32 text-xs',
  };

  return (
    <div
      className={`relative shrink-0 rounded-full border-2 border-dashed border-[#F2B84B] bg-white flex flex-col items-center justify-center text-center shadow-[0_6px_20px_rgba(242,184,75,0.25)] ${sizes[size]} ${className}`}
    >
      <span className="font-heading uppercase tracking-wide text-[#B9852E] leading-none">Kurasi</span>
      <span className="font-heading text-[#8A6373] leading-none mt-1">Terpercaya</span>
    </div>
  );
}
