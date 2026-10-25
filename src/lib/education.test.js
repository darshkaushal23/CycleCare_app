import { describe, expect, it } from "vitest";
import { estimatedCalendarPhase } from "./cyclePhases";
import { FAQ_CATEGORIES, SAHELI_FAQS, faqsByCategory, searchFaqs } from "./saheliFaqs";
import { pickVoice, voicesForLang } from "./speech";

describe("FAQ categories", () => {
  it("keeps every FAQ in a known category", () => {
    expect(SAHELI_FAQS.every((faq) => FAQ_CATEGORIES.includes(faq.category))).toBe(true);
  });

  it("filters by category and searches within it", () => {
    const cycle = faqsByCategory("cycle");
    expect(cycle.length).toBeGreaterThan(0);
    expect(cycle.every((faq) => faq.category === "cycle")).toBe(true);
    const hit = searchFaqs("cycle phases", "en", "cycle");
    expect(hit.fallback).toBe(false);
    expect(hit.matches.some((faq) => faq.id === "cycle-phases")).toBe(true);
  });

  it("returns the category pool when the query is empty", () => {
    const all = searchFaqs("", "en", "pcos");
    expect(all.matches.length).toBe(faqsByCategory("pcos").length);
    expect(all.fallback).toBe(false);
  });

  it("places the day-14 FAQ in ovulation/fertility", () => {
    expect(SAHELI_FAQS.find((faq) => faq.id === "day-14").category).toBe("fertility");
  });

  it("does not treat helper words as FAQ hits", () => {
    const hit = searchFaqs("do I have PCOS?", "en");
    expect(hit.fallback).toBe(false);
    expect(hit.matches[0].id).toBe("pcos");
  });

  it("preserves Hindi answers for core questions", () => {
    const late = SAHELI_FAQS.find((faq) => faq.id === "late");
    expect(late.hi.q).toMatch(/पीरियड/);
    expect(late.en.a).toMatch(/cannot confirm or exclude pregnancy/i);
  });
});

describe("calendar phase estimates", () => {
  const lastPeriod = { startDate: "2026-09-01", endDate: "2026-09-05" };
  const regular = {
    canPredict: true,
    irregular: false,
    skipOvulation: false,
    lastPeriod,
    ovulationWindow: { start: "2026-09-14", end: "2026-09-16" },
    window: { start: "2026-09-28", end: "2026-10-01" },
  };

  it("treats logged bleeding as a record, not an estimate", () => {
    expect(estimatedCalendarPhase("2026-09-02", { prediction: regular, inPeriod: true })).toEqual({
      key: "menstrual",
      kind: "recorded",
    });
  });

  it("labels follicular, ovulation, and luteal only as estimates", () => {
    expect(estimatedCalendarPhase("2026-09-08", { prediction: regular, inPeriod: false }).key).toBe("follicular");
    expect(estimatedCalendarPhase("2026-09-15", { prediction: regular, inPeriod: false })).toEqual({
      key: "ovulation",
      kind: "estimate",
    });
    expect(estimatedCalendarPhase("2026-09-20", { prediction: regular, inPeriod: false }).key).toBe("luteal");
  });

  it("does not paint precise phases when cycles are irregular", () => {
    const irregular = { ...regular, irregular: true, skipOvulation: true, ovulationWindow: null };
    expect(estimatedCalendarPhase("2026-09-15", { prediction: irregular, inPeriod: false }).kind).toBe("none");
  });
});

describe("speech voice matching", () => {
  const voices = [
    { lang: "en-IN", voiceURI: "en-a", name: "English A", localService: true },
    { lang: "en-GB", voiceURI: "en-b", name: "English B", localService: false },
  ];

  it("never returns an English voice for Hindi", () => {
    expect(voicesForLang("hi", voices)).toEqual([]);
    expect(pickVoice("hi", voices).status).toBe("no-hindi");
    expect(pickVoice("hi", voices).voice).toBeNull();
  });

  it("picks a language-matched English voice", () => {
    const picked = pickVoice("en", voices);
    expect(picked.status).toBe("ok");
    expect(picked.voice.lang.startsWith("en")).toBe(true);
  });

  it("prefers a name-hinted female English voice when several exist", () => {
    const mixed = [
      { lang: "en-US", voiceURI: "d", name: "Microsoft David", localService: true },
      { lang: "en-US", voiceURI: "z", name: "Microsoft Zira", localService: true },
    ];
    expect(pickVoice("en", mixed).voice.voiceURI).toBe("z");
  });
});

describe("FAQ search honesty", () => {
  it("matches Hindi suggested wording to the late-period FAQ", () => {
    const hit = searchFaqs("लेट पीरियड", "hi");
    expect(hit.fallback).toBe(false);
    expect(hit.matches[0].id).toBe("late");
  });

  it("returns a fallback for questions it cannot answer", () => {
    const hit = searchFaqs("what vitamin brand should I buy tonight", "en");
    expect(hit.fallback).toBe(true);
    expect(hit.matches).toEqual([]);
  });
});
