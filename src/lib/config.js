/** Tunable clinical-adjacent thresholds. Not a diagnosis. */
export const CONFIG = {
  minCyclesForPrediction: 3,
  maxCyclesUsed: 6,
  minWindowSpreadDays: 2,
  /** FIGO discusses 7–9 days of cycle-length variation by age. */
  irregularSpreadDays: 7,
  lutealDaysBeforePeriod: 14,
  fertileDaysBeforeOvulation: 5,
  forgottenFactor: 1.8,
  forgottenExtraDays: 16,
  prolongedPeriodDays: 7,
  amenorrheaDays: 90,
  adultShortCycle: 21,
  adultLongCycle: 35,
  under18ShortCycle: 21,
  under18LongCycle: 45,
  consecutiveUnusualCycles: 3,
  pregnancyDays: 280,
  minCyclesForPattern: 3,
};

export const CLINIC_OPTIONS = [
  {
    id: "phc",
    en: "A government health centre / PHC",
    hi: "सरकारी स्वास्थ्य केंद्र / PHC",
    url: "https://nhm.gov.in/",
  },
  {
    id: "esanjeevani",
    en: "eSanjeevani tele-consultation (MoHFW)",
    hi: "ई-संजीवनी टेली-परामर्श (MoHFW)",
    url: "https://esanjeevani.mohfw.gov.in/",
  },
  {
    id: "gynae",
    en: "A gynaecologist",
    hi: "स्त्री रोग विशेषज्ञ",
    url: "https://www.fogsi.org/",
  },
];
