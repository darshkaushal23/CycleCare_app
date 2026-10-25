import { Check } from "lucide-react";
import { Doodle } from "../art/Doodles";

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
      className={`min-h-12 rounded-2xl px-4 py-3 text-left text-sm ring-1 motion-safe:transition duration-200 ${
        selected
          ? "bg-lavender-100 text-plum ring-2 ring-lavender-400 shadow-soft"
          : "bg-cream-50 text-ink-900 ring-lavender-200 hover:bg-lavender-50"
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
      className={`min-h-11 rounded-full px-3 text-sm ring-1 motion-safe:transition duration-200 ${
        selected
          ? "bg-lavender-100 text-plum ring-2 ring-lavender-400"
          : "bg-cream-50 text-ink-900 ring-lavender-200 hover:bg-lavender-50"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SelectCard({ selected, icon: Icon, doodle, children, className = "", ...props }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`relative flex min-h-[5rem] flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-3 text-center text-xs font-medium ring-1 motion-safe:transition duration-200 sm:text-sm ${
        selected
          ? "bg-lavender-100 text-plum ring-2 ring-lavender-400 shadow-soft"
          : "bg-cream-50 text-ink-900 ring-lavender-200 hover:bg-lavender-50"
      } ${className}`}
      {...props}
    >
      {selected ? <Check className="absolute right-1.5 top-1.5 h-3.5 w-3.5" aria-hidden="true" /> : null}
      {doodle ? <Doodle kind={doodle} className="h-9 w-9 shrink-0" /> : Icon ? <Icon className="h-5 w-5 shrink-0" aria-hidden="true" /> : null}
      <span className="leading-tight">{children}</span>
    </button>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      {label ? <span className="font-display text-lg text-ink-900">{label}</span> : null}
      {hint ? <p className="mt-1 text-sm text-ink-500">{hint}</p> : null}
      <div className={label || hint ? "mt-3" : ""}>{children}</div>
    </label>
  );
}
