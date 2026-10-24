import { Printer } from "lucide-react";
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

  return (
    <div className="page-enter mx-auto max-w-3xl space-y-4">
      <div className="no-print flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl">{t("visit.title")}</h1>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          {t("visit.print")}
        </Button>
      </div>
      {settings.isDemo ? <p className="no-print rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-700">{t("today.demoBanner")}</p> : null}

      <article className="print-sheet rounded-2.5xl bg-white p-6 shadow-card ring-1 ring-lavender-100">
        <p className="text-xs uppercase tracking-wide text-lavender-500">CycleCare</p>
        <h2 className="mt-1 font-display text-2xl">{t("visit.heading")}</h2>
        <p className="mt-1 text-sm text-ink-500">
          {t("visit.generated")} {formatDisplayDate(summary.generatedOn, locale)}
        </p>
        <p className="mt-3 text-sm text-ink-700">{t("visit.notDiagnosis")}</p>

        <section className="mt-6">
          <h3 className="font-display text-xl">{t("visit.history")}</h3>
          <p className="mt-1 text-sm">
            {t("insights.medianCycle")}: {summary.medianLength ?? "—"}
            {summary.cycleLengths.length ? ` · ${summary.cycleLengths.join(" · ")}` : ""}
          </p>
          {summary.window ? (
            <p className="mt-1 text-sm">
              {t("today.nextWindow")}: {summary.window.start} – {summary.window.end} ({t("today.estimate")})
            </p>
          ) : null}
          <ul className="mt-2 text-sm">
            {summary.periods.map((period) => (
              <li key={period.id}>
                {period.startDate} – {period.endDate} ({period.duration} {lang === "hi" ? "दिन" : "days"})
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-5">
          <h3 className="font-display text-xl">{t("visit.symptoms")}</h3>
          {summary.symptoms.length ? (
            <ul className="mt-2 text-sm">
              {summary.symptoms.map(([id, count]) => (
                <li key={id}>
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
          <ul className="mt-2 text-sm">
            {summary.painDays.slice(0, 12).map((row) => (
              <li key={row.date}>
                {row.date}: {row.pain}/10{row.note ? ` — ${row.note}` : ""}
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
          <ul className="mt-2 text-sm">
            {guidance.cards.map((card) => (
              <li key={card.id}>
                [{card.severity}] {card.noticed}
              </li>
            ))}
          </ul>
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
