import { describe, expect, it } from "vitest";
import { cycleSummaryForAssistant } from "./assistantContext";

describe("assistant cycle summary", () => {
  it("stays empty of notes and medicines", () => {
    const text = cycleSummaryForAssistant({
      lang: "en",
      prediction: {
        lastPeriod: { startDate: "2026-03-01", endDate: "2026-03-05" },
        medianLength: 28,
        window: { start: "2026-03-27", end: "2026-04-02" },
        skipOvulation: false,
        ovulationWindow: { ovulation: "2026-03-15" },
        notes: "private note",
        medicines: "ibuprofen",
      },
    });
    expect(text).toContain("2026-03-01");
    expect(text).toContain("about 28 days");
    expect(text).toContain("2026-03-15");
    expect(text.toLowerCase()).not.toContain("ibuprofen");
    expect(text.toLowerCase()).not.toContain("private note");
  });

  it("does not invent a period when none is saved", () => {
    expect(cycleSummaryForAssistant({ lang: "en", prediction: {} })).toBe("No saved period yet.");
  });
});
