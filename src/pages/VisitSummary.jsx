import { Printer } from "lucide-react";
import { Doodle } from "../components/art/Doodles";
import { Button } from "../components/ui/Button";
import { useAppState } from "../context/AppState";
import { evaluateCare } from "../lib/careEngine";
import { formatDisplayDate } from "../lib/dates";
import { buildVisitSummary } from "../lib/visitSummary";

export function VisitSummaryPage() {
  const { t, lang, settings, periods, logs, analysis } = useAppState();
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const guidance = evaluateCare({
    periods,
    logs,
    prediction: analysis.prediction,
    ageGroup: settings.ageGroup,
    lang,
  });
  const summary = buildVisitSummary({
    periods,
    logs,
    prediction: analysis.prediction,
    guidance,
    lang,
  });
  const flags = [...guidance.cards].sort((a, b) => Number(b.severity === "urgent") - Number(a.severity === "urgent"));

  return (
    <div className="page-enter mx-auto max-w-3xl space-y-4">
      <div className="no-print flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Doodle kind="notebook" className="h-12 w-12 shrink-0" />
          <h1 className="font-display text-3xl">{t("visit.title")}</h1>
        </div>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          {t("visit.print")}
        </Button>
      </div>
      {settings.isDemo ? <p className="no-print rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-700">{t("today.demoBanner")}</p> : null}

      <article className="print-sheet rounded-2.5xl bg-white p-5 shadow-card ring-1 ring-lavender-100 sm:p-6">
        <p className="text-xs uppercase tracking-wide text-lavender-500">CycleCare</p>
        <h2 className="mt-1 font-display text-2xl">{t("visit.heading")}</h2>
        <p className="mt-1 text-sm text-ink-500">
          {t("visit.generated")} {formatDisplayDate(summary.generatedOn, locale)}
        </p>
        <p className="mt-3 rounded-2xl bg-cream-50 px-3 py-2 text-sm text-ink-700">{t("visit.notDiagnosis")}</p>

        <section className="mt-6">
          <h3 className="font-display text-xl">{t("visit.history")}</h3>
          <p className="mt-1 text-sm">
            {t("insights.medianCycle")}: {summary.medianLength ?? "—"}
            {summary.cycleLengths.length ? ` · ${summary.cycleLengths.join(" · ")}` : ""}
          </p>
          {summary.window ? (
            <p className="mt-1 text-sm">
              {t("today.nextWindow")}: {formatDisplayDate(summary.window.start, locale)} – {formatDisplayDate(summary.window.end, locale)} ({t("today.estimate")})
            </p>
          ) : null}
          <ul className="mt-2 space-y-1 text-sm">
            {summary.periods.map((period) => (
              <li key={period.id} className="rounded-xl bg-cream-50 px-3 py-1.5">
                {formatDisplayDate(period.startDate, locale)} – {formatDisplayDate(period.endDate, locale)} ({period.duration}{" "}
                {lang === "hi" ? "दिन" : "days"})
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-5">
          <h3 className="font-display text-xl">{t("visit.symptoms")}</h3>
          {summary.symptoms.length ? (
            <ul className="mt-2 flex flex-wrap gap-2 text-sm">
              {summary.symptoms.map(([id, count]) => (
                <li key={id} className="rounded-full bg-lavender-50 px-3 py-1">
                  {t(`log.symptomOpts.${id}`)} · {count}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-ink-500">—</p>
          )}
        </section>

        <section className="mt-5">
          <h3 className="font-display text-xl">{t("visit.pain")}</h3>
          <p className="mt-1 text-sm">
            {t("visit.maxPain")}: {summary.maxPain}/10
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {summary.painDays.slice(0, 12).map((row) => (
              <li key={row.date}>
                {formatDisplayDate(row.date, locale)}: {row.pain}/10{row.note ? ` — ${row.note}` : ""}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-5">
          <h3 className="font-display text-xl">{t("log.medicines")}</h3>
          <p className="mt-1 text-sm">{summary.medicines.length ? summary.medicines.join("; ") : "—"}</p>
        </section>

        <section className="mt-5">
          <h3 className="font-display text-xl">{t("visit.flags")}</h3>
          {flags.length ? (
            <ul className="mt-2 space-y-2 text-sm">
              {flags.map((card) => (
                <li
                  key={card.id}
                  className={`rounded-2xl px-3 py-2 ${card.severity === "urgent" ? "bg-rose-50 text-rose-900" : "bg-lavender-50"}`}
                >
                  <span className="font-medium">{card.severity === "urgent" ? t("care.urgent") : t("care.info")}</span>
                  <span className="mt-1 block">{card.noticed}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-ink-500">—</p>
          )}
        </section>

        <section className="mt-5">
          <h3 className="font-display text-xl">{t("visit.questions")}</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            {summary.questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        </section>
      </article>
    </div>
  );
}
