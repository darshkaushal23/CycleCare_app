import { daysBetween } from "./dates";
import { sourceList } from "./sources";

export const PHASE_IDS = ["menstrual", "follicular", "ovulation", "luteal"];

export const PHASE_COLORS = {
  menstrual: "#D987A3",
  follicular: "#A78BCA",
  ovulation: "#563F68",
  luteal: "#C56B8A",
};

export const CYCLE_PHASES = [
  {
    id: "menstrual",
    icon: "drop",
    overlap: true,
    en: {
      title: "Period",
      short: "Bleeding days of the cycle",
      mean: "Also called the menstrual phase — the days you bleed.",
      happens: "The lining of the uterus is shed. This is the period. NHS describes it as monthly bleeding that often lasts a few days.",
      changes: "Flow, cramps, tiredness, or low mood may appear. Some people have little pain. Others need rest.",
      varies: "Bleeding length and heaviness differ widely. Typical textbook ranges are not a rule for every body.",
      uncertainty: "A logged bleed is a record. It does not prove why the lining shed or that hormones are ‘normal’.",
    },
    hi: {
      title: "पीरियड",
      short: "चक्र के रक्तस्राव वाले दिन",
      mean: "इसे मासिक (मेन्स्ट्रुअल) चरण भी कहते हैं — जिन दिनों खून आता है।",
      happens: "गर्भाशय की परत निकलती है — यही पीरियड है। NHS इसे कुछ दिनों का मासिक रक्तस्राव बताता है।",
      changes: "फ्लो, ऐंठन, थकान या कम मूड हो सकते हैं। कुछ लोगों को कम दर्द होता है, कुछ को आराम चाहिए।",
      varies: "रक्तस्राव की लंबाई और भारीपन बहुत अलग होते हैं। किताबी सीमा हर शरीर का नियम नहीं।",
      uncertainty: "लॉग रक्तस्राव एक रिकॉर्ड है। यह कारण या हार्मोन ‘सामान्य’ साबित नहीं करता।",
    },
  },
  {
    id: "follicular",
    icon: "seed",
    overlap: true,
    en: {
      title: "After period starts",
      short: "From period start toward ovulation",
      mean: "Also called the follicular phase — your body gets ready around an egg.",
      happens: "Eggs in the ovary begin to mature. The uterus lining starts to rebuild after shedding.",
      changes: "Energy may rise later in this stretch. That is not true for everyone.",
      varies: "This phase can be short or long. That is a main reason cycle length differs between people and months.",
      uncertainty: "The menstrual phase sits inside the follicular phase: bleeding days are still follicular days. They are not four fully separate, non-overlapping biological boxes.",
    },
    hi: {
      title: "पीरियड शुरू के बाद",
      short: "पीरियड शुरुआत से ओव्यूलेशन की ओर",
      mean: "इसे फॉलिक्युलर चरण भी कहते हैं — शरीर एक अंडे के आसपास तैयारी करता है।",
      happens: "अंडाशय में अंडे पकने लगते हैं। परत गिरने के बाद गर्भाशय की परत फिर बनती है।",
      changes: "बाद में ऊर्जा बढ़ सकती है। यह हर किसी के लिए सच नहीं।",
      varies: "यह चरण छोटा या लंबा हो सकता है। चक्र लंबाई इसी वजह से व्यक्ति और महीने में बदलती है।",
      uncertainty: "मासिक चरण फॉलिक्युलर चरण के अंदर है: रक्तस्राव वाले दिन भी फॉलिक्युलर दिन हैं। ये चार पूरी तरह अलग, बिना ओवरलैप के डिब्बे नहीं हैं।",
    },
  },
  {
    id: "ovulation",
    icon: "spark",
    overlap: false,
    en: {
      title: "Ovulation",
      short: "When an ovary may release an egg",
      mean: "This is when an ovary may release an egg. The day is a guess, not a sure fact.",
      happens: "In many cycles an ovary releases an egg. Textbooks often place this about two weeks before the next period — that is a teaching average, not a personal test.",
      changes: "Some people notice mid-cycle wetter mucus, a twinge, or a slight temperature shift. Many notice nothing.",
      varies: "Irregular cycles, adolescence, illness, and some conditions make the day hard to guess.",
      uncertainty: "CycleCare never treats an ovulation estimate as confirmed, and never as contraception. Calendar maths cannot see an egg.",
    },
    hi: {
      title: "ओव्यूलेशन",
      short: "जब अंडाशय अंडा छोड़ सकता है",
      mean: "इस दिन अंडाशय अंडा छोड़ सकता है। यह अनुमान है, पक्का दिन नहीं।",
      happens: "कई चक्रों में अंडाशय एक अंडा छोड़ता है। किताबें अक्सर अगली पीरियड से लगभग दो सप्ताह पहले बताती हैं — यह शिक्षण औसत है, व्यक्तिगत जाँच नहीं।",
      changes: "कुछ लोगों को बीच चक्र में गीला स्राव, हल्की चुभन या तापमान बदलाव दिखता है। कई को कुछ नहीं दिखता।",
      varies: "अनियमित चक्र, किशोरावस्था, बीमारी अनुमान को कठिन बनाती हैं।",
      uncertainty: "CycleCare ओव्यूलेशन अनुमान को पुष्टि या गर्भनिरोध नहीं मानता। कैलेंडर गणित अंडा नहीं देखता।",
    },
  },
  {
    id: "luteal",
    icon: "moon",
    overlap: false,
    en: {
      title: "Before next period",
      short: "After ovulation, before the next period",
      mean: "Also called the luteal phase — after ovulation, the body prepares for the next period.",
      happens: "If an egg was released, the empty follicle makes hormones that keep the lining in place until a period starts — or a pregnancy continues, which this app cannot detect.",
      changes: "Breast tenderness, bloating, mood change, or acne may appear. PMS is a description of symptoms, not a diagnosis made here.",
      varies: "This stretch is often closer to two weeks than the follicular stretch, but it still varies.",
      uncertainty: "If cycles are irregular, CycleCare will not paint a precise luteal calendar. A late period has more than one possible cause.",
    },
    hi: {
      title: "अगली पीरियड से पहले",
      short: "ओव्यूलेशन के बाद, अगली पीरियड से पहले",
      mean: "इसे ल्यूटियल चरण भी कहते हैं — ओव्यूलेशन के बाद शरीर अगली पीरियड की तैयारी करता है।",
      happens: "यदि अंडा छूटा, तो खाली फॉलिकल हार्मोन बनाता है जो परत को अगली पीरियड तक रखता है — या गर्भ जारी रहे, जिसे यह ऐप नहीं पकड़ता।",
      changes: "स्तन संवेदनशीलता, सूजन, मूड बदलाव या मुंहासे हो सकते हैं। PMS लक्षणों का वर्णन है, यहाँ निदान नहीं।",
      varies: "यह हिस्सा अक्सर फॉलिक्युलर से अधिक दो सप्ताह के करीब होता है, फिर भी बदलता है।",
      uncertainty: "अनियमित चक्र पर CycleCare सटीक ल्यूटियल कैलेंडर नहीं रंगेगा। देरी के कई कारण हो सकते हैं।",
    },
  },
];

export const PHASE_SOURCES = sourceList(["nhsPeriods", "nhsIrregular", "whoMenstrual"]);

export function phaseCopy(id, lang = "en") {
  const phase = CYCLE_PHASES.find((item) => item.id === id);
  if (!phase) return null;
  return lang === "hi" ? phase.hi : phase.en;
}

/** Educational labels only. Logged bleeding always wins over estimates. */
export function estimatedCalendarPhase(date, { prediction, inPeriod } = {}) {
  if (inPeriod) return { key: "menstrual", kind: "recorded" };
  if (!prediction?.canPredict || prediction.irregular || prediction.skipOvulation || !prediction.lastPeriod) {
    return { key: "unknown", kind: "none" };
  }
  const ovu = prediction.ovulationWindow;
  if (ovu && date >= ovu.start && date <= ovu.end) return { key: "ovulation", kind: "estimate" };
  if (ovu && date > ovu.end) {
    if (!prediction.window || date < prediction.window.start) return { key: "luteal", kind: "estimate" };
  }
  const day = daysBetween(prediction.lastPeriod.startDate, date) + 1;
  if (day >= 1 && (!ovu || date < ovu.start)) return { key: "follicular", kind: "estimate" };
  return { key: "unknown", kind: "none" };
}
