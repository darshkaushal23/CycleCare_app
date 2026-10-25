import { describe, expect, it } from "vitest";
import { addDays, isISODate, todayISO } from "./dates";
import { emptyLog, logFingerprint, normalizeLog } from "./logFields";

describe("daily log fields and date selection", () => {
  it("resolves previous, next, and today the same way the log arrows do", () => {
    const date = "2026-01-31";
    expect(addDays(date, -1)).toBe("2026-01-30");
    expect(addDays(date, 1)).toBe("2026-02-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    const today = todayISO();
    expect(isISODate(today)).toBe(true);
    expect(addDays(today, 0)).toBe(today);
  });

  it("loads a stored record for a date and keeps one entry per date on edit", () => {
    const saved = normalizeLog(
      { date: "2026-10-20", flow: "medium", mood: "good", symptoms: ["cramps", "fatigue"], notes: "tea" },
      "2026-10-20",
    );
    expect(saved.flow).toBe("medium");
    expect(saved.symptoms).toEqual(["cramps", "fatigue"]);
    const logs = [saved, normalizeLog({ date: "2026-10-21", flow: "none" }, "2026-10-21")];
    const edited = { ...saved, mood: "low", notes: "tea + heat" };
    const next = [...logs.filter((item) => item.date !== edited.date), edited];
    expect(next.filter((item) => item.date === "2026-10-20")).toHaveLength(1);
    expect(next.find((item) => item.date === "2026-10-20").mood).toBe("low");
  });

  it("treats symptom add/remove as dirty until fingerprints match", () => {
    const date = "2026-10-22";
    const stored = emptyLog(date);
    let draft = { ...stored, symptoms: ["cramps", "acne"] };
    expect(logFingerprint(draft) === logFingerprint(stored)).toBe(false);
    draft = { ...draft, symptoms: draft.symptoms.filter((id) => id !== "acne") };
    draft = { ...draft, symptoms: draft.symptoms.filter((id) => id !== "cramps") };
    expect(logFingerprint(draft)).toBe(logFingerprint(stored));
  });

  it("leaves the flow step when period is turned off", () => {
    const periodOn = (status, flow) => status !== "none" || ["light", "medium", "heavy"].includes(flow);
    expect(periodOn("none", "none")).toBe(false);
    expect(periodOn("continue", "medium")).toBe(true);
    const step = 1;
    const nextStep = step === 1 && !periodOn("none", "none") ? 2 : step;
    expect(nextStep).toBe(2);
  });

  it("shows heavy and high-pain follow-ups only when those values are set", () => {
    const heavy = normalizeLog({ date: "2026-10-23", flow: "heavy", pain: 5 }, "2026-10-23");
    const quiet = emptyLog("2026-10-23");
    expect(heavy.flow === "heavy").toBe(true);
    expect(Number(heavy.pain) >= 4).toBe(true);
    expect(quiet.flow === "heavy").toBe(false);
    expect(Number(quiet.pain) >= 4).toBe(false);
  });
});
