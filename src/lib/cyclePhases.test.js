import { describe, expect, it } from "vitest";
import { addDays } from "./dates";
import { derivePeriodsFromLogs, predictNextPeriod } from "./cycle";
import { estimatedCalendarPhase } from "./cyclePhases";

function periodLogs(start, length) {
  return Array.from({ length }, (_, index) => ({
    date: addDays(start, index),
    periodStatus: index === 0 ? "start" : index === length - 1 ? "end" : "continue",
    flow: "light",
  }));
}

describe("estimated calendar phases", () => {
  const regular = derivePeriodsFromLogs(
    [0, 28, 56, 84].flatMap((offset) => periodLogs(addDays("2026-01-01", offset), 4)),
  );
  const prediction = predictNextPeriod(regular);

  it("treats logged bleeding as recorded menstruation, not an ovulation guess", () => {
    const bleed = estimatedCalendarPhase("2026-03-26", { prediction, inPeriod: true });
    expect(bleed).toEqual({ key: "menstrual", kind: "recorded" });
  });

  it("keeps follicular estimates before the ovulation event and luteal after it", () => {
    const ovu = prediction.ovulationWindow;
    expect(ovu).not.toBeNull();
    const before = estimatedCalendarPhase(addDays(ovu.start, -2), { prediction, inPeriod: false });
    const during = estimatedCalendarPhase(ovu.ovulation, { prediction, inPeriod: false });
    const after = estimatedCalendarPhase(addDays(ovu.end, 2), { prediction, inPeriod: false });
    expect(before).toEqual({ key: "follicular", kind: "estimate" });
    expect(during).toEqual({ key: "ovulation", kind: "estimate" });
    expect(after).toEqual({ key: "luteal", kind: "estimate" });
  });

  it("hides personalized ovulation and luteal paint when cycles are irregular", () => {
    const irregular = derivePeriodsFromLogs(
      [
        ["2026-02-08", 5],
        ["2026-03-04", 5],
        ["2026-04-11", 5],
        ["2026-05-02", 4],
        ["2026-06-16", 6],
      ].flatMap(([start, days]) => periodLogs(start, days)),
    );
    const next = predictNextPeriod(irregular);
    expect(next.skipOvulation).toBe(true);
    expect(estimatedCalendarPhase(addDays(next.lastPeriod.startDate, 14), { prediction: next, inPeriod: false })).toEqual({
      key: "unknown",
      kind: "none",
    });
  });
});
