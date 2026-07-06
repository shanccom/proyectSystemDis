export default function ErrorAlert({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-granate/20 bg-granate/5 px-4 py-3 text-[0.88rem] text-granate">
      <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 flex-shrink-0 fill-granate/70" aria-hidden="true">
        <path d="M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM9 6a1 1 0 1 1 2 0v4a1 1 0 1 1-2 0V6Zm1 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      </svg>
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="-mr-1 -mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-granate/50 transition-colors hover:bg-granate/10 hover:text-granate focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
          aria-label="Cerrar"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
          </svg>
        </button>
      )}
    </div>
  );
}
