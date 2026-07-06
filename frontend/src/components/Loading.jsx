export default function Loading({ text = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-8 py-16 text-ink-soft">
      <svg viewBox="0 0 48 48" className="h-10 w-10 animate-spin" aria-hidden="true">
        <circle cx="24" cy="24" r="20" fill="none" className="stroke-sillar-line" strokeWidth="4" />
        <path
          d="M24 4a20 20 0 0 1 20 20"
          fill="none"
          className="stroke-granate"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-[0.9rem]">{text}</span>
    </div>
  );
}
