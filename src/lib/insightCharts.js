import { ENERGY_OPTIONS, MOOD_OPTIONS } from "./logFields";

/** Distinct chart ranks so stored mood labels are not collapsed onto “low”. */
export const MOOD_CHART = {
  low: 1,
  anxious: 2,
  irritable: 3,
  okay: 4,
  good: 5,
};

export const ENERGY_CHART = {
  low: 1,
  okay: 2,
  good: 3,
};

export function mean(values) {
  const nums = (values ?? []).filter((value) => value != null && Number.isFinite(Number(value)));
  if (!nums.length) return null;
  return nums.reduce((sum, value) => sum + Number(value), 0) / nums.length;
}

export function moodChartPoint(log, labelFor) {
  if (!log?.mood || MOOD_CHART[log.mood] == null) return null;
  return {
    date: log.date,
    mood: MOOD_CHART[log.mood],
    label: labelFor ? labelFor(log.mood) : log.mood,
  };
}

export function energyChartPoint(log, labelFor) {
  if (!log?.energy || ENERGY_CHART[log.energy] == null) return null;
  return {
    date: log.date,
    energy: ENERGY_CHART[log.energy],
    label: labelFor ? labelFor(log.energy) : log.energy,
  };
}

export function moodTicks() {
  return [...new Set(MOOD_OPTIONS.map((id) => MOOD_CHART[id]))].sort((a, b) => a - b);
}

export function energyTicks() {
  return ENERGY_OPTIONS.map((id) => ENERGY_CHART[id]);
}

export { MOOD_OPTIONS, ENERGY_OPTIONS };
