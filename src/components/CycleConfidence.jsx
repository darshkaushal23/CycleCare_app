import { Shield } from "lucide-react";
import { Card, CardKicker, CardTitle } from "./ui/Card";
import { buildConfidence } from "../lib/confidence";
import { formatDisplayDate } from "../lib/dates";

export function CycleConfidence({ analysis, ageGroup, lang, t, locale, showFertility = true }) {
  const conf = buildConfidence(analysis, { ageGroup, lang });

  return (
    <Card className="bg-gradient-to-br from-white to-lavender-50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <CardKicker>
            {t("today.confidence")} · {t("today.estimate")}
          </CardKicker>
          <CardTitle className="mt-2">{conf.label}</CardTitle>
        </div>
        <Shield className="h-5 w-5 text-lavender-500" aria-hidden="true" />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-700">{conf.detail}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-lavender-100">
          <p className="text-xs uppercase tracking-wide text-ink-500">{t("today.nextWindow")}</p>
          {conf.window ? (
            <p className="mt-2 font-display text-lg">
              {formatDisplayDate(conf.window.start, locale, { day: "numeric", month: "short" })}
              {" – "}
              {formatDisplayDate(conf.window.end, locale, { day: "numeric", month: "short" })}
            </p>
          ) : (
            <p className="mt-2 font-display text-lg">{t("today.noWindow")}</p>
          )}
        </div>
        <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-lavender-100">
          <p className="text-xs uppercase tracking-wide text-ink-500">{t("confidence.support")}</p>
          <p className="mt-2 font-display text-lg">
            {conf.cyclesSupporting} / {Math.max(conf.completeCycleCount, conf.cyclesSupporting)}
          </p>
          <p className="mt-1 text-xs text-ink-500">{t("confidence.supportHint")}</p>
        </div>
      </div>

      {conf.lengths.length ? (
        <p className="mt-4 text-sm text-ink-700">
          {t("today.variation")}: {conf.lengths.join(" · ")} {lang === "hi" ? "दिन" : "days"}
          {conf.range != null
            ? ` · ${t("confidence.spread")} ${conf.minLength}–${conf.maxLength} (${conf.range})`
            : ""}
        </p>
      ) : null}

      <ul className="mt-4 space-y-2 text-sm text-ink-700">
        {conf.why.map((line) => (
          <li key={line}>• {line}</li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-ink-500">{t("today.contraception")}</p>
      {showFertility && conf.ovulationWindow && !conf.skipOvulation ? (
        <p className="mt-2 text-sm text-ink-700">
          {lang === "hi" ? "अनुमानित उपजाऊ विंडो" : "Estimated fertile window"}: {conf.ovulationWindow.start} – {conf.ovulationWindow.end}
        </p>
      ) : null}
      {showFertility && conf.skipOvulation ? <p className="mt-2 text-sm text-ink-500">{t("today.noOvulation")}</p> : null}
    </Card>
  );
}
