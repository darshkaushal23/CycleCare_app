export function MeanTip({ t, children }) {
  if (!children) return null;
  return (
    <details className="mt-2 rounded-2xl bg-cream-50 px-3 py-2">
      <summary className="cursor-pointer text-base font-medium text-plum">{t("common.mean")}</summary>
      <p className="mt-2 text-base leading-relaxed text-ink-700">{children}</p>
    </details>
  );
}
