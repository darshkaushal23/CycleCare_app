export function Card({ as: Tag = "section", className = "", children, ...props }) {
  return (
    <Tag className={`min-w-0 overflow-hidden rounded-2.5xl bg-white/90 p-5 shadow-card ring-1 ring-lavender-100 ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function CardKicker({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lavender-500">{children}</p>
  );
}

export function CardTitle({ children, className = "" }) {
  return <h2 className={`font-display text-xl font-medium text-ink-900 ${className}`}>{children}</h2>;
}
