import { CONFIG } from "./config";
import { addDays, daysBetween, eachDay, todayISO } from "./dates";

export const BLEEDING_FLOWS = ["spotting", "light", "medium", "heavy"];
export const MIN_CYCLES_FOR_PREDICTION = CONFIG.minCyclesForPrediction;
export const MAX_CYCLES_USED = CONFIG.maxCyclesUsed;

export function isPeriodDay(log) {
  if (!log) return false;
  if (log.periodStatus && log.periodStatus !== "none") return true;
  return log.flow === "light" || log.flow === "medium" || log.flow === "heavy";
}

export function isBleedingLog(log) {
  if (!log) return false;
  return isPeriodDay(log) || log.flow === "spotting";
}

export function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

export function quartile(values, q) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sorted[base + 1] ?? sorted[base];
  return sorted[base] + rest * (next - sorted[base]);
}

export function derivePeriodsFromLogs(logs) {
  const bleedingDates = [...new Set(logs.filter(isPeriodDay).map((log) => log.date))].sort();
  if (!bleedingDates.length) return [];

  const groups = [];
  let current = [bleedingDates[0]];

  for (let i = 1; i < bleedingDates.length; i += 1) {
    if (daysBetween(bleedingDates[i - 1], bleedingDates[i]) === 1) {
      current.push(bleedingDates[i]);
    } else {
      groups.push(current);
      current = [bleedingDates[i]];
    }
  }
  groups.push(current);

  return groups.map((dates, index) => ({
    id: `derived-${dates[0]}`,
    startDate: dates[0],
    endDate: dates[dates.length - 1],
    days: dates,
    duration: dates.length,
    source: "logs",
    isDemo: logs.some((log) => log.date === dates[0] && log.isDemo),
    index,
  }));
}

export function getCompleteCycles(periods, { max = MAX_CYCLES_USED } = {}) {
  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const cycles = [];
  for (let i = 0; i < sorted.length - 1; i += 1) {
    cycles.push({
      startDate: sorted[i].startDate,
      nextStart: sorted[i + 1].startDate,
      endDate: sorted[i].endDate,
      length: daysBetween(sorted[i].startDate, sorted[i + 1].startDate),
      periodDuration: sorted[i].duration ?? daysBetween(sorted[i].startDate, sorted[i].endDate) + 1,
    });
  }
  return markPossibleMissed(cycles).slice(-max);
}

export function isPossibleMissedLog(length, otherLengths) {
  if (otherLengths.length < 2 || length == null) return false;
  const typical = median(otherLengths);
  if (typical == null) return false;
  return (
    length >= typical + CONFIG.forgottenExtraDays && length >= typical * CONFIG.forgottenFactor
  );
}

function markPossibleMissed(cycles) {
  const lengths = cycles.map((cycle) => cycle.length);
  return cycles.map((cycle, index) => {
    const others = lengths.filter((_, i) => i !== index);
    return { ...cycle, possibleMissedLog: isPossibleMissedLog(cycle.length, others) };
  });
}

export function isIrregularLengths(lengths) {
  if (lengths.length < MIN_CYCLES_FOR_PREDICTION) return true;
  const min = Math.min(...lengths);
  const max = Math.max(...lengths);
  return max - min > CONFIG.irregularSpreadDays;
}

export function uncertaintySpread(lengths, { irregular = false } = {}) {
  if (!lengths.length) return null;
  const min = Math.min(...lengths);
  const max = Math.max(...lengths);
  const range = max - min;
  const iqr = (quartile(lengths, 0.75) ?? 0) - (quartile(lengths, 0.25) ?? 0);
  let spread = Math.max(CONFIG.minWindowSpreadDays, Math.round(iqr / 2) || CONFIG.minWindowSpreadDays);
  if (range > CONFIG.irregularSpreadDays) spread = Math.max(spread, Math.round(range / 3));
  if (irregular) spread = Math.max(spread, Math.round(range / 2) || spread, 4);
  if (range >= 14) spread = Math.max(spread, Math.round(range / 2), 7);
  return spread;
}

function ovulationFromCenter(center) {
  if (!center) return null;
  const ovulation = addDays(center, -CONFIG.lutealDaysBeforePeriod);
  return {
    ovulation,
    start: addDays(ovulation, -CONFIG.fertileDaysBeforeOvulation),
    end: ovulation,
  };
}

export function predictNextPeriod(periods, { today = todayISO(), pregnancyMode = false } = {}) {
  if (pregnancyMode) {
    return {
      canPredict: false,
      reason: "pregnancy",
      isEstimate: true,
      contraceptionSafeToAssume: false,
      completeCycleCount: 0,
      usedCycleCount: 0,
      cycleLengths: [],
      allCycleLengths: [],
      cycles: [],
      medianLength: null,
      minLength: null,
      maxLength: null,
      spread: null,
      window: null,
      irregular: false,
      ovulationWindow: null,
      skipOvulation: true,
      lastPeriod: [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate)).at(-1) ?? null,
      daysSinceLastStart: null,
      periodDurations: [],
      medianPeriodDuration: null,
      minPeriodDuration: null,
      maxPeriodDuration: null,
      possibleMissed: [],
      needThreeMessage: false,
    };
  }

  const allCycles = getCompleteCycles(periods, { max: 99 });
  const recent = allCycles.slice(-MAX_CYCLES_USED);
  const counted = recent.filter((cycle) => !cycle.possibleMissedLog);
  const possibleMissed = recent.filter((cycle) => cycle.possibleMissedLog);
  const lengths = counted.map((cycle) => cycle.length);
  const durations = periods
    .filter((period) => period.endDate)
    .map((period) => period.duration ?? daysBetween(period.startDate, period.endDate) + 1);

  const lastPeriod = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate)).at(-1) ?? null;
  const completeCycleCount = allCycles.length;
  const canPredict = counted.length >= MIN_CYCLES_FOR_PREDICTION;
  const irregular = canPredict ? isIrregularLengths(lengths) : completeCycleCount > 0;
  const medianLength = median(lengths);
  const spread = canPredict ? uncertaintySpread(lengths, { irregular }) : null;

  let window = null;
  if (canPredict && lastPeriod && medianLength != null && spread != null) {
    const center = addDays(lastPeriod.startDate, Math.round(medianLength));
    window = {
      start: addDays(center, -spread),
      end: addDays(center, spread),
      center,
    };
  }

  const ovulationWindow = canPredict && !irregular && window ? ovulationFromCenter(window.center) : null;

  return {
    canPredict,
    reason: canPredict ? "ok" : "insufficient",
    needThreeMessage: !canPredict,
    isEstimate: true,
    contraceptionSafeToAssume: false,
    completeCycleCount,
    usedCycleCount: lengths.length,
    cycleLengths: lengths,
    allCycleLengths: allCycles.map((cycle) => cycle.length),
    cycles: counted,
    recentCycles: recent,
    medianLength,
    minLength: lengths.length ? Math.min(...lengths) : null,
    maxLength: lengths.length ? Math.max(...lengths) : null,
    spread,
    window,
    irregular,
    ovulationWindow,
    skipOvulation: !canPredict || irregular,
    lastPeriod,
    daysSinceLastStart: lastPeriod ? daysBetween(lastPeriod.startDate, today) : null,
    periodDurations: durations,
    medianPeriodDuration: median(durations),
    minPeriodDuration: durations.length ? Math.min(...durations) : null,
    maxPeriodDuration: durations.length ? Math.max(...durations) : null,
    possibleMissed,
  };
}

export function describeCyclePosition(periods, prediction, { today = todayISO() } = {}) {
  const last = prediction?.lastPeriod ?? [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate)).at(-1);
  if (!last) return { day: null, phase: "none", inPeriod: false };
  const day = daysBetween(last.startDate, today) + 1;
  const inPeriod = today >= last.startDate && today <= last.endDate;
  if (inPeriod) return { day, phase: "period", inPeriod: true };
  const fertile = prediction?.ovulationWindow;
  if (fertile && today >= fertile.start && today <= fertile.end) {
    return { day, phase: "fertile", inPeriod: false };
  }
  const typical = prediction?.medianLength ?? 28;
  if (day <= Math.round(typical / 2)) return { day, phase: "afterPeriod", inPeriod: false };
  return { day, phase: "beforePeriod", inPeriod: false };
}

export function predictedDates(prediction) {
  if (!prediction?.window) return [];
  return eachDay(prediction.window.start, prediction.window.end);
}

export function logsByDate(logs) {
  return Object.fromEntries(logs.map((log) => [log.date, log]));
}

const MOOD_SCORE = { low: 1, anxious: 2, irritable: 2, okay: 3, good: 4 };
const ENERGY_SCORE = { low: 1, okay: 2, good: 3 };

export function scoreMood(mood) {
  return MOOD_SCORE[mood] ?? null;
}

export function scoreEnergy(energy) {
  return ENERGY_SCORE[energy] ?? null;
}

function cycleDayNumber(date, cycle) {
  return daysBetween(cycle.startDate, date) + 1;
}

export function buildInsights(periods, logs) {
  const prediction = predictNextPeriod(periods);
  const cycles = getCompleteCycles(periods, { max: 99 });
  const counted = cycles.filter((cycle) => !cycle.possibleMissedLog);
  const byDate = logsByDate(logs);
  const symptomCounts = {};
  const symptomCycleSets = {};
  const symptomDaysByCycle = {};

  logs.forEach((log) => {
    (log.symptoms ?? []).forEach((symptom) => {
      symptomCounts[symptom] = (symptomCounts[symptom] ?? 0) + 1;
      const cycleIndex = counted.findIndex(
        (cycle) => log.date >= cycle.startDate && log.date < cycle.nextStart,
      );
      if (!symptomCycleSets[symptom]) symptomCycleSets[symptom] = new Set();
      if (!symptomDaysByCycle[symptom]) symptomDaysByCycle[symptom] = [];
      if (cycleIndex >= 0) {
        symptomCycleSets[symptom].add(counted[cycleIndex].startDate);
        symptomDaysByCycle[symptom].push({
          cycle: counted[cycleIndex].startDate,
          day: cycleDayNumber(log.date, counted[cycleIndex]),
        });
      } else if (periods.length && log.date >= periods[periods.length - 1].startDate) {
        symptomCycleSets[symptom].add("open");
      }
    });
  });

  const symptomFrequency = Object.entries(symptomCounts)
    .map(([id, count]) => ({
      id,
      count,
      cycles: symptomCycleSets[id]?.size ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  const minCycles = CONFIG.minCyclesForPattern;
  const recurringSymptoms = symptomFrequency.filter((item) => item.cycles >= minCycles);

  const symptomPatterns = [];
  Object.entries(symptomDaysByCycle).forEach(([id, rows]) => {
    const cycleIds = [...new Set(rows.map((row) => row.cycle))];
    if (cycleIds.length < minCycles) return;
    const dayCounts = {};
    rows.forEach((row) => {
      dayCounts[row.day] = (dayCounts[row.day] ?? 0) + 1;
    });
    const commonDays = Object.entries(dayCounts)
      .filter(([, count]) => count >= minCycles)
      .map(([day]) => Number(day))
      .sort((a, b) => a - b);
    if (!commonDays.length) return;
    symptomPatterns.push({
      id,
      kind: "cycle-days",
      days: commonDays,
      cycles: cycleIds.length,
    });
  });

  const energyPrePeriod = [];
  counted.forEach((cycle) => {
    const preStart = addDays(cycle.nextStart, -5);
    const inPre = [];
    const other = [];
    eachDay(cycle.startDate, addDays(cycle.nextStart, -1)).forEach((date) => {
      const score = scoreEnergy(byDate[date]?.energy);
      if (score == null) return;
      if (date >= preStart) inPre.push(score);
      else other.push(score);
    });
    if (inPre.length && other.length) {
      const preAvg = inPre.reduce((a, b) => a + b, 0) / inPre.length;
      const otherAvg = other.reduce((a, b) => a + b, 0) / other.length;
      energyPrePeriod.push(preAvg < otherAvg - 0.2);
    }
  });
  const energyLowerCycles = energyPrePeriod.filter(Boolean).length;
  if (energyLowerCycles >= minCycles) {
    symptomPatterns.push({
      id: "energy-pre-period",
      kind: "energy-pre",
      cycles: energyLowerCycles,
    });
  }

  const moodEnergy = logs
    .filter((log) => scoreMood(log.mood) != null || scoreEnergy(log.energy) != null)
    .map((log) => ({
      date: log.date,
      mood: scoreMood(log.mood),
      energy: scoreEnergy(log.energy),
    }));

  return {
    prediction,
    cycleChart: counted.map((cycle, index) => ({
      name: `${index + 1}`,
      start: cycle.startDate,
      length: cycle.length,
      period: cycle.periodDuration,
    })),
    durationChart: periods.map((period, index) => ({
      name: `${index + 1}`,
      start: period.startDate,
      days: period.duration ?? daysBetween(period.startDate, period.endDate) + 1,
    })),
    symptomFrequency,
    recurringSymptoms,
    symptomPatterns,
    moodEnergy,
    averages: {
      cycleMedian: prediction.medianLength,
      cycleMin: prediction.minLength,
      cycleMax: prediction.maxLength,
      periodMedian: prediction.medianPeriodDuration,
      periodMin: prediction.minPeriodDuration,
      periodMax: prediction.maxPeriodDuration,
    },
    regularity: prediction.irregular ? "irregular" : prediction.canPredict ? "regular" : "unknown",
  };
}
