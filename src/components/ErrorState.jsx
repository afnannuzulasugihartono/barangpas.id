export default function ErrorState({ message = 'Terjadi kesalahan.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-4">
      <p className="text-4xl">😥</p>
      <p className="text-sm text-[#B9455B] font-medium max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 bg-[#FF6FA5] text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#FF4F91] transition-colors"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}
