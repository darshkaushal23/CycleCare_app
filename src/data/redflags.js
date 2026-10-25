import { CLINIC_OPTIONS, CONFIG } from "../lib/config";
import { isBleedingLog, isPeriodDay } from "../lib/cycle";
import { sourceList } from "../lib/sources";
import { todayISO } from "../lib/dates";

function text(lang, en, hi) {
  return lang === "hi" ? hi : en;
}

function logDetail(log, lang) {
  const bits = [log.date];
  if (log.flow && log.flow !== "none") bits.push(`${text(lang, "flow", "फ्लो")}: ${log.flow}`);
  if (log.pain) bits.push(`${text(lang, "pain", "दर्द")} ${log.pain}/10`);
  if (log.followUp?.heavy?.soaking) bits.push(text(lang, "pad every 1–2 hours", "हर 1–2 घंटे में पैड"));
  if (log.followUp?.heavy?.clots) bits.push(text(lang, "clots > ₹10 coin", "₹10 सिक्के से बड़े थक्के"));
  if (log.followUp?.heavy?.dizziness) bits.push(text(lang, "dizziness", "चक्कर"));
  if (log.followUp?.heavy?.breathlessness) bits.push(text(lang, "breathlessness", "सांस फूलना"));
  if (log.followUp?.pain?.missedActivity) bits.push(text(lang, "stopped daily life", "रोज़मर्रा रुकी"));
  if (log.followUp?.pain?.noRelief) bits.push(text(lang, "painkillers did not help", "दर्द की दवा से राहत नहीं"));
  if (log.followUp?.afterSex) bits.push(text(lang, "bleeding after sex", "संबंध के बाद रक्तस्राव"));
  return bits.join(" · ");
}

function clinicOptions(lang) {
  return CLINIC_OPTIONS.map((option) => ({
    id: option.id,
    label: lang === "hi" ? option.hi : option.en,
    url: option.url,
  }));
}

function card(partial, lang) {
  return {
    sources: sourceList(partial.sourceIds ?? []),
    options: clinicOptions(lang),
    evidence: partial.evidence ?? [],
    ...partial,
  };
}

export const LOGS_CANNOT_SHOW = [
  {
    id: "no-period-15",
    en: "No period by about age 15, or by three years after breast development.",
    hi: "लगभग 15 वर्ष तक, या स्तन विकास के तीन वर्ष बाद भी पीरियड न आना।",
  },
  {
    id: "sudden-change",
    en: "Periods that suddenly change after years of being regular.",
    hi: "वर्षों तक नियमित रहने के बाद पीरियड का अचानक बदल जाना।",
  },
  {
    id: "postmenopause",
    en: "Any bleeding after menopause.",
    hi: "रजोनिवृत्ति के बाद कोई भी रक्तस्राव।",
  },
];

export function evaluateRedFlags({
  periods,
  logs,
  prediction,
  ageGroup,
  today = todayISO(),
  lang = "en",
}) {
  const adolescent = ageGroup === "under18";
  const cards = [];
  const sortedPeriods = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const periodDates = new Set(sortedPeriods.flatMap((period) => period.days ?? []));
  const shortLimit = adolescent ? CONFIG.under18ShortCycle : CONFIG.adultShortCycle;
  const longLimit = adolescent ? CONFIG.under18LongCycle : CONFIG.adultLongCycle;
  const optionsNote = text(
    lang,
    "You can take these dates to a government health centre, use eSanjeevani tele-consultation, or see a gynaecologist. CycleCare does not book visits.",
    "ये तारीखें सरकारी स्वास्थ्य केंद्र, ई-संजीवनी टेली-परामर्श, या स्त्री रोग विशेषज्ञ के पास ले जा सकती हैं। CycleCare अपॉइंटमेंट नहीं करता।",
  );

  const prolonged = sortedPeriods.filter((period) => period.duration > CONFIG.prolongedPeriodDays);
  if (prolonged.length) {
    cards.push(
      card(
        {
          id: "prolonged",
          severity: "informational",
          sourceIds: ["nhsPeriods", "acogBleeding"],
          noticed: text(
            lang,
            `Period length of ${Math.max(...prolonged.map((p) => p.duration))} days in your logs (more than ${CONFIG.prolongedPeriodDays} days).`,
            `आपके लॉग में पीरियड ${Math.max(...prolonged.map((p) => p.duration))} दिनों तक रही (${CONFIG.prolongedPeriodDays} दिन से अधिक)।`,
          ),
          evidence: prolonged.map((period) => ({
            date: period.startDate,
            detail: `${period.startDate} – ${period.endDate} (${period.duration} ${text(lang, "days", "दिन")})`,
          })),
          why: text(
            lang,
            "NHS suggests speaking with a GP if periods last longer than 7 days. This is not a diagnosis.",
            "NHS: 7 दिन से अधिक हो तो GP से बात करें। यह निदान नहीं है।",
          ),
          nextSteps: optionsNote,
        },
        lang,
      ),
    );
  }

  const heavyLogs = logs.filter(
    (log) =>
      log.followUp?.heavy?.soaking ||
      log.followUp?.heavy?.clots ||
      log.followUp?.heavy?.dizziness ||
      log.followUp?.heavy?.breathlessness,
  );
  const anaemiaCluster = logs.filter(
    (log) =>
      (log.flow === "heavy" || log.followUp?.heavy?.soaking || log.followUp?.heavy?.clots) &&
      (log.followUp?.heavy?.dizziness ||
        log.followUp?.heavy?.breathlessness ||
        (log.symptoms ?? []).includes("fatigue") ||
        (log.symptoms ?? []).includes("tiredness")),
  );
  if (heavyLogs.length) {
    const urgent = heavyLogs.some(
      (log) => log.followUp?.heavy?.dizziness || log.followUp?.heavy?.soaking || log.followUp?.heavy?.breathlessness,
    );
    cards.push(
      card(
        {
          id: "heavy",
          severity: urgent ? "urgent" : "urgent",
          sourceIds: ["nhsHeavy", "cdcHeavy", "acogBleeding"],
          noticed: text(
            lang,
            "Logged soaking a pad every 1–2 hours, clots bigger than a ₹10 coin, dizziness, or breathlessness with heavy flow.",
            "हर 1–2 घंटे में पैड भीगना, ₹10 सिक्के से बड़े थक्के, चक्कर, या भारी फ्लो के साथ सांस फूलना लॉग हुआ है।",
          ),
          evidence: heavyLogs.slice(0, 8).map((log) => ({ date: log.date, detail: logDetail(log, lang) })),
          why: text(
            lang,
            "NHS and CDC describe soaking protection every 1–2 hours, large clots, or dizziness as reasons to seek care. CycleCare cannot measure blood loss.",
            "NHS और CDC हर 1–2 घंटे में भीगना, बड़े थक्के या चक्कर को देखभाल का कारण बताते हैं। CycleCare रक्त हानि नहीं मापता।",
          ),
          nextSteps: text(
            lang,
            `If you feel faint or are soaking through very quickly, seek same-day care. ${optionsNote}`,
            `चक्कर या बहुत तेज़ भीगना हो तो उसी दिन मदद लें। ${optionsNote}`,
          ),
        },
        lang,
      ),
    );
  } else if (logs.some((log) => log.flow === "heavy")) {
    const days = logs.filter((log) => log.flow === "heavy");
    cards.push(
      card(
        {
          id: "heavy-logged",
          severity: "informational",
          sourceIds: ["nhsHeavy"],
          noticed: text(lang, "Heavy flow days were logged.", "भारी फ्लो वाले दिन लॉग हुए हैं।"),
          evidence: days.slice(0, 8).map((log) => ({ date: log.date, detail: logDetail(log, lang) })),
          why: text(
            lang,
            "Heavy days alone are not a diagnosis. If they stop school or soak protection quickly, a clinician should hear that.",
            "केवल भारी दिन निदान नहीं हैं। यदि स्कूल छूटे या सुरक्षा जल्दी भीगे, चिकित्सक को बताएँ।",
          ),
          nextSteps: optionsNote,
        },
        lang,
      ),
    );
  }

  if (anaemiaCluster.length) {
    cards.push(
      card(
        {
          id: "anaemia-cluster",
          severity: "urgent",
          sourceIds: ["nhsHeavy", "cdcHeavy"],
          noticed: text(
            lang,
            "Heavy bleeding logged together with tiredness, breathlessness, or dizziness — a pattern clinicians may check for anaemia.",
            "भारी रक्तस्राव के साथ थकान, सांस फूलना या चक्कर लॉग हुए — चिकित्सक एनीमिया की जाँच कर सकते हैं।",
          ),
          evidence: anaemiaCluster.slice(0, 8).map((log) => ({ date: log.date, detail: logDetail(log, lang) })),
          why: text(
            lang,
            "Only a blood test can check for anaemia. This app cannot confirm or exclude it.",
            "एनीमिया केवल रक्त जाँच से पता चलता है। ऐप पुष्टि या इंकार नहीं कर सकता।",
          ),
          nextSteps: optionsNote,
        },
        lang,
      ),
    );
  }

  const painLogs = logs.filter(
    (log) =>
      Number(log.pain) >= 7 ||
      log.followUp?.pain?.missedActivity ||
      log.followUp?.pain?.neededRest ||
      log.followUp?.pain?.noRelief,
  );
  if (painLogs.length) {
    cards.push(
      card(
        {
          id: "pain",
          severity: "informational",
          sourceIds: ["nhsPain", "acogPain"],
          noticed: text(
            lang,
            "Pain that stopped daily life, scored highly, or was not helped by painkillers.",
            "दर्द ने रोज़मर्रा रोकी, अंक ऊँचा रहा, या दर्द की दवा से राहत नहीं मिली।",
          ),
          evidence: painLogs.slice(0, 8).map((log) => ({ date: log.date, detail: logDetail(log, lang) })),
          why: text(
            lang,
            "NHS advises seeing a GP if period pain stops you doing normal activities. This app does not identify the cause.",
            "NHS: सामान्य काम रोकने वाले पीरियड दर्द पर GP से मिलें। ऐप कारण नहीं बताता।",
          ),
          nextSteps: optionsNote,
        },
        lang,
      ),
    );
  }

  const daysSince = prediction?.daysSinceLastStart;
  if (daysSince != null && daysSince >= CONFIG.amenorrheaDays) {
    cards.push(
      card(
        {
          id: "amenorrhea",
          severity: "informational",
          sourceIds: ["nhsMissed", "nhsIrregular"],
          noticed: text(
            lang,
            `${daysSince} days since the last logged period start (90 days or more), when pregnancy is not assumed by this app.`,
            `आखिरी लॉग पीरियड शुरुआत के ${daysSince} दिन बाद (90 दिन या अधिक)। यह ऐप गर्भ नहीं मानता।`,
          ),
          evidence: prediction.lastPeriod
            ? [{ date: prediction.lastPeriod.startDate, detail: `${prediction.lastPeriod.startDate} – ${prediction.lastPeriod.endDate}` }]
            : [],
          why: text(
            lang,
            "A long gap has many possible explanations. CycleCare cannot say whether this is pregnancy, PCOS, stress, thyroid change, or something else.",
            "लंबे अंतराल के कई कारण हो सकते हैं। CycleCare गर्भ, PCOS या और कुछ नहीं बता सकता।",
          ),
          nextSteps: optionsNote,
        },
        lang,
      ),
    );
  }

  const lengths = prediction?.cycleLengths ?? [];
  const unusualRun = consecutiveUnusual(lengths, shortLimit, longLimit);
  if (unusualRun >= CONFIG.consecutiveUnusualCycles) {
    cards.push(
      card(
        {
          id: "cycle-length-run",
          severity: "informational",
          sourceIds: ["nhsIrregular", "acogAdolescents"],
          noticed: text(
            lang,
            `${unusualRun} cycles in a row shorter than ${shortLimit} or longer than ${longLimit} days (${adolescent ? "under 18" : "18+"} ranges).`,
            `लगातार ${unusualRun} चक्र ${shortLimit} दिन से छोटे या ${longLimit} दिन से लंबे (${adolescent ? "18 से कम" : "18+"} सीमा)।`,
          ),
          evidence: (prediction.recentCycles ?? prediction.cycles ?? []).map((cycle) => ({
            date: cycle.startDate,
            detail: `${cycle.length} ${text(lang, "days", "दिन")} (${cycle.startDate} → ${cycle.nextStart})`,
          })),
          why: text(
            lang,
            "Repeated short or long cycles are a pattern to review with a clinician. This does not diagnose a condition.",
            "बार-बार छोटे या लंबे चक्र चिकित्सक से समीक्षा का पैटर्न हैं। यह निदान नहीं है।",
          ),
          nextSteps: optionsNote,
        },
        lang,
      ),
    );
  }

  const spread = prediction?.minLength != null ? prediction.maxLength - prediction.minLength : 0;
  if ((prediction?.usedCycleCount ?? 0) >= 3 && spread > CONFIG.irregularSpreadDays) {
    cards.push(
      card(
        {
          id: "irregular",
          severity: "informational",
          sourceIds: ["nhsIrregular", "acogAdolescents", "fogsi"],
          noticed: text(
            lang,
            `Recent counted cycle lengths: ${(prediction.cycleLengths ?? []).join(" · ")} days. Variation is more than ${CONFIG.irregularSpreadDays} days.`,
            `गिने गए चक्र: ${(prediction.cycleLengths ?? []).join(" · ")} दिन। अंतर ${CONFIG.irregularSpreadDays} दिन से अधिक है।`,
          ),
          evidence: (prediction.cycles ?? []).map((cycle) => ({
            date: cycle.startDate,
            detail: `${cycle.length} ${text(lang, "days", "दिन")} (${cycle.startDate} → ${cycle.nextStart})`,
          })),
          why: text(
            lang,
            adolescent
              ? "This is common in the first years after periods start, and at other times. Common is not the same as 'no need to check'."
              : "Variable cycle length is a pattern to review, not a diagnosis of PCOS, thyroid disease, or anything else.",
            adolescent
              ? "पीरियड शुरू होने के पहले वर्षों में, और अन्य समय पर, यह आम हो सकता है। 'आम' का अर्थ 'जाँच की जरूरत नहीं' नहीं है।"
              : "बदलती चक्र लंबाई समीक्षा का पैटर्न है, PCOS या और किसी रोग का निदान नहीं।",
          ),
          nextSteps: optionsNote,
        },
        lang,
      ),
    );
  }

  const intermenstrual = logs.filter(
    (log) =>
      log.followUp?.afterSex ||
      (log.flow === "spotting" && !isPeriodDay(log)) ||
      (isBleedingLog(log) && !isPeriodDay(log) && !periodDates.has(log.date)),
  );
  if (intermenstrual.length) {
    cards.push(
      card(
        {
          id: "intermenstrual",
          severity: "informational",
          sourceIds: ["nhsIrregular", "acogBleeding"],
          noticed: text(
            lang,
            "Bleeding between periods or bleeding after sex was logged.",
            "पीरियड के बीच रक्तस्राव या संबंध के बाद रक्तस्राव लॉग हुआ है।",
          ),
          evidence: intermenstrual.map((log) => ({ date: log.date, detail: logDetail(log, lang) })),
          why: text(
            lang,
            "NHS lists bleeding between periods as a reason to see a GP. The app will not call it harmless.",
            "NHS पीरियड के बीच रक्तस्राव को GP से मिलने का कारण बताता है। ऐप इसे हानिरहित नहीं कहेगा।",
          ),
          nextSteps: optionsNote,
        },
        lang,
      ),
    );
  }

  cards.sort((a, b) => (a.severity === "urgent" && b.severity !== "urgent" ? -1 : 1));

  return {
    cards,
    adolescent,
    today,
    logsCannotShow: LOGS_CANNOT_SHOW,
    options: clinicOptions(lang),
    disclaimer: text(
      lang,
      "Educational pattern-matching only. Not a diagnosis, triage service, or emergency line. For urgent bleeding or fainting, use local emergency care.",
      "केवल शैक्षिक पैटर्न मिलान। निदान, ट्राएज या आपातकालीन सेवा नहीं। तेज़ रक्तस्राव या बेहोशी पर स्थानीय आपातकालीन देखभाल लें।",
    ),
  };
}

function consecutiveUnusual(lengths, shortLimit, longLimit) {
  let run = 0;
  let best = 0;
  lengths.forEach((length) => {
    if (length < shortLimit || length > longLimit) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  });
  return best;
}
