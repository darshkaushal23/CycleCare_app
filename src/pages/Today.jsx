import { Link } from "react-router-dom";
import { Doodle } from "../components/art/Doodles";
import { CycleConfidence } from "../components/CycleConfidence";
import { ForecastCard } from "../components/ForecastCard";
import { MeanTip } from "../components/MeanTip";
import { Button } from "../components/ui/Button";
import { Card, CardKicker, CardTitle } from "../components/ui/Card";
import { EmptyState } from "../components/ui/States";
import { useAppState } from "../context/AppState";
import { evaluateCare } from "../lib/careEngine";
import { buildInsights, isPeriodDay } from "../lib/cycle";
import { formatDisplayDate, todayISO } from "../lib/dates";
import { LESSONS } from "../lib/learnContent";
import { reminderBanners } from "../lib/reminders";

function greetingKey(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "today.greetingMorning";
  if (hour < 17) return "today.greetingAfternoon";
  return "today.greetingEvening";
}

function greetingDoodle(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "flower";
  if (hour < 17) return "sun";
  return "moon";
}

function fill(template, vars) {
  return Object.entries(vars).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

function CycleRing({ day }) {
  return (
    <svg className="h-20 w-20 shrink-0" viewBox="0 0 80 80" aria-hidden="true">
      <circle cx="40" cy="40" r="28" fill="#FFF5F8" stroke="#E9DDF7" strokeWidth="8" />
      <circle
        cx="40"
        cy="40"
        r="28"
        fill="none"
        stroke="#D987A3"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${Math.min(160, 12 + (Number(day) || 0) * 3)} 176`}
        transform="rotate(-90 40 40)"
      />
      <text x="40" y="44" textAnchor="middle" fontSize="16" fill="#563F68" fontFamily="Fraunces, Georgia, serif">
        {day ?? "—"}
      </text>
    </svg>
  );
}

function QuickLink({ to, doodle, label }) {
  return (
    <Link
      to={to}
      className="flex min-h-[5.5rem] flex-col items-center justify-center gap-1.5 rounded-2xl bg-cream-50 p-3 text-center text-xs font-medium text-ink-900 ring-1 ring-lavender-100 motion-safe:transition hover:bg-lavender-50 hover:ring-lavender-300 sm:text-sm"
    >
      <Doodle kind={doodle} className="h-10 w-10" />
      {label}
    </Link>
  );
}

export function Today() {
  const { t, lang, settings, periods, logs, analysis, loadDemo, showFertility } = useAppState();
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const empty = periods.length === 0 && logs.length === 0;
  const today = todayISO();
  const todayLog = logs.find((log) => log.date === today);
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
  const lesson = LESSONS[0]?.[lang] ?? LESSONS[0]?.en;
  const window = analysis.prediction?.window;
  const onPeriod = Boolean(position.inPeriod || isPeriodDay(todayLog));

  let insightLine = lesson ? lesson.summary : t("today.insightNone");
  if (pattern?.kind === "cycle-days") {
    insightLine = fill(t("insights.patternDays"), {
      symptom: t(`log.symptomOpts.${pattern.id}`),
      days: pattern.days.join("-"),
      n: String(pattern.cycles),
    });
  } else if (pattern?.kind === "energy-pre") {
    insightLine = fill(t("insights.energyPre"), { n: String(pattern.cycles) });
  }

  const quick = (
    <div>
      <p className="mb-2 text-base font-medium text-ink-700">{t("today.quickTitle")}</p>
      <div className="grid grid-cols-2 gap-2">
        <QuickLink to={`/log?date=${today}`} doodle="journal" label={t("nav.log")} />
        <QuickLink to="/calendar" doodle="calendar" label={t("nav.calendar")} />
        <QuickLink to="/learn" doodle="first" label={t("nav.learn")} />
        <QuickLink to="/care" doodle="care" label={t("nav.care")} />
      </div>
    </div>
  );

  return (
    <div className={`page-enter mx-auto max-w-3xl space-y-4 ${onPeriod ? "rounded-3xl bg-rose-50 p-3 ring-1 ring-rose-200" : ""}`}>
      <header className="flex items-start gap-3">
        <Doodle kind={onPeriod ? "drop" : greetingDoodle()} className="h-16 w-16 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm text-ink-500">
            {formatDisplayDate(today, locale, { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="mt-1 font-display text-3xl text-ink-900 md:text-4xl">{t(greetingKey())}</h1>
          <p className="mt-1 text-base text-ink-500">{t("today.studentLine")}</p>
        </div>
      </header>

      {banners.map((banner) => (
        <Link key={banner.id} to={banner.to} className="block rounded-2xl bg-lavender-100 px-4 py-3 text-sm text-plum">
          {lang === "hi" ? banner.hi : banner.en}
        </Link>
      ))}

      {onPeriod ? (
        <p className="rounded-2xl bg-rose-100 px-4 py-3 font-display text-2xl text-rose-700 ring-2 ring-rose-300" role="status">
          {t("today.periodToday")}
        </p>
      ) : null}

      {settings.isDemo ? (
        <p className="rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-700" role="status">
          {t("today.demoBanner")}
        </p>
      ) : null}

      {empty ? (
        <>
          <EmptyState
            title={t("today.emptyTitle")}
            body={t("today.emptyBody")}
            action={
              <>
                <ol className="mt-4 space-y-1.5 px-1 text-left text-base text-ink-800">
                  {t("today.startSteps").map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <Link to="/log" className="mt-5 block">
                  <Button className="w-full">{t("today.emptyCta")}</Button>
                </Link>
              </>
            }
            secondary={
              settings.isDemo ? null : (
                <button type="button" className="mt-3 text-sm text-plum underline" onClick={loadDemo}>
                  {t("today.emptyDemo")}
                </button>
              )
            }
          />
          {quick}
        </>
      ) : (
        <>
          <Card className={onPeriod ? "ring-2 ring-rose-300" : ""}>
            <div className="flex items-center gap-4">
              <CycleRing day={position.day} />
              <div className="min-w-0">
                <CardKicker>{t("today.overview")}</CardKicker>
                <p className="mt-1 font-display text-2xl text-ink-900">
                  {position.day != null ? fill(t("today.cycleDay"), { n: String(position.day) }) : t("today.noWindow")}
                </p>
                <p className="mt-1 text-base text-ink-700">{t(`today.phase.${position.phase}`)}</p>
                {position.estimated ? <p className="mt-1 text-base text-ink-500">{t("today.estimate")}</p> : null}
                {["follicular", "ovulation", "luteal", "fertile"].includes(position.phase) ? (
                  <MeanTip t={t}>{t("today.contraception")}</MeanTip>
                ) : null}
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-lavender-50 p-3">
              <p className="text-base font-medium text-ink-700">{t("today.nextWindow")}</p>
              {window ? (
                <p className="mt-1 font-display text-xl">
                  {formatDisplayDate(window.start, locale, { day: "numeric", month: "short" })}
                  {" – "}
                  {formatDisplayDate(window.end, locale, { day: "numeric", month: "short" })}
                </p>
              ) : (
                <p className="mt-1 text-base">{t("today.needMore")}</p>
              )}
              <p className="mt-1 text-sm text-ink-500">{t("today.nextHint")}</p>
            </div>
            <Link to={`/log?date=${today}`} className="mt-4 block">
              <Button className="w-full">{t("today.logToday")}</Button>
            </Link>
          </Card>

          <ForecastCard
            prediction={analysis.prediction}
            t={t}
            locale={locale}
            showFertility={showFertility}
            today={today}
          />

          {quick}

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
            <Link to="/care" className="block text-sm font-medium text-plum">
              {t("today.seeDoctor")}
            </Link>
          ) : null}

          <Card>
            <div className="flex items-start gap-3">
              <Doodle kind="journal" className="h-12 w-12 shrink-0" />
              <div>
                <p className="text-base font-medium text-ink-700">{lesson?.title ?? t("nav.learn")}</p>
                <p className="mt-2 text-base leading-relaxed text-ink-800">{insightLine}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                  <Link to="/insights" className="inline-block text-base font-medium text-plum">
                    {t("nav.insights")}
                  </Link>
                  <Link to="/learn" className="inline-block text-base font-medium text-plum">
                    {t("learn.readMore")}
                  </Link>
                </div>
              </div>
            </div>
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
          <Doodle kind="care" className="h-12 w-12" />
          <CardTitle className="mt-3">{t("today.careTeaserTitle")}</CardTitle>
          <p className="mt-2 text-sm text-ink-500">{t("today.careTeaserBody")}</p>
          {guidance.cards.length ? (
            <p className="mt-2 text-sm text-ink-700">
              {guidance.cards.length} {lang === "hi" ? "संकेत" : "flags"}
              {urgentCount ? ` · ${urgentCount} ${t("care.urgentLegend").toLowerCase()}` : ""}
            </p>
          ) : null}
          <Link to="/care" className="mt-4 inline-flex h-11 items-center text-sm font-medium text-plum">
            {t("today.openCare")}
          </Link>
        </Card>
        <Card>
          <Doodle kind="notebook" className="h-12 w-12" />
          <CardTitle className="mt-3">{t("today.openVisit")}</CardTitle>
          <p className="mt-2 text-sm text-ink-500">{t("visit.notDiagnosis")}</p>
          <Link to="/visit" className="mt-4 inline-flex h-11 items-center text-sm font-medium text-plum">
            {t("care.openVisit")}
          </Link>
        </Card>
      </div>
    </div>
  );
}
