import { describe, expect, it } from "vitest";
import { evaluateCare } from "./careEngine";
import { buildConfidence } from "./confidence";
import { analyzeCycles } from "./cycleAnalysis";
import { derivePeriodsFromLogs, predictNextPeriod } from "./cycle";
import { buildDemoLogs } from "./demoData";
import { LESSONS } from "./learnContent";
import { CONFIG } from "./config";
import { SAHELI_FAQS, searchFaqs } from "../content/faq";
import { buildVisitSummary } from "./visitSummary";

describe("innovation journey on demo logs", () => {
  const logs = buildDemoLogs();
  const periods = derivePeriodsFromLogs(logs);
  const prediction = predictNextPeriod(periods, { today: "2026-10-24" });
  const analysis = analyzeCycles(periods, logs, "2026-10-24");
  const guidance = evaluateCare({
    periods,
    logs,
    prediction,
    ageGroup: "under18",
    today: "2026-10-24",
    lang: "en",
  });

  it("shows a ranged estimate with cycle support and no percentage score", () => {
    expect(prediction.canPredict).toBe(true);
    expect(prediction.window.start < prediction.window.end).toBe(true);
    expect(prediction.usedCycleCount).toBeGreaterThanOrEqual(3);
    expect(prediction.irregular).toBe(true);
    const conf = buildConfidence(analysis, { ageGroup: "under18", lang: "en" });
    expect(conf.notAPercentage).toBe(true);
    expect(conf.cyclesSupporting).toBe(prediction.usedCycleCount);
    expect(conf.why.join(" ")).not.toMatch(/%/);
  });

  it("triggers care cards from logs without diagnosing disease", () => {
    const ids = guidance.cards.map((card) => card.id);
    expect(ids).toContain("irregular");
    expect(ids).toContain("heavy");
    expect(ids).toContain("pain");
    expect(ids).toContain("intermenstrual");
    expect(ids).toContain("prolonged");
    expect(guidance.cards.some((card) => card.severity === "urgent")).toBe(true);
    const blob = JSON.stringify(guidance.cards);
    expect(blob).not.toMatch(/you have PCOS/i);
    expect(blob).not.toMatch(/you are pregnant/i);
    expect(blob).not.toMatch(/infertile/i);
  });

  it("builds a visit summary from the same records", () => {
    const summary = buildVisitSummary({ periods, logs, prediction, guidance, lang: "en" });
    expect(summary.periods.length).toBe(periods.length);
    expect(summary.questions.length).toBeGreaterThanOrEqual(4);
    expect(summary.medicines.length).toBeGreaterThan(0);
    expect(summary.cycleLengths.length).toBeGreaterThanOrEqual(3);
  });
});

describe("Saheli and Learn", () => {
  it("has at least 30 bilingual FAQs and a fallback", () => {
    expect(SAHELI_FAQS.length).toBeGreaterThanOrEqual(30);
    expect(searchFaqs("heavy bleeding").matches.length).toBeGreaterThan(0);
    expect(searchFaqs("xyzzy-not-a-question").fallback).toBe(true);
    expect(SAHELI_FAQS.every((faq) => faq.en.q && faq.hi.q && faq.sources.length)).toBe(true);
  });

  it("keeps the irregular spread threshold in config", () => {
    expect(CONFIG.irregularSpreadDays).toBe(7);
    expect(CONFIG.adultLongCycle).toBe(35);
    expect(CONFIG.under18LongCycle).toBe(45);
  });

  it("ships eight sourced lessons", () => {
    expect(LESSONS).toHaveLength(8);
    expect(LESSONS.every((lesson) => lesson.en.title && lesson.hi.title && lesson.sources.length)).toBe(true);
  });
});
