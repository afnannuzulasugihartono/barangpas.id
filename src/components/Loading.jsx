export default function Loading({ label = 'Memuat...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 border-4 border-[#FFE4EC] border-t-[#FF6FA5] rounded-full animate-spin" />
      <p className="text-sm text-[#B98599] font-medium">{label}</p>
    </div>
  );
}
