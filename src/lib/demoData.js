import { eachDay } from "./dates";

/**
 * Fictional demo profile: a 17-year-old student with irregular cycles.
 * Spans eight months of period and symptom logs. Explicitly marked isDemo.
 */

export const DEMO_PERIODS = [
  { id: "demo-p1", startDate: "2026-02-08", endDate: "2026-02-13" },
  { id: "demo-p2", startDate: "2026-03-04", endDate: "2026-03-08" },
  { id: "demo-p3", startDate: "2026-04-11", endDate: "2026-04-16" },
  { id: "demo-p4", startDate: "2026-05-02", endDate: "2026-05-05" },
  { id: "demo-p5", startDate: "2026-06-16", endDate: "2026-06-23" },
  { id: "demo-p6", startDate: "2026-07-18", endDate: "2026-07-22" },
  { id: "demo-p7", startDate: "2026-08-15", endDate: "2026-08-19" },
  { id: "demo-p8", startDate: "2026-09-25", endDate: "2026-09-30" },
];

const FLOW_BY_OFFSET = {
  0: "medium",
  1: "heavy",
  2: "medium",
  3: "light",
  4: "light",
  5: "spotting",
  6: "spotting",
  7: "spotting",
};

const PERIOD_SYMPTOMS = {
  0: ["cramps", "fatigue", "backache"],
  1: ["cramps", "bloating", "mood-swings"],
  2: ["fatigue", "headache", "bloating"],
  3: ["acne", "cramps"],
  4: ["fatigue"],
  5: ["spotting-worry"],
  6: [],
};

function periodLogs() {
  const logs = [];
  DEMO_PERIODS.forEach((period) => {
    const days = eachDay(period.startDate, period.endDate);
    days.forEach((date, index) => {
      const flow = FLOW_BY_OFFSET[index] ?? "light";
      const pain = index <= 1 ? 6 : index === 2 ? 4 : 2;
      logs.push({
        date,
        isDemo: true,
        periodStatus: index === 0 ? "start" : index === days.length - 1 ? "end" : "continue",
        flow,
        pain,
        mood: index <= 1 ? "low" : "okay",
        energy: index <= 2 ? "low" : "okay",
        sleep: index <= 1 ? "poor" : "okay",
        medicines: pain >= 6 ? "mefenamic acid 250mg" : "",
        symptoms: PERIOD_SYMPTOMS[index] ?? [],
        notes:
          index === 1
            ? "Missed morning assembly. Heat pack helped more than walking."
            : "",
        followUp: {
          heavy: {
            clots: flow === "heavy",
            soaking: flow === "heavy",
            dizziness: false,
          },
          pain: {
            missedActivity: pain >= 6,
            neededRest: pain >= 6,
          },
        },
      });
    });
  });
  return logs;
}

const EXTRA_LOGS = [
  {
    date: "2026-02-22",
    periodStatus: "none",
    flow: "none",
    pain: 1,
    mood: "okay",
    energy: "okay",
    symptoms: ["acne", "bloating"],
    notes: "Mid-cycle bloating after a long coaching class day.",
  },
  {
    date: "2026-03-20",
    periodStatus: "none",
    flow: "none",
    pain: 0,
    mood: "anxious",
    energy: "low",
    symptoms: ["headache", "fatigue"],
    notes: "Period still not here. Checking the calendar twice.",
  },
  {
    date: "2026-03-28",
    periodStatus: "none",
    flow: "none",
    pain: 2,
    mood: "low",
    energy: "low",
    symptoms: ["fatigue", "mood-swings"],
    notes: "Waiting made sports practice feel harder.",
  },
  {
    date: "2026-04-08",
    flow: "spotting",
    pain: 3,
    mood: "okay",
    energy: "low",
    symptoms: ["cramps", "spotting-worry"],
    notes: "Light spotting three days before flow started.",
  },
  {
    date: "2026-05-18",
    periodStatus: "none",
    flow: "none",
    pain: 0,
    mood: "okay",
    energy: "good",
    symptoms: ["acne"],
    notes: "Skin breakout week after a very short cycle.",
  },
  {
    date: "2026-06-04",
    periodStatus: "none",
    flow: "none",
    pain: 1,
    mood: "anxious",
    energy: "okay",
    symptoms: ["bloating", "headache"],
    notes: "Cycle running long again. Logged so I do not only remember the fear.",
  },
  {
    date: "2026-06-12",
    periodStatus: "none",
    flow: "none",
    pain: 4,
    mood: "low",
    energy: "low",
    symptoms: ["cramps", "backache", "fatigue"],
    notes: "Cramps arrived before bleeding. Stayed home from tuitions.",
  },
  {
    date: "2026-07-02",
    periodStatus: "none",
    flow: "none",
    pain: 0,
    mood: "okay",
    energy: "good",
    symptoms: ["acne"],
    notes: "",
  },
  {
    date: "2026-07-30",
    periodStatus: "none",
    flow: "none",
    pain: 2,
    mood: "okay",
    energy: "low",
    symptoms: ["fatigue", "mood-swings"],
    notes: "Slept through an afternoon. Exam week + late cycle.",
  },
  {
    date: "2026-08-28",
    periodStatus: "none",
    flow: "none",
    pain: 1,
    mood: "anxious",
    energy: "okay",
    symptoms: ["headache"],
    notes: "Wondering if September will be late like April and June.",
  },
  {
    date: "2026-09-20",
    periodStatus: "none",
    flow: "none",
    pain: 3,
    mood: "low",
    energy: "low",
    symptoms: ["cramps", "bloating", "fatigue"],
    notes: "Premenstrual crash. Flow began five days later.",
  },
  {
    date: "2026-10-08",
    periodStatus: "none",
    flow: "none",
    pain: 0,
    mood: "okay",
    energy: "good",
    symptoms: ["acne"],
    notes: "No period yet this month. Logging the wait instead of guessing.",
  },
  {
    date: "2026-10-18",
    periodStatus: "none",
    flow: "none",
    pain: 1,
    mood: "okay",
    energy: "okay",
    symptoms: ["bloating"],
    notes: "School sports day. Mild bloating, no flow.",
  },
];

export function buildDemoLogs() {
  const byDate = new Map();
  [...periodLogs(), ...EXTRA_LOGS.map((log) => ({ ...log, isDemo: true }))].forEach((log) => {
    byDate.set(log.date, log);
  });
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function buildDemoPeriods() {
  return DEMO_PERIODS.map((period) => ({
    ...period,
    isDemo: true,
    source: "demo",
  }));
}

