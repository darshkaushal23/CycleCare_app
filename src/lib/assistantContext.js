export function cycleSummaryForAssistant({ prediction, lang = "en" } = {}) {
  const last = prediction?.lastPeriod;
  const hi = lang === "hi";
  if (!last?.startDate) {
    return hi ? "अभी कोई सहेजी पीरियड नहीं है।" : "No saved period yet.";
  }
  const lines = [
    hi
      ? `आखिरी सहेजी पीरियड ${last.startDate} से ${last.endDate || last.startDate} तक।`
      : `Last saved period: ${last.startDate} to ${last.endDate || last.startDate}.`,
  ];
  if (prediction.medianLength != null) {
    const days = Math.round(prediction.medianLength);
    lines.push(hi ? `सहेजे चक्रों की सामान्य लंबाई लगभग ${days} दिन।` : `Typical saved cycle length is about ${days} days.`);
  }
  if (prediction.window?.start && prediction.window?.end) {
    lines.push(
      hi
        ? `अगली पीरियड का अनुमान ${prediction.window.start} से ${prediction.window.end}। यह पक्की तारीख नहीं है।`
        : `Next period estimate: ${prediction.window.start} to ${prediction.window.end}. This is not a confirmed date.`,
    );
  }
  if (!prediction.skipOvulation && prediction.ovulationWindow?.ovulation) {
    lines.push(
      hi
        ? `संभव ओव्यूलेशन ${prediction.ovulationWindow.ovulation} के आसपास। इन तारीखों से गर्भ नहीं रोका जा सकता।`
        : `Possible ovulation around ${prediction.ovulationWindow.ovulation}. These dates cannot be used to prevent pregnancy.`,
    );
  }
  return lines.join(" ");
}
