import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { Doodle } from "../components/art/Doodles";
import { Button } from "../components/ui/Button";
import { Card, CardTitle } from "../components/ui/Card";
import { useAppState } from "../context/AppState";
import { evaluateCare } from "../lib/careEngine";
import { formatDisplayDate } from "../lib/dates";

function evidenceLabel(row, locale) {
  if (!row?.detail) return formatDisplayDate(row.date, locale);
  if (row.date && row.detail.includes(row.date)) {
    return row.detail.replaceAll(row.date, formatDisplayDate(row.date, locale));
  }
  return row.date ? `${formatDisplayDate(row.date, locale)} · ${row.detail}` : row.detail;
}

export function CarePage() {
  const { t, lang, settings, periods, logs, analysis, loadDemo } = useAppState();
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const guidance = evaluateCare({
    periods,
    logs,
    prediction: analysis.prediction,
    ageGroup: settings.ageGroup,
    lang,
  });
  const cards = [...guidance.cards].sort((a, b) => Number(b.severity === "urgent") - Number(a.severity === "urgent"));

  return (
    <div className="page-enter mx-auto max-w-3xl space-y-4">
      <header className="flex items-start gap-3">
        <Doodle kind="alert" className="h-14 w-14 shrink-0" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lavender-500">{t("nav.care")}</p>
          <h1 className="mt-1 font-display text-3xl">{t("care.title")}</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">{t("care.intro")}</p>
        </div>
      </header>

      {settings.isDemo ? <p className="rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-700">{t("today.demoBanner")}</p> : null}

      {!logs.length ? (
        <Card>
          <p className="text-sm text-ink-500">{t("care.empty")}</p>
          <button type="button" className="mt-3 text-sm text-lavender-700 underline" onClick={loadDemo}>
            {t("today.emptyDemo")}
          </button>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-rose-100 px-3 py-1 font-medium text-rose-800">{t("care.urgentLegend")}</span>
        <span className="rounded-full bg-lavender-100 px-3 py-1 font-medium text-plum">{t("care.infoLegend")}</span>
      </div>

      {cards.map((card) => {
        const urgent = card.severity === "urgent";
        return (
          <Card
            key={card.id}
            className={`overflow-visible ${urgent ? "bg-gradient-to-br from-rose-50 to-white ring-2 ring-rose-400" : ""}`}
          >
            <div className="flex items-start gap-3">
              <Doodle kind={urgent ? "alert" : "heart"} className="h-12 w-12 shrink-0" />
              <div className="min-w-0">
                <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${urgent ? "text-rose-700" : "text-lavender-500"}`}>
                  {urgent ? t("care.urgent") : t("care.info")}
                </p>
                <h2 className="mt-1 font-display text-xl leading-snug">{card.noticed}</h2>
              </div>
            </div>

            {card.evidence.length ? (
              <ul className="mt-3 flex flex-wrap gap-2" aria-label={t("care.logs")}>
                {card.evidence.map((row) => (
                  <li
                    key={`${card.id}-${row.date}-${row.detail}`}
                    className="max-w-full rounded-full bg-cream-100 px-3 py-1 text-xs text-ink-800"
                  >
                    {evidenceLabel(row, locale)}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-cream-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-plum">{t("care.why")}</p>
                <p className="mt-1 text-sm text-ink-700">{card.why}</p>
              </div>
              <div className={`rounded-2xl p-3 ${urgent ? "bg-rose-50" : "bg-lavender-50"}`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-plum">{t("care.next")}</p>
                <p className="mt-1 text-sm text-ink-700">{card.nextSteps}</p>
              </div>
            </div>

            <details className="mt-3 rounded-2xl bg-cream-50 p-3">
              <summary className="cursor-pointer text-sm font-medium text-ink-900">{t("care.options")}</summary>
              <ul className="mt-2 space-y-1 text-sm text-plum">
                {(card.options ?? guidance.options).map((option) => (
                  <li key={option.id}>
                    <a href={option.url} className="underline" target="_blank" rel="noreferrer">
                      {option.label}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
            <details className="mt-2 rounded-2xl bg-cream-50 p-3">
              <summary className="cursor-pointer text-sm font-medium text-ink-900">{t("care.sources")}</summary>
              <ul className="mt-2 space-y-1 text-xs text-plum">
                {card.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} className="underline" target="_blank" rel="noreferrer">
                      {source.name}: {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          </Card>
        );
      })}

      {!guidance.cards.length && logs.length ? (
        <Card>
          <Doodle kind="heart" className="h-12 w-12" />
          <p className="mt-3 text-sm text-ink-700">{t("care.none")}</p>
        </Card>
      ) : null}

      <Card>
        <CardTitle>{t("care.cannotShow")}</CardTitle>
        <ul className="mt-3 space-y-2 text-sm text-ink-700">
          {guidance.logsCannotShow.map((item) => (
            <li key={item.id} className="rounded-2xl bg-cream-50 px-3 py-2">
              {lang === "hi" ? item.hi : item.en}
            </li>
          ))}
        </ul>
      </Card>

      <p className="text-xs leading-relaxed text-ink-500">{guidance.disclaimer}</p>

      <Link to="/visit" className="block">
        <Button className="w-full">
          <FileText className="h-4 w-4" />
          {t("care.openVisit")}
        </Button>
      </Link>
    </div>
  );
}
