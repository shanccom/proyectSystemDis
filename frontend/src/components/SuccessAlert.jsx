export default function SuccessAlert({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gold/25 bg-gold/10 px-4 py-3 text-[0.88rem] text-ink">
      <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 flex-shrink-0 fill-gold" aria-hidden="true">
        <path d="M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm4.4 6.9-5 5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 0 1 1.06-1.06L9 11.44l4.47-4.47a.75.75 0 1 1 1.06 1.06Z" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
