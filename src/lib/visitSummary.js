import { isPeriodDay } from "./cycle";
import { todayISO } from "./dates";

export function buildVisitSummary({ periods, logs, prediction, guidance, lang = "en" }) {
  const medicines = [...new Set(logs.map((log) => (log.medicines ?? "").trim()).filter(Boolean))];
  const painDays = logs.filter((log) => Number(log.pain) >= 4);
  const maxPain = logs.reduce((max, log) => Math.max(max, Number(log.pain) || 0), 0);
  const symptomCounts = {};
  logs.forEach((log) => {
    (log.symptoms ?? []).forEach((id) => {
      symptomCounts[id] = (symptomCounts[id] ?? 0) + 1;
    });
  });
  const questions =
    lang === "hi"
      ? [
          "मेरी आयु में कितनी चक्र लंबाई सामान्य मानी जाती है, और मेरे लॉग कब चिंता का विषय हैं?",
          "भारी दिनों / भीगने के बाद क्या एनीमिया की जाँच जरूरी है?",
          "स्कूल रोकने वाले दर्द के लिए कौन सी दर्द-राहत सुरक्षित है?",
          "पीरियड के बीच स्पॉटिंग पर और कौन सी जानकारी चाहिए?",
          "अगली मुलाकात कब तय करें, और किन लक्षणों पर पहले आना चाहिए?",
        ]
      : [
          "For my age, which cycle lengths are typical, and when would my logged pattern need tests?",
          "Given heavy or soaking days, should I be checked for anaemia?",
          "What pain relief is appropriate if pain stops school or sport?",
          "What else should you know about spotting between periods?",
          "When should I return, and which symptoms should bring me in sooner?",
        ];

  return {
    generatedOn: todayISO(),
    periods: [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    cycleLengths: prediction?.allCycleLengths ?? [],
    medianLength: prediction?.medianLength ?? null,
    window: prediction?.window ?? null,
    medicines,
    maxPain,
    painDays: painDays.map((log) => ({ date: log.date, pain: log.pain, note: log.notes })),
    symptoms: Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]),
    bleedingDays: logs.filter(isPeriodDay).map((log) => log.date),
    guidanceIds: (guidance?.cards ?? []).map((card) => card.id),
    questions,
  };
}
