export const FLOW_OPTIONS = ["none", "spotting", "light", "medium", "heavy"];
export const PERIOD_STATUS = ["none", "start", "continue", "end"];
export const MOOD_OPTIONS = ["low", "okay", "good", "anxious", "irritable"];
export const ENERGY_OPTIONS = ["low", "okay", "good"];
export const SLEEP_OPTIONS = ["poor", "okay", "good"];
export const SYMPTOM_OPTIONS = [
  "cramps",
  "headache",
  "acne",
  "bloating",
  "fatigue",
  "mood-swings",
  "sleep-trouble",
  "backache",
  "nausea",
  "breast-tenderness",
  "spotting-worry",
];

export const DEFAULT_TRACKED_SYMPTOMS = [
  "cramps",
  "headache",
  "acne",
  "bloating",
  "fatigue",
  "mood-swings",
  "sleep-trouble",
];

export const SYMPTOM_ICONS = {
  cramps: "Zap",
  headache: "CloudFog",
  acne: "Sparkle",
  bloating: "CircleDot",
  fatigue: "BatteryLow",
  "mood-swings": "SmilePlus",
  "sleep-trouble": "Moon",
  backache: "PersonStanding",
  nausea: "Droplets",
  "breast-tenderness": "Heart",
  "spotting-worry": "Droplet",
};

export const FLOW_ICONS = {
  none: "Circle",
  spotting: "Droplet",
  light: "Droplets",
  medium: "Waves",
  heavy: "CloudRain",
};

export function emptyLog(date) {
  return {
    date,
    periodStatus: "none",
    flow: "none",
    pain: 0,
    symptoms: [],
    mood: "",
    energy: "",
    sleep: "",
    sleepHours: "",
    medicines: "",
    notes: "",
    followUp: {
      heavy: { clots: false, soaking: false, dizziness: false, breathlessness: false },
      pain: { missedActivity: false, neededRest: false, noRelief: false },
      afterSex: false,
    },
  };
}

export function logFingerprint(log) {
  const n = normalizeLog(log, log?.date);
  return JSON.stringify({
    periodStatus: n.periodStatus,
    flow: n.flow,
    pain: Number(n.pain) || 0,
    symptoms: [...(n.symptoms ?? [])].sort(),
    mood: n.mood ?? "",
    energy: n.energy ?? "",
    sleep: n.sleep ?? "",
    sleepHours: n.sleepHours === "" || n.sleepHours == null ? "" : String(n.sleepHours),
    medicines: n.medicines ?? "",
    notes: n.notes ?? "",
    followUp: n.followUp,
  });
}

export function normalizeLog(log, date) {
  const base = emptyLog(date ?? log?.date);
  if (!log) return base;
  return {
    ...base,
    ...log,
    date: log.date ?? date,
    symptoms: Array.isArray(log.symptoms) ? log.symptoms : [],
    sleepHours: log.sleepHours ?? "",
    followUp: {
      heavy: { ...base.followUp.heavy, ...(log.followUp?.heavy ?? {}) },
      pain: { ...base.followUp.pain, ...(log.followUp?.pain ?? {}) },
      afterSex: Boolean(log.followUp?.afterSex),
    },
  };
}
