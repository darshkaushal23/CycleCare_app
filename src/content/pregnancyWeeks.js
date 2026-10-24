import { addDays, daysBetween } from "../lib/dates";
import { sourceList } from "../lib/sources";
import { CONFIG } from "../lib/config";

export const PREGNANCY_DANGER_SIGNS = [
  {
    id: "bleeding",
    en: "Bleeding",
    hi: "रक्तस्राव",
  },
  {
    id: "pain",
    en: "Severe belly pain",
    hi: "तेज़ पेट दर्द",
  },
  {
    id: "headache",
    en: "Severe headache or blurred vision",
    hi: "तेज़ सिर दर्द या धुंधली दृष्टि",
  },
  {
    id: "swelling",
    en: "Swelling of the face or hands",
    hi: "चेहरे या हाथों की सूजन",
  },
  {
    id: "fever",
    en: "Fever",
    hi: "बुखार",
  },
  {
    id: "fluid",
    en: "Fluid leaking",
    hi: "तरल रिसना",
  },
  {
    id: "movement",
    en: "The baby moving less after 28 weeks",
    hi: "28 सप्ताह के बाद बच्चे की हलचल कम होना",
  },
];

export const PREGNANCY_WEEKS = [
  {
    from: 1,
    to: 4,
    en: {
      title: "Weeks 1–4",
      body: "Pregnancy weeks are counted from the first day of the last period. Early signs vary. This is not a test result.",
    },
    hi: {
      title: "सप्ताह 1–4",
      body: "गर्भावस्था के सप्ताह आखिरी पीरियड के पहले दिन से गिने जाते हैं। शुरुआती संकेत अलग होते हैं। यह जाँच परिणाम नहीं है।",
    },
  },
  {
    from: 5,
    to: 12,
    en: {
      title: "Weeks 5–12",
      body: "NHS antenatal pages describe booking a midwife or clinic visit in the first weeks. Take any bleeding or severe pain seriously.",
    },
    hi: {
      title: "सप्ताह 5–12",
      body: "NHS प्रारंभिक सप्ताह में क्लिनिक/मिडवाइफ बुक करने की बात करता है। रक्तस्राव या तेज़ दर्द को गंभीर मानें।",
    },
  },
  {
    from: 13,
    to: 27,
    en: {
      title: "Weeks 13–27",
      body: "Check-up timing is set by a clinician. CycleCare only reminds you that visits exist — it does not replace them.",
    },
    hi: {
      title: "सप्ताह 13–27",
      body: "जाँच का समय चिकित्सक तय करते हैं। CycleCare केवल याद दिलाता है — उनकी जगह नहीं लेता।",
    },
  },
  {
    from: 28,
    to: 40,
    en: {
      title: "Weeks 28–40",
      body: "After 28 weeks, reduced baby movement is listed by NHS as a reason to contact maternity services the same day. An app cannot count kicks for you.",
    },
    hi: {
      title: "सप्ताह 28–40",
      body: "28 सप्ताह बाद हलचल कम होना NHS के अनुसार उसी दिन प्रसूति सेवा से संपर्क का कारण है। ऐप किक नहीं गिनता।",
    },
  },
  {
    from: 41,
    to: 45,
    en: {
      title: "After the estimated due date",
      body: "A due date is an estimate (about 280 days after the last period start). Only a clinician can advise next steps if pregnancy continues past that estimate.",
    },
    hi: {
      title: "अनुमानित जन्म तिथि के बाद",
      body: "जन्म तिथि एक अनुमान है (आखिरी पीरियड शुरुआत के लगभग 280 दिन बाद)। केवल चिकित्सक अगले कदम बता सकते हैं।",
    },
  },
];

export const PREGNANCY_SOURCES = sourceList(["nhsPeriods", "nhsMissed", "fogsi"]);

export function weekFromLmp(lmp, today) {
  if (!lmp || !today) return null;
  const days = daysBetween(lmp, today);
  if (days < 0) return 1;
  return Math.floor(days / 7) + 1;
}

export function dueDateFromLmp(lmp) {
  if (!lmp) return null;
  return addDays(lmp, CONFIG.pregnancyDays);
}

export function weekCopy(week, lang = "en") {
  const block = PREGNANCY_WEEKS.find((item) => week >= item.from && week <= item.to) ?? PREGNANCY_WEEKS[0];
  return lang === "hi" ? block.hi : block.en;
}
