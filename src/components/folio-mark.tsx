export function FolioMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="4" y="3" width="18" height="24" rx="2" fill="currentColor" opacity="0.18" />
      <rect x="9" y="6" width="18" height="24" rx="2" fill="currentColor" />
      <path d="M13 13h10M13 17h8M13 21h6" stroke="var(--color-primary-fg)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
