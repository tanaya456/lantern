export function LanternIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v2M9 4h6" />
      <path d="M8 6h8l1 2v9l-1 2H8l-1-2V8z" />
      <path d="M7 8h10M7 17h10" />
      <path d="M12 10.5c1 1 1.4 1.9 1.4 2.7a1.4 1.4 0 0 1-2.8 0c0-.8.4-1.7 1.4-2.7z" />
      <path d="M9 21h6" />
    </svg>
  );
}

export default function Logo() {
  return (
    <span className="flex items-center gap-2 text-lg font-bold tracking-tight text-sage-900">
      <LanternIcon />
      Lantern
    </span>
  );
}
