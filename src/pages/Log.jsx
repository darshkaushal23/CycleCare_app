import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useUnsavedGuard } from "../context/UnsavedGuard";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Doodle } from "../components/art/Doodles";
import { Button } from "../components/ui/Button";
import { Card, CardKicker, CardTitle } from "../components/ui/Card";
import { Chip, ChoiceGroup, Field, SelectCard } from "../components/ui/Input";
import { useAppState } from "../context/AppState";
import { addDays, formatDisplayDate, isISODate, todayISO } from "../lib/dates";
import {
  DEFAULT_TRACKED_SYMPTOMS,
  ENERGY_OPTIONS,
  FLOW_OPTIONS,
  MOOD_OPTIONS,
  SLEEP_OPTIONS,
  SYMPTOM_OPTIONS,
  emptyLog,
  logFingerprint,
  normalizeLog,
} from "../lib/logFields";

const FLOW_DOODLE = { none: "mood-calm", spotting: "drop", light: "drop", medium: "wave", heavy: "drop" };
const SYMPTOM_DOODLE = {
  cramps: "heat",
  headache: "mood-low",
  acne: "spark",
  bloating: "moon",
  fatigue: "moon",
  "mood-swings": "mood",
  "sleep-trouble": "moon",
  backache: "bottle",
  nausea: "drop",
  "breast-tenderness": "heart",
  "spotting-worry": "drop",
};
const MOOD_DOODLE = { low: "mood-low", okay: "mood-calm", good: "mood-ok", anxious: "mood", irritable: "mood-low" };
const ENERGY_DOODLE = { low: "moon", okay: "mood-calm", good: "sun" };
const SLEEP_DOODLE = { poor: "mood-low", okay: "mood-calm", good: "moon" };

function yesNo(value, onChange, yes, no) {
  return (
    <div className="mt-2 flex gap-2">
      <Chip selected={value === true} onClick={() => onChange(true)}>
        {yes}
      </Chip>
      <Chip selected={value === false} onClick={() => onChange(false)}>
        {no}
      </Chip>
    </div>
  );
}

function savedSummary(log, t) {
  if (!log) return "";
  const parts = [t(`log.flowOpts.${log.flow}`)];
  if (Number(log.pain)) parts.push(`${t("log.pain")} ${log.pain}`);
  if (log.mood) parts.push(t(`log.moodOpts.${log.mood}`));
  if (log.energy) parts.push(t(`log.energyOpts.${log.energy}`));
  if (log.sleep) parts.push(t(`log.sleepOpts.${log.sleep}`));
  if (log.sleepHours !== "" && log.sleepHours != null) parts.push(String(log.sleepHours));
  if (log.symptoms?.length) parts.push(log.symptoms.map((id) => t(`log.symptomOpts.${id}`)).join(", "));
  if (log.medicines) parts.push(log.medicines);
  if (log.notes) parts.push(log.notes);
  return parts.join(" · ");
}

function SectionHead({ doodle, title }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <Doodle kind={doodle} className="h-11 w-11 shrink-0" />
      <h2 className="font-display text-lg text-ink-900">{title}</h2>
    </div>
  );
}

export function LogPage() {
  const { t, lang, logs, saveLog, removeLog, settings } = useAppState();
  const { setGuard, confirmLeave } = useUnsavedGuard();
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const [params, setParams] = useSearchParams();
  const requested = params.get("date");
  const date = isISODate(requested) ? requested : todayISO();
  const today = todayISO();
  const stored = logs.find((item) => item.date === date);
  const [draft, setDraft] = useState(() => normalizeLog(stored, date));
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const savingRef = useRef(false);
  const tracked = settings.trackedSymptoms?.length ? settings.trackedSymptoms : DEFAULT_TRACKED_SYMPTOMS;
  const visibleSymptoms = SYMPTOM_OPTIONS.filter((id) => tracked.includes(id));
  const savedDates = useMemo(() => new Set(logs.map((log) => log.date)), [logs]);
  const strip = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(date, i - 3)), [date]);
  const dirty = logFingerprint(draft) !== logFingerprint(stored ?? emptyLog(date));

  if (draft.date !== date) {
    setDraft(normalizeLog(stored, date));
    setStatus("");
    setError("");
  }

  useEffect(() => {
    if (dirty) return;
    const next = normalizeLog(logs.find((item) => item.date === date), date);
    setDraft((current) => (logFingerprint(current) === logFingerprint(next) ? current : next));
  }, [logs, date, dirty]);

  useEffect(() => {
    setStep(0);
  }, [date]);

  useLayoutEffect(() => {
    setGuard(dirty, t("log.unsavedConfirm"));
    return () => setGuard(false);
  }, [dirty, setGuard, t]);

  useEffect(() => {
    function onLeave(event) {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  function setDate(next) {
    if (next === date) return;
    setParams({ date: next });
  }

  function patch(partial) {
    setStatus("");
    setDraft((current) => {
      const next = { ...current, ...partial };
      if (partial.periodStatus === "none") {
        if (["light", "medium", "heavy"].includes(next.flow)) next.flow = "none";
        return next;
      }
      if (partial.flow === "none") {
        next.periodStatus = "none";
        return next;
      }
      if (["start", "continue", "end"].includes(next.periodStatus) && next.flow === "none") {
        next.flow = "light";
      }
      if (["light", "medium", "heavy"].includes(next.flow) && next.periodStatus === "none") {
        next.periodStatus = "continue";
      }
      return next;
    });
  }

  const periodOn = draft.periodStatus !== "none" || ["light", "medium", "heavy"].includes(draft.flow);
  const showHeavy = draft.flow === "heavy";
  const showPainFollow = Number(draft.pain) >= 4;
  const symptomSet = useMemo(() => new Set(draft.symptoms), [draft.symptoms]);

  useEffect(() => {
    if (step === 1 && !periodOn) setStep(2);
  }, [step, periodOn]);

  useEffect(() => {
    document.querySelector("[data-log-step]")?.scrollIntoView({ block: "nearest" });
  }, [step]);

  async function onSave(event) {
    event?.preventDefault();
    if (savingRef.current) return;
    savingRef.current = true;
    setBusy(true);
    setError("");
    try {
      await saveLog({ ...draft, date });
      setStatus(t("log.saved"));
    } catch {
      setError(t("log.saveFailed"));
    } finally {
      savingRef.current = false;
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!stored) return;
    if (!window.confirm(t("log.confirmDelete"))) return;
    setBusy(true);
    setError("");
    try {
      await removeLog(date);
      setDraft(emptyLog(date));
      setStatus("");
    } catch {
      setError(t("log.saveFailed"));
    } finally {
      setBusy(false);
    }
  }

  const lastStep = 4;
  const stepLabel = t("log.stepOf").replace("{n}", String(step + 1)).replace("{total}", String(lastStep + 1));

  useEffect(() => {
    if (step !== lastStep || !dirty) return undefined;
    const timer = window.setTimeout(() => {
      onSave();
    }, 400);
    return () => window.clearTimeout(timer);
  }, [step, dirty, draft]);

  function goNext() {
    if (step === 0 && !periodOn) setStep(2);
    else setStep((value) => Math.min(lastStep, value + 1));
  }

  function goBack() {
    if (step === 2 && !periodOn) setStep(0);
    else setStep((value) => Math.max(0, value - 1));
  }

  function guardShortcut(event) {
    if (!confirmLeave()) event.preventDefault();
  }

  const shortcuts = (
    <div className="flex flex-wrap gap-3 text-sm font-medium text-plum">
      <Link to="/calendar" className="inline-flex items-center gap-1" onClick={guardShortcut}>
        <CalendarDays className="h-4 w-4" />
        {t("log.openCalendar")}
      </Link>
      <Link to="/insights" className="inline-flex items-center gap-1" onClick={guardShortcut}>
        <Sparkles className="h-4 w-4" />
        {t("log.openInsights")}
      </Link>
    </div>
  );

  return (
    <form className="log-page mx-auto max-w-2xl" onSubmit={onSave}>
      <div className="page-enter space-y-5">
      <header className="flex items-start gap-3">
        <Doodle kind="journal" className="h-14 w-14 shrink-0" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lavender-500">{t("nav.log")}</p>
          <h1 className="mt-1 font-display text-3xl">{t("log.title")}</h1>
        </div>
      </header>

      <Card>
        <p className="font-display text-2xl text-ink-900">
          {formatDisplayDate(date, locale, { weekday: "long", day: "numeric", month: "short" })}
        </p>
        <p className={`mt-1 text-sm ${stored ? "text-plum" : "text-ink-500"}`}>
          {stored ? t("log.existing") : t("log.newEntry")}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lavender-50 motion-safe:transition hover:bg-lavender-100"
            onClick={() => setDate(addDays(date, -1))}
            aria-label={t("common.previous")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <label className="min-w-0 flex-1">
            <span className="sr-only">{t("log.date")}</span>
            <input
              type="date"
              value={date}
              onChange={(event) => event.target.value && setDate(event.target.value)}
              className="ui-input"
            />
          </label>
          <button
            type="button"
            className="inline-flex h-11 shrink-0 items-center rounded-2xl bg-lavender-50 px-3 text-sm font-medium text-plum motion-safe:transition hover:bg-lavender-100"
            onClick={() => setDate(today)}
          >
            {t("log.jumpToday")}
          </button>
          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lavender-50 motion-safe:transition hover:bg-lavender-100"
            onClick={() => setDate(addDays(date, 1))}
            aria-label={t("common.next")}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <ul className="mt-3 flex gap-1" aria-label={t("log.dateStrip")}>
          {strip.map((iso) => {
            const saved = savedDates.has(iso);
            const active = iso === date;
            return (
              <li key={iso} className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => setDate(iso)}
                  className={`flex min-h-11 w-full min-w-0 flex-col items-center justify-center rounded-xl text-[10px] motion-safe:transition ${
                    active ? "bg-plum text-cream-50" : "bg-cream-50 text-ink-700 hover:bg-lavender-50"
                  }`}
                  aria-current={active ? "date" : undefined}
                  aria-label={`${formatDisplayDate(iso, locale, { weekday: "short", day: "numeric" })}${saved ? `, ${t("log.existing")}` : ""}`}
                >
                  <span>{formatDisplayDate(iso, locale, { weekday: "narrow" })}</span>
                  <span className="font-medium">{Number(iso.slice(8))}</span>
                  {saved ? <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${active ? "bg-cream-50" : "bg-rose-500"}`} /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      <p className="text-base font-medium text-plum" aria-live="polite">
        {stepLabel}
      </p>
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: lastStep + 1 }, (_, index) => (
          <span key={index} className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-plum" : "bg-lavender-200"}`} />
        ))}
      </div>

      <div data-log-step>
      {step === 0 ? (
      <Card>
        <ChoiceGroup legend={t("log.groupPeriod")}>
          <div className="grid grid-cols-2 gap-2">
            <SelectCard selected={!periodOn} doodle="mood-calm" onClick={() => patch({ periodStatus: "none", flow: "none" })}>
              {t("log.periodOff")}
            </SelectCard>
            <SelectCard
              selected={periodOn}
              doodle="drop"
              onClick={() =>
                patch({
                  periodStatus: periodOn ? "continue" : "start",
                  flow: draft.flow === "none" ? "light" : draft.flow,
                })
              }
            >
              {t("log.periodOn")}
            </SelectCard>
          </div>
        </ChoiceGroup>
      </Card>
      ) : null}

      {step === 1 ? (
      <Card>
        <SectionHead doodle="drop" title={t("log.groupFlow")} />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {FLOW_OPTIONS.map((value) => (
            <SelectCard key={value} selected={draft.flow === value} doodle={FLOW_DOODLE[value]} onClick={() => patch({ flow: value })}>
              {t(`log.flowOpts.${value}`)}
            </SelectCard>
          ))}
        </div>
        {showHeavy ? (
          <div className="mt-4 rounded-2xl bg-rose-50 p-4">
            <CardKicker>{t("log.followHeavyTitle")}</CardKicker>
            <p className="mt-3 text-sm">{t("log.heavySoaking")}</p>
            {yesNo(
              draft.followUp.heavy.soaking,
              (soaking) => patch({ followUp: { ...draft.followUp, heavy: { ...draft.followUp.heavy, soaking } } }),
              t("log.yes"),
              t("log.no"),
            )}
            <p className="mt-3 text-sm">{t("log.heavyClots")}</p>
            {yesNo(
              draft.followUp.heavy.clots,
              (clots) => patch({ followUp: { ...draft.followUp, heavy: { ...draft.followUp.heavy, clots } } }),
              t("log.yes"),
              t("log.no"),
            )}
            <p className="mt-3 text-sm">{t("log.heavyDizzy")}</p>
            {yesNo(
              draft.followUp.heavy.dizziness,
              (dizziness) => patch({ followUp: { ...draft.followUp, heavy: { ...draft.followUp.heavy, dizziness } } }),
              t("log.yes"),
              t("log.no"),
            )}
            <p className="mt-3 text-sm">{t("log.heavyBreath")}</p>
            {yesNo(
              draft.followUp.heavy.breathlessness,
              (breathlessness) =>
                patch({ followUp: { ...draft.followUp, heavy: { ...draft.followUp.heavy, breathlessness } } }),
              t("log.yes"),
              t("log.no"),
            )}
          </div>
        ) : null}
        {periodOn ? (
        <div className="mt-4">
          <p className="text-sm">{t("log.afterSex")}</p>
          {yesNo(
            draft.followUp.afterSex,
            (afterSex) => patch({ followUp: { ...draft.followUp, afterSex } }),
            t("log.yes"),
            t("log.no"),
          )}
        </div>
        ) : null}
      </Card>
      ) : null}

      {step === 2 ? (
      <Card>
        <SectionHead doodle="bottle" title={t("log.groupPain")} />
        <Field label={t("log.pain")}>
          <input
            type="range"
            min="0"
            max="10"
            value={draft.pain}
            onChange={(event) => patch({ pain: Number(event.target.value) })}
            className="w-full accent-rose-500"
            aria-valuetext={`${draft.pain}`}
          />
          <p className="mt-1 text-sm text-ink-500">{draft.pain}/10</p>
        </Field>
        {showPainFollow ? (
          <div className="mt-4 rounded-2xl bg-cream-50 p-4">
            <CardKicker>{t("log.followPainTitle")}</CardKicker>
            <p className="mt-3 text-sm">{t("log.painMissed")}</p>
            {yesNo(
              draft.followUp.pain.missedActivity,
              (missedActivity) =>
                patch({ followUp: { ...draft.followUp, pain: { ...draft.followUp.pain, missedActivity } } }),
              t("log.yes"),
              t("log.no"),
            )}
            <p className="mt-3 text-sm">{t("log.painRest")}</p>
            {yesNo(
              draft.followUp.pain.neededRest,
              (neededRest) => patch({ followUp: { ...draft.followUp, pain: { ...draft.followUp.pain, neededRest } } }),
              t("log.yes"),
              t("log.no"),
            )}
            <p className="mt-3 text-sm">{t("log.painNoRelief")}</p>
            {yesNo(
              draft.followUp.pain.noRelief,
              (noRelief) => patch({ followUp: { ...draft.followUp, pain: { ...draft.followUp.pain, noRelief } } }),
              t("log.yes"),
              t("log.no"),
            )}
          </div>
        ) : null}
        <p className="mt-3 text-base text-ink-500">{t("log.optional")}</p>
      </Card>
      ) : null}

      {step === 4 ? (
      <Card>
        <ChoiceGroup legend={t("log.groupSymptoms")}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {visibleSymptoms.map((id) => (
              <SelectCard
                key={id}
                selected={symptomSet.has(id)}
                doodle={SYMPTOM_DOODLE[id] ?? "spark"}
                onClick={() => {
                  const next = symptomSet.has(id)
                    ? draft.symptoms.filter((item) => item !== id)
                    : [...draft.symptoms, id];
                  patch({ symptoms: next });
                }}
              >
                {t(`log.symptomOpts.${id}`)}
              </SelectCard>
            ))}
          </div>
        </ChoiceGroup>
        <p className="mt-3 text-base text-ink-500">{t("log.optional")}</p>
      </Card>
      ) : null}

      {step === 3 ? (
      <>
      <Card>
        <SectionHead doodle="mood" title={t("log.qFeel")} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {MOOD_OPTIONS.map((value) => (
            <SelectCard
              key={value}
              selected={draft.mood === value}
              doodle={MOOD_DOODLE[value]}
              onClick={() => patch({ mood: draft.mood === value ? "" : value })}
            >
              {t(`log.moodOpts.${value}`)}
            </SelectCard>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHead doodle="sun" title={t("log.groupEnergy")} />
        <div className="grid grid-cols-3 gap-2">
          {ENERGY_OPTIONS.map((value) => (
            <SelectCard
              key={value}
              selected={draft.energy === value}
              doodle={ENERGY_DOODLE[value]}
              onClick={() => patch({ energy: draft.energy === value ? "" : value })}
            >
              {t(`log.energyOpts.${value}`)}
            </SelectCard>
          ))}
        </div>
        <p className="mt-3 text-base text-ink-500">{t("log.optional")}</p>
      </Card>
      </>
      ) : null}

      {step === 4 ? (
      <>
      <Card>
        <SectionHead doodle="moon" title={t("log.groupSleep")} />
        <Field label={t("log.sleepHours")}>
          <input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={draft.sleepHours}
            onChange={(event) => patch({ sleepHours: event.target.value })}
            className="ui-input"
          />
        </Field>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {SLEEP_OPTIONS.map((value) => (
            <SelectCard
              key={value}
              selected={draft.sleep === value}
              doodle={SLEEP_DOODLE[value]}
              onClick={() => patch({ sleep: draft.sleep === value ? "" : value })}
            >
              {t(`log.sleepOpts.${value}`)}
            </SelectCard>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHead doodle="notebook" title={t("log.groupNotes")} />
        <Field label={t("log.medicines")} hint={t("log.medicinesHint")}>
          <input
            value={draft.medicines}
            onChange={(event) => patch({ medicines: event.target.value })}
            className="ui-input"
          />
        </Field>
        <Field label={t("log.notes")}>
          <textarea
            value={draft.notes}
            onChange={(event) => patch({ notes: event.target.value })}
            rows={4}
            className="ui-input min-h-[6.5rem]"
          />
        </Field>
      </Card>
      </>
      ) : null}

      </div>
      {stored ? (
        <Card className="bg-lavender-50">
          <div className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 text-plum" />
            <div>
              <CardTitle className="text-lg">{t("log.summaryTitle")}</CardTitle>
              <p className="mt-2 text-sm text-ink-700">{savedSummary(stored, t)}</p>
            </div>
          </div>
        </Card>
      ) : null}

      {shortcuts}

      {error ? (
        <p className="text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
      {status ? (
        <p className="text-sm text-plum" role="status">
          {status}
        </p>
      ) : null}

      </div>
      <div className="log-dock rounded-2.5xl bg-cream-50/95 p-3 shadow-float ring-1 ring-lavender-100 backdrop-blur">
        <p className="mb-2 text-center text-base text-ink-500">{dirty ? t("log.dirty") : t("log.savedState")}</p>
        <div className="flex flex-row flex-wrap gap-2">
          {step > 0 ? (
            <Button type="button" variant="secondary" className="flex-1" onClick={goBack}>
              {t("common.previous")}
            </Button>
          ) : null}
          {step < lastStep ? (
            <Button type="button" variant="ghost" className="flex-1" onClick={goNext}>
              {t("log.skip")}
            </Button>
          ) : null}
          {dirty ? (
            <Button type="submit" className="flex-1" disabled={busy}>
              {t("log.save")}
            </Button>
          ) : step < lastStep ? (
            <Button type="button" className="flex-1" onClick={goNext}>
              {t("common.next")}
            </Button>
          ) : null}
          {stored ? (
            <Button type="button" variant="secondary" className="flex-1" disabled={busy} onClick={onDelete}>
              {t("log.delete")}
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
