export default function ShieldLogo({ className = 'h-[52px] w-[46px]', strokeWidth = 2.4 }) {
  return (
    <svg viewBox="0 0 64 72" className={className} aria-hidden="true">
      <path
        d="M6 66 V30 A26 26 0 0 1 58 30 V66"
        fill="none"
        className="stroke-gold-soft"
        strokeWidth={strokeWidth}
      />
      <text
        x="32"
        y="46"
        textAnchor="middle"
        className="fill-sillar font-serif text-[26px]"
      >
        A
      </text>
      <circle cx="32" cy="12" r="2.4" className="fill-gold-soft" />
    </svg>
  );
}
