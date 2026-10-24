import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "../components/ui/Card";
import { useAppState } from "../context/AppState";
import { isBleedingLog, predictedDates } from "../lib/cycle";
import { addMonths, formatMonthYear, monthGrid, startOfMonth, todayISO } from "../lib/dates";


export function CalendarPage() {
  const { t, lang, logs, analysis } = useAppState();
  const navigate = useNavigate();
  const today = todayISO();
  const [month, setMonth] = useState(() => startOfMonth(today));
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const weekdays = t("calendar.days");
  const grid = useMemo(() => monthGrid(month), [month]);
  const byDate = useMemo(() => Object.fromEntries(logs.map((log) => [log.date, log])), [logs]);
  const predicted = useMemo(() => new Set(predictedDates(analysis.prediction)), [analysis.prediction]);

  return (
    <div className="page-enter mx-auto max-w-3xl space-y-4">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lavender-500">{t("nav.calendar")}</p>
        <h1 className="mt-1 font-display text-3xl">{t("calendar.title")}</h1>
        <p className="mt-2 text-sm text-ink-500">{t("calendar.hint")}</p>
      </header>

      <Card>
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1">
            <IconBtn label={t("calendar.prevYear")} onClick={() => setMonth(addMonths(month, -12))}>
              <ChevronLeft className="h-4 w-4" />
              <ChevronLeft className="-ml-3 h-4 w-4" />
            </IconBtn>
            <IconBtn label={t("calendar.prev")} onClick={() => setMonth(addMonths(month, -1))}>
              <ChevronLeft className="h-5 w-5" />
            </IconBtn>
          </div>
          <div className="text-center">
            <p className="font-display text-xl">{formatMonthYear(month, locale)}</p>
            <button type="button" className="text-xs text-lavender-700" onClick={() => setMonth(startOfMonth(today))}>
              {t("calendar.jumpToday")}
            </button>
          </div>
          <div className="flex gap-1">
            <IconBtn label={t("calendar.next")} onClick={() => setMonth(addMonths(month, 1))}>
              <ChevronRight className="h-5 w-5" />
            </IconBtn>
            <IconBtn label={t("calendar.nextYear")} onClick={() => setMonth(addMonths(month, 12))}>
              <ChevronRight className="h-4 w-4" />
              <ChevronRight className="-ml-3 h-4 w-4" />
            </IconBtn>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] text-ink-500">
          {weekdays.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {grid.cells.map((cell) => {
            const log = byDate[cell.date];
            const bleeding = isBleedingLog(log);
            const hasSymptoms = (log?.symptoms?.length ?? 0) > 0;
            const estimate = predicted.has(cell.date) && !bleeding;
            return (
              <button
                key={cell.date}
                type="button"
                onClick={() => navigate(`/log?date=${cell.date}`)}
                className={`relative min-h-[3.15rem] rounded-2xl p-1 text-sm ${
                  cell.inMonth ? "text-ink-900" : "text-ink-500/40"
                } ${bleeding ? "bg-rose-100" : estimate ? "bg-lavender-50 ring-1 ring-dashed ring-lavender-300" : "bg-cream-50"} ${
                  cell.date === today ? "ring-2 ring-lavender-700" : ""
                }`}
              >
                <span className="font-medium">{Number(cell.date.slice(8))}</span>
                {hasSymptoms ? (
                  <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-lavender-500" />
                ) : null}
              </button>
            );
          })}
        </div>
      </Card>

      <ul className="flex flex-wrap gap-3 text-xs text-ink-500">
        <Legend className="bg-rose-100" label={t("calendar.bleed")} />
        <Legend className="bg-lavender-50 ring-1 ring-dashed ring-lavender-300" label={t("calendar.predict")} />
        <Legend dot label={t("calendar.symptom")} />
      </ul>
    </div>
  );
}

function IconBtn({ label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-11 min-w-11 items-center justify-center rounded-2xl bg-lavender-50"
    >
      {children}
    </button>
  );
}

function Legend({ className = "", label, dot }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`h-4 w-4 rounded ${dot ? "bg-lavender-500 h-1.5 w-1.5 rounded-full" : className}`} />
      {label}
    </li>
  );
}
