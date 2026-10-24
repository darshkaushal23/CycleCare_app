import { Link } from "react-router-dom";
import { ClipboardPlus, FileText, HeartPulse, Sprout } from "lucide-react";
import { CycleConfidence } from "../components/CycleConfidence";
import { Card, CardTitle } from "../components/ui/Card";
import { EmptyState } from "../components/ui/States";
import { useAppState } from "../context/AppState";
import { evaluateCare } from "../lib/careEngine";
import { buildInsights } from "../lib/cycle";
import { formatDisplayDate, todayISO } from "../lib/dates";
import { reminderBanners } from "../lib/reminders";

function greetingKey(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "today.greetingMorning";
  if (hour < 17) return "today.greetingAfternoon";
  return "today.greetingEvening";
}

function fill(template, vars) {
  return Object.entries(vars).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

export function Today() {
  const { t, lang, settings, periods, logs, analysis, loadDemo, showFertility } = useAppState();
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const empty = periods.length === 0 && logs.length === 0;
  const today = todayISO();
  const guidance = evaluateCare({
    periods,
    logs,
    prediction: analysis.prediction,
    ageGroup: settings.ageGroup,
    lang,
  });
  const urgentCount = guidance.cards.filter((card) => card.severity === "urgent").length;
  const insights = buildInsights(periods, logs);
  const pattern = insights.symptomPatterns[0];
  const banners = reminderBanners({
    reminders: settings.reminders,
    logs,
    prediction: analysis.prediction,
    settings,
    today,
  });
  const position = analysis.position ?? { day: null, phase: "none" };
  const missed = analysis.prediction?.possibleMissed ?? [];

  let insightLine = t("today.insightNone");
  if (pattern?.kind === "cycle-days") {
    insightLine = fill(t("insights.patternDays"), {
      symptom: t(`log.symptomOpts.${pattern.id}`),
      days: pattern.days.join("-"),
      n: String(pattern.cycles),
    });
  } else if (pattern?.kind === "energy-pre") {
    insightLine = fill(t("insights.energyPre"), { n: String(pattern.cycles) });
  }

  return (
    <div className="page-enter mx-auto max-w-3xl space-y-4">
      <header>
        <p className="text-sm text-ink-500">
          {formatDisplayDate(today, locale, { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink-900 md:text-4xl">{t(greetingKey())}</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-500">{t("today.studentLine")}</p>
      </header>

      {banners.map((banner) => (
        <Link key={banner.id} to={banner.to} className="block rounded-2xl bg-lavender-100 px-4 py-3 text-sm text-lavender-700">
          {lang === "hi" ? banner.hi : banner.en}
        </Link>
      ))}

      {settings.isDemo ? (
        <>
          <p className="rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-700" role="status">
            {t("today.demoBanner")}
          </p>
          <Card>
            <CardTitle>{t("walkthrough.title")}</CardTitle>
            <p className="mt-2 text-sm text-ink-500">{t("walkthrough.body")}</p>
            <ol className="mt-3 grid gap-2">
              {t("walkthrough.steps").map((step) => (
                <li key={step.to}>
                  <Link
                    to={step.to}
                    className="flex min-h-11 items-center rounded-2xl bg-lavender-50 px-3 text-sm text-lavender-700"
                  >
                    {step.label}
                  </Link>
                </li>
              ))}
            </ol>
          </Card>
        </>
      ) : null}

      {empty ? (
        <EmptyState
          icon={Sprout}
          title={t("today.emptyTitle")}
          body={t("today.emptyBody")}
          action={
            <Link
              to="/log"
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-lavender-700 text-sm font-medium text-white"
            >
              {t("today.emptyCta")}
            </Link>
          }
          secondary={
            settings.isDemo ? null : (
              <button type="button" className="mt-3 text-sm text-lavender-700 underline" onClick={loadDemo}>
                {t("today.emptyDemo")}
              </button>
            )
          }
        />
      ) : (
        <>
          {position.day != null ? (
            <Card>
              <p className="text-xs uppercase tracking-wide text-lavender-500">{fill(t("today.cycleDay"), { n: String(position.day) })}</p>
              <p className="mt-2 text-lg leading-relaxed text-ink-800">{t(`today.phase.${position.phase}`)}</p>
              <Link
                to={`/log?date=${today}`}
                className="mt-4 inline-flex h-12 items-center justify-center rounded-2xl bg-lavender-700 px-5 text-sm font-medium text-white"
              >
                {t("today.logToday")}
              </Link>
            </Card>
          ) : null}

          <CycleConfidence
            analysis={analysis}
            ageGroup={settings.ageGroup}
            lang={lang}
            t={t}
            locale={locale}
            showFertility={showFertility}
          />

          {missed.length ? (
            <Card className="ring-1 ring-rose-200">
              <CardTitle>{t("today.forgotten")}</CardTitle>
              <p className="mt-2 text-sm text-ink-700">{t("today.forgottenBody")}</p>
              <p className="mt-2 text-sm text-ink-500">
                {missed.map((cycle) => `${cycle.startDate} → ${cycle.nextStart} (${cycle.length})`).join(" · ")}
              </p>
            </Card>
          ) : null}

          {analysis.prediction?.irregular ? (
            <Link to="/care" className="block text-sm font-medium text-lavender-700">
              {t("today.seeDoctor")}
            </Link>
          ) : null}

          <Card>
            <p className="text-xs uppercase tracking-wide text-ink-500">{t("insights.patterns")}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-800">{insightLine}</p>
          </Card>

          {analysis.lastPeriod ? (
            <p className="text-sm text-ink-500">
              {t("today.lastPeriod")}: {formatDisplayDate(analysis.lastPeriod.startDate, locale, { day: "numeric", month: "short" })}
              {" – "}
              {formatDisplayDate(analysis.lastPeriod.endDate, locale, { day: "numeric", month: "short" })}
              {analysis.daysSinceLastStart != null ? ` · ${analysis.daysSinceLastStart} ${t("today.daysAgo")}` : ""}
            </p>
          ) : null}
        </>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <HeartPulse className="h-5 w-5 text-rose-500" />
          <CardTitle className="mt-3">{t("today.careTeaserTitle")}</CardTitle>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">{t("today.careTeaserBody")}</p>
          {guidance.cards.length ? (
            <p className="mt-2 text-sm text-ink-700">
              {guidance.cards.length} {lang === "hi" ? "संकेत" : "flags"}
              {urgentCount ? ` · ${urgentCount} ${t("care.urgentLegend").toLowerCase()}` : ""}
            </p>
          ) : null}
          <Link to="/care" className="mt-4 inline-flex h-11 items-center text-sm font-medium text-lavender-700">
            {t("today.openCare")}
          </Link>
        </Card>
        <Card>
          <FileText className="h-5 w-5 text-lavender-700" />
          <CardTitle className="mt-3">{t("today.openVisit")}</CardTitle>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">{t("visit.notDiagnosis")}</p>
          <Link to="/visit" className="mt-4 inline-flex h-11 items-center text-sm font-medium text-lavender-700">
            {t("care.openVisit")}
          </Link>
        </Card>
        <Card>
          <ClipboardPlus className="h-5 w-5 text-lavender-700" />
          <CardTitle className="mt-3">{t("today.quickLog")}</CardTitle>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">{t("today.comingLog")}</p>
          <Link
            to={`/log?date=${today}`}
            className="mt-4 inline-flex h-11 items-center text-sm font-medium text-lavender-700"
          >
            {t("today.logToday")}
          </Link>
        </Card>
      </div>
    </div>
  );
}
