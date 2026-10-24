import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardKicker, CardTitle } from "../components/ui/Card";
import { useAppState } from "../context/AppState";
import { evaluateCare } from "../lib/careEngine";

export function CarePage() {
  const { t, lang, settings, periods, logs, analysis, loadDemo } = useAppState();
  const guidance = evaluateCare({
    periods,
    logs,
    prediction: analysis.prediction,
    ageGroup: settings.ageGroup,
    lang,
  });

  return (
    <div className="page-enter mx-auto max-w-3xl space-y-4">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lavender-500">{t("nav.care")}</p>
        <h1 className="mt-1 font-display text-3xl">{t("care.title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">{t("care.intro")}</p>
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
        <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">{t("care.urgentLegend")}</span>
        <span className="rounded-full bg-lavender-100 px-3 py-1 text-lavender-700">{t("care.infoLegend")}</span>
      </div>

      {guidance.cards.map((card) => (
        <Card key={card.id} className={card.severity === "urgent" ? "ring-2 ring-rose-400" : ""}>
          <CardKicker>{card.severity === "urgent" ? t("care.urgent") : t("care.info")}</CardKicker>
          <CardTitle className="mt-2">{t("care.noticed")}</CardTitle>
          <p className="mt-2 text-sm leading-relaxed text-ink-800">{card.noticed}</p>
          {card.evidence.length ? (
            <ul className="mt-3 space-y-1 text-sm text-ink-700">
              {card.evidence.map((row) => (
                <li key={`${card.id}-${row.date}-${row.detail}`}>• {row.detail}</li>
              ))}
            </ul>
          ) : null}
          <p className="mt-3 text-sm font-medium text-ink-900">{t("care.why")}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-700">{card.why}</p>
          <p className="mt-3 text-sm font-medium text-ink-900">{t("care.next")}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-700">{card.nextSteps}</p>
          <p className="mt-3 text-sm font-medium text-ink-900">{t("care.options")}</p>
          <ul className="mt-2 space-y-1 text-sm text-lavender-700">
            {(card.options ?? guidance.options).map((option) => (
              <li key={option.id}>
                <a href={option.url} className="underline" target="_blank" rel="noreferrer">
                  {option.label}
                </a>
              </li>
            ))}
          </ul>
          <ul className="mt-3 space-y-1 text-xs text-lavender-700">
            {card.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} className="underline" target="_blank" rel="noreferrer">
                  {source.name}: {source.title}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      {!guidance.cards.length && logs.length ? (
        <Card>
          <p className="text-sm text-ink-700">{t("care.none")}</p>
        </Card>
      ) : null}

      <Card>
        <CardTitle>{t("care.cannotShow")}</CardTitle>
        <ul className="mt-3 space-y-2 text-sm text-ink-700">
          {guidance.logsCannotShow.map((item) => (
            <li key={item.id}>• {lang === "hi" ? item.hi : item.en}</li>
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
