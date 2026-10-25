import { addDays, daysBetween, todayISO } from "./dates";
import { derivePeriodsFromLogs, describeCyclePosition, getCompleteCycles, predictNextPeriod } from "./cycle";

export function getCycleLengths(periods) {
  return getCompleteCycles(periods, { max: 99 }).map((cycle) => ({
    startDate: cycle.startDate,
    nextStart: cycle.nextStart,
    length: cycle.length,
    possibleMissedLog: cycle.possibleMissedLog,
  }));
}

export function analyzeCycles(periods, logs, referenceDate = todayISO(), { pregnancyMode = false } = {}) {
  const derived = logs?.length ? derivePeriodsFromLogs(logs) : periods;
  const source = derived.length ? derived : periods;
  const prediction = predictNextPeriod(source, { today: referenceDate, pregnancyMode });
  const lengths = prediction.cycleLengths;
  const position = describeCyclePosition(source, prediction, { today: referenceDate });

  let confidence = "none";
  if (pregnancyMode) confidence = "pregnancy";
  else if (!prediction.canPredict) {
    if (prediction.completeCycleCount === 0) confidence = "none";
    else if (prediction.completeCycleCount === 1) confidence = "emerging";
    else confidence = "limited";
  } else if (prediction.irregular) confidence = "uncertain";
  else confidence = "moderate";

  const recentLogs = logs.filter((log) => log.date >= addDays(referenceDate, -90));
  const symptomCounts = {};
  recentLogs.forEach((log) => {
    (log.symptoms ?? []).forEach((symptom) => {
      symptomCounts[symptom] = (symptomCounts[symptom] ?? 0) + 1;
    });
  });

  const topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id, count]) => ({ id, count }));

  const lastPeriod = prediction.lastPeriod;

  return {
    cycleCount: prediction.completeCycleCount,
    periodCount: source.length,
    avgLength: prediction.medianLength != null ? Math.round(prediction.medianLength * 10) / 10 : null,
    avgPeriodLength:
      prediction.medianPeriodDuration != null ? Math.round(prediction.medianPeriodDuration * 10) / 10 : null,
    variation: prediction.spread,
    minLength: prediction.minLength,
    maxLength: prediction.maxLength,
    lastPeriod,
    daysSinceLastStart: lastPeriod ? daysBetween(lastPeriod.startDate, referenceDate) : null,
    confidence,
    irregular: prediction.irregular,
    veryShort: lengths.some((length) => length < 21),
    veryLong: lengths.some((length) => length > 38),
    predictedWindow: prediction.window,
    prediction,
    position,
    topSymptoms,
    lengths,
    isEstimate: true,
  };
}

export function confidenceCopy(confidence, lang) {
  const copy = {
    en: {
      none: {
        label: "No estimate yet",
        detail: "Log 3 periods and I'll start estimating.",
      },
      emerging: {
        label: "Emerging pattern",
        detail: "Log 3 periods and I'll start estimating.",
      },
      limited: {
        label: "Not enough cycles yet",
        detail: "Log 3 periods and I'll start estimating.",
      },
      uncertain: {
        label: "Wide estimate — labelled irregular",
        detail: "Recent cycles vary by more than 7 days. The window is widened. This is common in the first years after periods start, and at other times.",
      },
      moderate: {
        label: "Moderate estimate",
        detail: "Recent logs are steadier. The window is still an estimate. It is not contraception.",
      },
      pregnancy: {
        label: "Period estimates paused",
        detail: "Pregnancy mode is on, so period predictions are paused and kept separate.",
      },
    },
    hi: {
      none: {
        label: "अभी कोई अनुमान नहीं",
        detail: "3 पीरियड लॉग करें, फिर मैं अनुमान लगाना शुरू करूँगी।",
      },
      emerging: {
        label: "पैटर्न बन रहा है",
        detail: "3 पीरियड लॉग करें, फिर मैं अनुमान लगाना शुरू करूँगी।",
      },
      limited: {
        label: "अभी चक्र कम हैं",
        detail: "3 पीरियड लॉग करें, फिर मैं अनुमान लगाना शुरू करूँगी।",
      },
      uncertain: {
        label: "चौड़ा अनुमान — अनियमित",
        detail: "हाल के चक्र 7 दिन से अधिक बदलते हैं। विंडो चौड़ी है। पीरियड शुरू होने के पहले वर्षों में, और अन्य समय पर, यह आम हो सकता है।",
      },
      moderate: {
        label: "मध्यम अनुमान",
        detail: "हाल के लॉग ज़्यादा स्थिर हैं। विंडो फिर भी एक अनुमान है। यह गर्भनिरोध नहीं है।",
      },
      pregnancy: {
        label: "पीरियड अनुमान रुके हैं",
        detail: "गर्भावस्था मोड चालू है, इसलिए पीरियड अनुमान रुके हैं और अलग रखे गए हैं।",
      },
    },
  };

  return copy[lang]?.[confidence] ?? copy.en[confidence];
}
