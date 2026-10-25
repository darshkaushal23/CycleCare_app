import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarMark, Doodle } from "../components/art/Doodles";
import { CycleDiagram } from "../components/education/CycleDiagram";
import { Button } from "../components/ui/Button";
import { MeanTip } from "../components/MeanTip";
import { Card } from "../components/ui/Card";
import { useAppState } from "../context/AppState";
import { isBleedingLog, predictedDates } from "../lib/cycle";
import { estimatedCalendarPhase } from "../lib/cyclePhases";
import { addDays, addMonths, eachDay, formatDisplayDate, formatMonthYear, monthGrid, startOfMonth, todayISO } from "../lib/dates";

function phaseMark(phase, canPhases) {
  if (!canPhases || phase.kind !== "estimate") return null;
  if (phase.key === "follicular") return "bud";
  if (phase.key === "ovulation") return "bloom";
  if (phase.key === "luteal") return "moon";
  return null;
}

function cellTone({ inMonth, bleeding, estimate, canPhases, phase }) {
  if (!inMonth) return "bg-transparent text-ink-500/40";
  if (bleeding) return "bg-rose-100 text-ink-900";
  if (estimate) {
    return "bg-rose-50 text-ink-900 ring-1 ring-dashed ring-rose-300 [background-image:radial-gradient(#F6C1CF_1px,transparent_1.4px)] [background-size:5px_5px]";
  }
  if (canPhases && phase.kind === "estimate") {
    if (phase.key === "ovulation") return "bg-peach/90 text-ink-900";
    if (phase.key === "luteal") return "bg-[#E4D4F4] text-ink-900";
    if (phase.key === "follicular") return "bg-lavender-50 text-ink-900";
  }
  return "bg-cream-50 text-ink-900";
}

export function CalendarPage() {
  const { t, lang, logs, analysis, settings, showFertility, removeLog } = useAppState();
  const navigate = useNavigate();
  const today = todayISO();
  const [month, setMonth] = useState(() => startOfMonth(today));
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const weekdays = t("calendar.days");
  const grid = useMemo(() => monthGrid(month), [month]);
  const byDate = useMemo(() => Object.fromEntries(logs.map((log) => [log.date, log])), [logs]);
  const predicted = useMemo(() => new Set(predictedDates(analysis.prediction)), [analysis.prediction]);
  const canPredict = Boolean(analysis.prediction?.canPredict && analysis.prediction.window);
  const canPhases = canPredict && !analysis.prediction?.irregular && !analysis.prediction?.skipOvulation;
  const fertile = useMemo(() => {
    const window = analysis.prediction?.ovulationWindow;
    if (!showFertility || !canPhases || !window) return new Set();
    return new Set(eachDay(window.start, window.end));
  }, [analysis.prediction, showFertility, canPhases]);
  const [selected, setSelected] = useState(today);
  const [eduPhase, setEduPhase] = useState("menstrual");
  const selectedLog = byDate[selected];
  const selectedBleed = isBleedingLog(selectedLog);
  const selectedEstimate = predicted.has(selected) && !selectedBleed;
  const selectedPhase = estimatedCalendarPhase(selected, {
    prediction: analysis.prediction,
    inPeriod: selectedBleed,
  });
  const window = analysis.prediction?.window;

  function moveSelection(from, delta) {
    const next = addDays(from, delta);
    setSelected(next);
    setMonth(startOfMonth(next));
    requestAnimationFrame(() => {
      document.querySelector(`[data-cal-day="${next}"]`)?.focus();
    });
  }

  return (
    <div className="page-enter mx-auto max-w-3xl space-y-4">
      <header className="flex items-start gap-3">
        <Doodle kind="calendar" className="h-14 w-14 shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lavender-500">{t("nav.calendar")}</p>
          <h1 className="mt-1 font-display text-3xl">{t("calendar.title")}</h1>
          <p className="mt-2 text-sm text-ink-500">{t("calendar.hint")}</p>
        </div>
      </header>

      {settings.isDemo ? <p className="rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-700">{t("today.demoBanner")}</p> : null}

      {canPredict ? (
        <Card className="overflow-visible bg-rose-50/80">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-700">{t("calendar.nextRange")}</p>
          <p className="mt-1 font-display text-xl text-ink-900">
            {formatDisplayDate(window.start, locale)} – {formatDisplayDate(window.end, locale)}
          </p>
          <p className="mt-1 text-xs text-ink-500">{t("calendar.estimateOnly")}</p>
        </Card>
      ) : (
        <p className="rounded-2xl bg-cream-50 px-4 py-3 text-sm text-ink-500 ring-1 ring-lavender-100">{t("calendar.unknown")}</p>
      )}

      {analysis.prediction?.irregular && canPredict ? (
        <p className="rounded-2xl bg-lavender-50 px-4 py-3 text-sm text-ink-700">{t("calendar.irregularNote")}</p>
      ) : null}

      <Card className="overflow-visible">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="min-w-0 text-center">
            <p className="truncate font-display text-xl">{formatMonthYear(month, locale)}</p>
            <button type="button" className="text-xs font-medium text-plum" onClick={() => setMonth(startOfMonth(today))}>
              {t("calendar.jumpToday")}
            </button>
          </div>
          <div className="flex items-center justify-center gap-1">
            <IconBtn label={t("calendar.prevYear")} onClick={() => setMonth(addMonths(month, -12))}>
              <ChevronLeft className="h-4 w-4" />
              <ChevronLeft className="-ml-2.5 h-4 w-4" />
            </IconBtn>
            <IconBtn label={t("calendar.prev")} onClick={() => setMonth(addMonths(month, -1))}>
              <ChevronLeft className="h-5 w-5" />
            </IconBtn>
            <IconBtn label={t("calendar.next")} onClick={() => setMonth(addMonths(month, 1))}>
              <ChevronRight className="h-5 w-5" />
            </IconBtn>
            <IconBtn label={t("calendar.nextYear")} onClick={() => setMonth(addMonths(month, 12))}>
              <ChevronRight className="h-4 w-4" />
              <ChevronRight className="-ml-2.5 h-4 w-4" />
            </IconBtn>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-ink-500 sm:gap-1.5 sm:text-[11px]">
          {weekdays.map((day) => (
            <div key={day} className="truncate py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5" role="grid" aria-label={t("calendar.title")}>
          {grid.cells.map((cell) => {
            const log = byDate[cell.date];
            const bleeding = isBleedingLog(log);
            const hasSymptoms = (log?.symptoms?.length ?? 0) > 0;
            const hasLog = Boolean(log);
            const estimate = predicted.has(cell.date) && !bleeding;
            const phase = estimatedCalendarPhase(cell.date, {
              prediction: analysis.prediction,
              inPeriod: bleeding,
            });
            const maybeFertile = fertile.has(cell.date) && !bleeding && !estimate;
            const isSelected = selected === cell.date;
            const mark = bleeding ? "period" : estimate ? "estimate" : phaseMark(phase, canPhases);
            const showLog = hasSymptoms && !bleeding;
            const labels = [
              formatDisplayDate(cell.date, locale),
              bleeding ? t("calendar.bleed") : "",
              estimate ? t("calendar.predict") : "",
              canPhases && phase.kind === "estimate" ? `${t("calendar.estimatePrefix")} ${t(`phases.names.${phase.key}`)}` : "",
              maybeFertile ? t("calendar.phaseHint") : "",
              hasSymptoms ? t("calendar.symptom") : hasLog ? t("calendar.logged") : "",
              isSelected ? t("calendar.selectedDay") : "",
            ]
              .filter(Boolean)
              .join(", ");

            return (
              <button
                key={cell.date}
                type="button"
                data-cal-day={cell.date}
                title={labels}
                aria-label={labels}
                aria-pressed={isSelected}
                aria-current={cell.date === today ? "date" : undefined}
                onClick={() => setSelected(cell.date)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    moveSelection(cell.date, 1);
                  } else if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    moveSelection(cell.date, -1);
                  } else if (event.key === "ArrowDown") {
                    event.preventDefault();
                    moveSelection(cell.date, 7);
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    moveSelection(cell.date, -7);
                  }
                }}
                className={`flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-2xl px-0.5 py-1 text-[11px] motion-safe:transition duration-200 hover:brightness-[0.97] sm:min-h-[3.4rem] sm:text-sm ${cellTone({
                  inMonth: cell.inMonth,
                  bleeding,
                  estimate,
                  canPhases,
                  phase,
                })} ${cell.date === today && !isSelected ? "ring-2 ring-plum/35" : ""} ${isSelected ? "ring-2 ring-plum shadow-soft" : ""}`}
              >
                <span className="tabular-nums font-medium leading-none">{Number(cell.date.slice(8))}</span>
                <span className="flex h-3 max-w-full items-center justify-center gap-0.5">
                  {mark ? <CalendarMark kind={mark} className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : null}
                  {showLog ? <CalendarMark kind="log" className="h-2 w-2 sm:h-2.5 sm:w-2.5" /> : null}
                  {!mark && !showLog ? <span className="h-2.5 w-2.5" aria-hidden="true" /> : null}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <SelectedCard
        t={t}
        locale={locale}
        selected={selected}
        log={selectedLog}
        bleed={selectedBleed}
        estimate={selectedEstimate}
        phase={selectedPhase}
        canPhases={canPhases}
        onEdit={() => navigate(`/log?date=${selected}`)}
        onDelete={
          selectedLog
            ? async () => {
                if (!window.confirm(t("log.confirmDelete"))) return;
                await removeLog(selected);
              }
            : null
        }
      />

      <Card>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lavender-500">{t("calendar.legend")}</p>
        <ul className="mt-3 grid grid-cols-2 gap-2 text-xs text-ink-700 sm:grid-cols-3 sm:text-sm">
          <LegendMark kind="period" label={t("calendar.bleed")} />
          <LegendMark kind="estimate" label={t("calendar.predict")} />
          <LegendMark kind="bud" label={t("calendar.follicular")} />
          <LegendMark kind="bloom" label={t("calendar.ovulation")} />
          <LegendMark kind="moon" label={t("calendar.luteal")} />
          <LegendMark kind="log" label={t("calendar.symptom")} />
        </ul>
        <p className="mt-3 text-sm font-medium text-plum">{t("calendar.phaseCannotConfirm")}</p>
        <MeanTip t={t}>
          {t("calendar.overlap")} {canPhases ? "" : t("calendar.noPersonalizedPhases")}
        </MeanTip>
      </Card>

      <details className="rounded-2.5xl bg-white p-5 shadow-card ring-1 ring-lavender-100">
        <summary className="cursor-pointer font-display text-lg">{t("phases.eduView")}</summary>
        <p className="mt-2 text-sm text-ink-500">{t("phases.eduViewHint")}</p>
        <div className="mt-4 min-w-0">
          <CycleDiagram lang={lang} t={t} selected={eduPhase} onSelect={setEduPhase} compact prediction={analysis.prediction} />
        </div>
      </details>
    </div>
  );
}

function SelectedCard({ t, locale, selected, log, bleed, estimate, phase, canPhases, onEdit, onDelete }) {
  const symptoms = log?.symptoms ?? [];
  const flow = log?.flow && log.flow !== "none" ? t(`log.flowOpts.${log.flow}`) : null;
  const estimatedPhase = canPhases && phase.kind === "estimate";
  const recordedPhase = phase.kind === "recorded";

  return (
    <Card className="overflow-visible">
      <div className="flex items-start gap-3">
        <Doodle kind={bleed ? "drop" : estimate ? "drop" : "calendar"} className="h-12 w-12 shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lavender-500">{t("calendar.selectedDay")}</p>
          <p className="mt-1 font-display text-xl leading-snug">
            {formatDisplayDate(selected, locale, { weekday: "long", day: "numeric", month: "short" })}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid gap-2 text-sm">
        <Row
          kicker={bleed ? t("calendar.recorded") : t("calendar.bleed")}
          value={bleed ? `${t("calendar.bleed")}${flow ? ` · ${t("calendar.flow")} ${flow}` : ""}` : t("calendar.noFlow")}
        />
        <Row
          kicker={t("calendar.symptom")}
          value={
            symptoms.length
              ? symptoms.map((id) => t(`log.symptomOpts.${id}`)).join(" · ")
              : log
                ? t("calendar.noSymptoms")
                : t("log.newEntry")
          }
        />
        {recordedPhase ? (
          <Row kicker={t("calendar.recorded")} value={t("phases.names.menstrual")} />
        ) : estimatedPhase ? (
          <Row kicker={t("calendar.estimateOnly")} value={`${t("calendar.estimatePrefix")} ${t(`phases.names.${phase.key}`)}`} />
        ) : (
          <Row kicker={t("calendar.estimateOnly")} value={t("calendar.noPersonalizedPhases")} />
        )}
        {estimate ? <Row kicker={t("calendar.predict")} value={t("calendar.inWindow")} /> : null}
      </dl>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button className="flex-1" onClick={onEdit}>
          {log ? t("calendar.editLog") : t("calendar.openLog")}
        </Button>
        {onDelete ? (
          <Button variant="secondary" className="flex-1" onClick={onDelete}>
            {t("log.delete")}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

function Row({ kicker, value }) {
  return (
    <div className="rounded-2xl bg-cream-50 px-3 py-2">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lavender-500">{kicker}</dt>
      <dd className="mt-0.5 text-ink-800">{value}</dd>
    </div>
  );
}

function LegendMark({ kind, label }) {
  return (
    <li className="flex items-center gap-2">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-cream-50 ring-1 ring-lavender-100">
        <CalendarMark kind={kind} className="h-4 w-4" />
      </span>
      <span className="min-w-0 leading-snug">{label}</span>
    </li>
  );
}

function IconBtn({ label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-11 min-w-11 items-center justify-center rounded-2xl bg-lavender-50 motion-safe:transition hover:bg-lavender-100"
    >
      {children}
    </button>
  );
}
