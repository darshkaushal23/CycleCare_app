export function ChoiceGroup({ legend, hint, children }) {
  return (
    <fieldset className="space-y-3">
      <legend className="font-display text-lg text-ink-900">{legend}</legend>
      {hint ? <p className="text-sm text-ink-500">{hint}</p> : null}
      <div className="grid gap-3">{children}</div>
    </fieldset>
  );
}

export function ChoiceButton({ selected, children, className = "", ...props }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`min-h-12 rounded-2xl px-4 py-3 text-left text-sm transition ring-1 ${
        selected
          ? "bg-lavender-700 text-white ring-lavender-700 shadow-soft"
          : "bg-white/80 text-ink-900 ring-lavender-200 hover:bg-lavender-50"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Chip({ selected, children, className = "", ...props }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`min-h-11 rounded-full px-3 text-sm ring-1 transition ${
        selected
          ? "bg-lavender-700 text-white ring-lavender-700"
          : "bg-white text-ink-900 ring-lavender-200 hover:bg-lavender-50"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
