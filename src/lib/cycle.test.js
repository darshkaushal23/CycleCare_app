import { describe, expect, it } from "vitest";
import {
  MAX_CYCLES_USED,
  derivePeriodsFromLogs,
  getCompleteCycles,
  isBleedingLog,
  isPeriodDay,
  median,
  predictNextPeriod,
  uncertaintySpread,
} from "./cycle";
import { addDays } from "./dates";

function periodLogs(start, length, extras = {}) {
  return Array.from({ length }, (_, index) => ({
    date: addDays(start, index),
    periodStatus: index === 0 ? "start" : index === length - 1 ? "end" : "continue",
    flow: index === 0 ? "medium" : "light",
    ...extras,
  }));
}

describe("period derivation", () => {
  it("groups consecutive bleeding days and ignores gaps", () => {
    const logs = [
      ...periodLogs("2026-01-01", 3),
      { date: "2026-01-10", flow: "none", periodStatus: "none" },
      ...periodLogs("2026-01-20", 2),
    ];
    const periods = derivePeriodsFromLogs(logs);
    expect(periods).toHaveLength(2);
    expect(periods[0]).toMatchObject({ startDate: "2026-01-01", endDate: "2026-01-03", duration: 3 });
    expect(periods[1]).toMatchObject({ startDate: "2026-01-20", endDate: "2026-01-21" });
  });

  it("does not treat missing days or isolated spotting as a period", () => {
    const logs = [
      ...periodLogs("2026-04-11", 3),
      { date: "2026-04-08", flow: "spotting", periodStatus: "none" },
    ];
    expect(isBleedingLog(logs[3])).toBe(true);
    expect(isPeriodDay(logs[3])).toBe(false);
    expect(derivePeriodsFromLogs(logs)).toHaveLength(1);
    expect(derivePeriodsFromLogs(logs)[0].startDate).toBe("2026-04-11");
  });
});

describe("predictions", () => {
  it("requires three complete cycles and uses up to six recent ones", () => {
    const twoStarts = derivePeriodsFromLogs([...periodLogs("2026-01-01", 4), ...periodLogs("2026-01-29", 4)]);
    expect(predictNextPeriod(twoStarts).canPredict).toBe(false);
    expect(predictNextPeriod(twoStarts).window).toBeNull();

    const fourStarts = derivePeriodsFromLogs(
      [0, 28, 56, 84].flatMap((offset) => periodLogs(addDays("2026-01-01", offset), 4)),
    );
    const ready = predictNextPeriod(fourStarts);
    expect(ready.completeCycleCount).toBe(3);
    expect(ready.canPredict).toBe(true);
    expect(ready.medianLength).toBe(28);
    expect(ready.isEstimate).toBe(true);
    expect(ready.contraceptionSafeToAssume).toBe(false);
    expect(ready.skipOvulation).toBe(false);
    expect(ready.ovulationWindow).not.toBeNull();

    const many = derivePeriodsFromLogs(
      Array.from({ length: 10 }, (_, index) => periodLogs(addDays("2025-01-01", index * 28), 4)).flat(),
    );
    const prediction = predictNextPeriod(many);
    expect(prediction.completeCycleCount).toBe(9);
    expect(prediction.usedCycleCount).toBe(MAX_CYCLES_USED);
    expect(getCompleteCycles(many).length).toBe(MAX_CYCLES_USED);
  });

  it("uses the median and widens the window when lengths vary", () => {
    expect(median([21, 28, 45])).toBe(28);
    expect(median([21, 28, 32, 45])).toBe(30);
    const irregular = derivePeriodsFromLogs(
      [
        ["2026-02-08", 5],
        ["2026-03-04", 5],
        ["2026-04-11", 5],
        ["2026-05-02", 4],
        ["2026-06-16", 6],
      ].flatMap(([start, days]) => periodLogs(start, days)),
    );
    const prediction = predictNextPeriod(irregular);
    expect(prediction.canPredict).toBe(true);
    expect(prediction.irregular).toBe(true);
    expect(prediction.skipOvulation).toBe(true);
    expect(prediction.ovulationWindow).toBeNull();
    expect(prediction.spread).toBeGreaterThanOrEqual(uncertaintySpread(prediction.cycleLengths));
    expect(prediction.window).not.toBeNull();
    expect(prediction.window.end > prediction.window.start).toBe(true);
  });

  it("places ovulation about 14 days before the next expected period", () => {
    const regular = derivePeriodsFromLogs(
      [0, 28, 56, 84].flatMap((offset) => periodLogs(addDays("2026-01-01", offset), 4)),
    );
    const prediction = predictNextPeriod(regular);
    expect(prediction.ovulationWindow.ovulation).toBe(addDays(prediction.window.center, -14));
    expect(prediction.ovulationWindow.start).toBe(addDays(prediction.ovulationWindow.ovulation, -5));
    expect(prediction.ovulationWindow.end).toBe(prediction.ovulationWindow.ovulation);
  });

  it("asks about a forgotten period before counting a far-longer gap", () => {
    const periods = derivePeriodsFromLogs(
      [0, 28, 56, 84, 154].flatMap((offset) => periodLogs(addDays("2026-01-01", offset), 4)),
    );
    const prediction = predictNextPeriod(periods);
    expect(prediction.possibleMissed.length).toBeGreaterThan(0);
    expect(prediction.cycleLengths.every((length) => length < 60)).toBe(true);
    expect(prediction.canPredict).toBe(true);
  });

  it("pauses predictions in pregnancy mode", () => {
    const periods = derivePeriodsFromLogs(
      [0, 28, 56, 84].flatMap((offset) => periodLogs(addDays("2026-01-01", offset), 4)),
    );
    const prediction = predictNextPeriod(periods, { pregnancyMode: true });
    expect(prediction.canPredict).toBe(false);
    expect(prediction.reason).toBe("pregnancy");
    expect(prediction.window).toBeNull();
  });
});
