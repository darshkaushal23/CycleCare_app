import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BatteryLow,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleDot,
  CloudFog,
  CloudRain,
  Droplet,
  Droplets,
  Heart,
  Moon,
  PersonStanding,
  SmilePlus,
  Sparkle,
  Waves,
  Zap,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardKicker, CardTitle } from "../components/ui/Card";
import { Chip, ChoiceButton, ChoiceGroup } from "../components/ui/Input";
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
  normalizeLog,
} from "../lib/logFields";

const FLOW_ICON = { none: Circle, spotting: Droplet, light: Droplets, medium: Waves, heavy: CloudRain };
const SYMPTOM_ICON = {
  cramps: Zap,
  headache: CloudFog,
  acne: Sparkle,
  bloating: CircleDot,
  fatigue: BatteryLow,
  "mood-swings": SmilePlus,
  "sleep-trouble": Moon,
  backache: PersonStanding,
  nausea: Droplets,
  "breast-tenderness": Heart,
  "spotting-worry": Droplet,
};

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

export function LogPage() {
  const { t, lang, logs, saveLog, removeLog, settings } = useAppState();
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const [params, setParams] = useSearchParams();
  const requested = params.get("date");
  const date = isISODate(requested) ? requested : todayISO();
  const stored = logs.find((item) => item.date === date);
  const [draft, setDraft] = useState(() => normalizeLog(stored, date));
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const tracked = settings.trackedSymptoms?.length ? settings.trackedSymptoms : DEFAULT_TRACKED_SYMPTOMS;
  const visibleSymptoms = SYMPTOM_OPTIONS.filter((id) => tracked.includes(id));

  useEffect(() => {
    setDraft(normalizeLog(logs.find((item) => item.date === date), date));
    setStatus("");
  }, [date, logs]);

  function setDate(next) {
    setParams({ date: next });
  }

  function patch(partial) {
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
  const symptomSet = useMemo(() => new Set(draft.symptoms), [draft.symptoms]);

  async function onSave(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await saveLog({ ...draft, date });
      setStatus(t("log.saved"));
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!stored) return;
    if (!window.confirm(t("log.confirmDelete"))) return;
    setBusy(true);
    try {
      await removeLog(date);
      setDraft(emptyLog(date));
      setStatus(t("log.saved"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="page-enter mx-auto max-w-2xl space-y-4" onSubmit={onSave}>
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lavender-500">{t("nav.log")}</p>
        <h1 className="mt-1 font-display text-3xl">{t("log.title")}</h1>
      </header>

      <Card>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-lavender-50"
            onClick={() => setDate(addDays(date, -1))}
            aria-label={t("common.previous")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <label className="flex-1">
            <span className="sr-only">{t("log.date")}</span>
            <input
              type="date"
              value={date}
              onChange={(event) => event.target.value && setDate(event.target.value)}
              className="h-12 w-full rounded-2xl bg-cream-50 px-3 text-sm ring-1 ring-lavender-200"
            />
          </label>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-lavender-50"
            onClick={() => setDate(addDays(date, 1))}
            aria-label={t("common.next")}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-ink-500">{formatDisplayDate(date, locale, { weekday: "long" })}</p>
        <p className="mt-1 text-xs text-lavender-700">{stored ? t("log.existing") : t("log.newEntry")}</p>
      </Card>

      <Card>
        <ChoiceGroup legend={t("log.period")}>
          <div className="grid grid-cols-2 gap-2">
            <ChoiceButton selected={!periodOn} onClick={() => patch({ periodStatus: "none", flow: "none" })}>
              {t("log.periodOff")}
            </ChoiceButton>
            <ChoiceButton selected={periodOn} onClick={() => patch({ periodStatus: periodOn ? "continue" : "start", flow: draft.flow === "none" ? "light" : draft.flow })}>
              {t("log.periodOn")}
            </ChoiceButton>
          </div>
        </ChoiceGroup>
      </Card>

      <Card>
        <ChoiceGroup legend={t("log.flow")}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {FLOW_OPTIONS.map((value) => {
              const Icon = FLOW_ICON[value];
              return (
                <ChoiceButton
                  key={value}
                  selected={draft.flow === value}
                  className="flex min-h-[4.5rem] flex-col items-center justify-center gap-1 px-2 py-3"
                  onClick={() => patch({ flow: value })}
                >
                  <Icon className="h-5 w-5" />
                  <span>{t(`log.flowOpts.${value}`)}</span>
                </ChoiceButton>
              );
            })}
          </div>
        </ChoiceGroup>
      </Card>

      <Card>
        <label className="block">
          <span className="font-display text-lg">{t("log.pain")}</span>
          <input
            type="range"
            min="0"
            max="10"
            value={draft.pain}
            onChange={(event) => patch({ pain: Number(event.target.value) })}
            className="mt-3 w-full accent-rose-500"
          />
          <span className="mt-1 block text-sm text-ink-500">{draft.pain}</span>
        </label>
        <p className="mt-3 text-sm">{t("log.painMissed")}</p>
        {yesNo(
          draft.followUp.pain.missedActivity,
          (missedActivity) =>
            patch({ followUp: { ...draft.followUp, pain: { ...draft.followUp.pain, missedActivity } } }),
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
      </Card>

      {showHeavy ? (
        <Card>
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
        </Card>
      ) : null}

      <Card>
        <p className="text-sm">{t("log.afterSex")}</p>
        {yesNo(
          draft.followUp.afterSex,
          (afterSex) => patch({ followUp: { ...draft.followUp, afterSex } }),
          t("log.yes"),
          t("log.no"),
        )}
      </Card>

      <Card>
        <ChoiceGroup legend={t("log.symptoms")}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {visibleSymptoms.map((id) => {
              const Icon = SYMPTOM_ICON[id] ?? CircleDot;
              return (
                <ChoiceButton
                  key={id}
                  selected={symptomSet.has(id)}
                  className="flex min-h-[4.5rem] flex-col items-center justify-center gap-1 px-2 py-3"
                  onClick={() => {
                    const next = symptomSet.has(id)
                      ? draft.symptoms.filter((item) => item !== id)
                      : [...draft.symptoms, id];
                    patch({ symptoms: next });
                  }}
                >
                  <Icon className="h-5 w-5" />
                  {t(`log.symptomOpts.${id}`)}
                </ChoiceButton>
              );
            })}
          </div>
        </ChoiceGroup>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="font-display text-lg">{t("log.mood")}</p>
          <div className="mt-3 flex flex-col gap-2">
            {MOOD_OPTIONS.map((value) => (
              <Chip key={value} selected={draft.mood === value} onClick={() => patch({ mood: value })}>
                {t(`log.moodOpts.${value}`)}
              </Chip>
            ))}
          </div>
        </Card>
        <Card>
          <p className="font-display text-lg">{t("log.energy")}</p>
          <div className="mt-3 flex flex-col gap-2">
            {ENERGY_OPTIONS.map((value) => (
              <Chip key={value} selected={draft.energy === value} onClick={() => patch({ energy: value })}>
                {t(`log.energyOpts.${value}`)}
              </Chip>
            ))}
          </div>
        </Card>
        <Card>
          <p className="font-display text-lg">{t("log.sleepHours")}</p>
          <input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={draft.sleepHours}
            onChange={(event) => patch({ sleepHours: event.target.value })}
            className="mt-3 h-12 w-full rounded-2xl bg-cream-50 px-3 text-sm ring-1 ring-lavender-200"
          />
          <div className="mt-3 flex flex-col gap-2">
            {SLEEP_OPTIONS.map((value) => (
              <Chip key={value} selected={draft.sleep === value} onClick={() => patch({ sleep: value })}>
                {t(`log.sleepOpts.${value}`)}
              </Chip>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <label className="block">
          <span className="font-display text-lg">{t("log.medicines")}</span>
          <p className="mt-1 text-sm text-ink-500">{t("log.medicinesHint")}</p>
          <input
            value={draft.medicines}
            onChange={(event) => patch({ medicines: event.target.value })}
            className="mt-3 h-12 w-full rounded-2xl bg-cream-50 px-3 text-sm ring-1 ring-lavender-200"
          />
        </label>
        <label className="mt-4 block">
          <span className="font-display text-lg">{t("log.notes")}</span>
          <textarea
            value={draft.notes}
            onChange={(event) => patch({ notes: event.target.value })}
            rows={4}
            className="mt-3 w-full rounded-2xl bg-cream-50 px-3 py-3 text-sm ring-1 ring-lavender-200"
          />
        </label>
      </Card>

      {status ? (
        <p className="text-sm text-lavender-700" role="status">
          {status}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" className="flex-1" disabled={busy}>
          {t("log.save")}
        </Button>
        {stored ? (
          <Button type="button" variant="secondary" className="flex-1" disabled={busy} onClick={onDelete}>
            {t("log.delete")}
          </Button>
        ) : null}
      </div>
      <CardTitle className="sr-only">{t("log.title")}</CardTitle>
    </form>
  );
}
