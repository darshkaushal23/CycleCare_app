import { CONFIG } from "./config";
import { confidenceCopy } from "./cycleAnalysis";

export function buildConfidence(analysis, { ageGroup, lang = "en" } = {}) {
  const prediction = analysis.prediction ?? {};
  const copy = confidenceCopy(analysis.confidence, lang);
  const lengths = prediction.cycleLengths ?? analysis.lengths ?? [];
  const range = prediction.minLength != null ? prediction.maxLength - prediction.minLength : null;
  const adolescent = ageGroup === "under18";

  const why = [];
  if (prediction.reason === "pregnancy") {
    why.push(
      lang === "hi"
        ? "गर्भावस्था मोड में पीरियड अनुमान नहीं चलाए जाते।"
        : "Period predictions stay paused while pregnancy mode is on.",
    );
  } else if (!prediction.canPredict) {
    why.push(
      lang === "hi"
        ? "3 पीरियड लॉग करें, फिर मैं अनुमान लगाना शुरू करूँगी।"
        : "Log 3 periods and I'll start estimating.",
    );
  } else {
    if (range != null && range > CONFIG.irregularSpreadDays) {
      why.push(
        lang === "hi"
          ? `हाल के चक्र ${prediction.minLength} से ${prediction.maxLength} दिन तक फैले हैं (${range} दिन का अंतर)। चक्र को अनियमित कहा गया है और सीमा चौड़ी है।`
          : `Recent cycles span ${prediction.minLength} to ${prediction.maxLength} days (${range}-day spread). The cycle is labelled irregular and the range is widened.`,
      );
      why.push(
        lang === "hi"
          ? "यह पीरियड शुरू होने के पहले वर्षों में, और अन्य समय पर, आम हो सकता है।"
          : "This is common in the first years after periods start, and at other times.",
      );
    }
    if (prediction.spread != null) {
      why.push(
        lang === "hi"
          ? `अनुमान ±${prediction.spread} दिनों की विंडो के रूप में दिखाया गया है (कम से कम 2 दिन हर ओर)।`
          : `The estimate is a ±${prediction.spread}-day window (at least 2 days either side).`,
      );
    }
  }
  if ((prediction.possibleMissed ?? []).length) {
    why.push(
      lang === "hi"
        ? "एक अंतराल सामान्य से काफी लंबा है। क्या आपने कोई पीरियड लॉग करना भूल गईं? उस अंतराल को अनुमान में गिनने से पहले पूछा गया है।"
        : "One gap is far longer than usual. Did you forget to log a period? That gap is not counted in the estimate until you add the missing days.",
    );
  }
  if (adolescent) {
    why.push(
      lang === "hi"
        ? "पहली पीरियड के बाद के वर्षों में चक्र का बदलना आम हो सकता है। यह आश्वासन नहीं है कि सब ठीक है — केवल संदर्भ है।"
        : "Cycles often vary for some years after the first period. That is context, not reassurance that everything is fine.",
    );
  }
  why.push(
    lang === "hi"
      ? "Cycle Confidence कोई चिकित्सकीय स्कोर या प्रमाणित प्रतिशत नहीं है। यह आपके सहेजे लॉग का सादा सार है।"
      : "Cycle Confidence is not a clinical score or a validated percentage. It is a plain-language summary of your saved logs.",
  );

  return {
    band: analysis.confidence,
    label: copy.label,
    detail: copy.detail,
    window: prediction.window ?? analysis.predictedWindow,
    cyclesSupporting: prediction.usedCycleCount ?? 0,
    completeCycleCount: prediction.completeCycleCount ?? 0,
    lengths,
    minLength: prediction.minLength ?? analysis.minLength,
    maxLength: prediction.maxLength ?? analysis.maxLength,
    medianLength: prediction.medianLength ?? analysis.avgLength,
    spread: prediction.spread,
    range,
    irregular: Boolean(prediction.irregular),
    skipOvulation: prediction.skipOvulation !== false,
    ovulationWindow: prediction.ovulationWindow,
    isEstimate: true,
    notAPercentage: true,
    why,
  };
}
