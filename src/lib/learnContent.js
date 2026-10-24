import { sourceList } from "./sources";

function lesson(id, icon, en, hi, sourceIds) {
  return { id, icon, sources: sourceList(sourceIds), en, hi };
}

export const LESSONS = [
  lesson(
    "basics",
    "cycle",
    {
      title: "Menstrual cycle basics",
      summary: "Bleeding is one part of a cycle that starts on the first day of a period.",
      body: [
        "A menstrual cycle is counted from the first day of one period to the first day of the next. Bleeding often lasts about 2–7 days, but that is a typical range, not a rule for every body.",
        "NHS describes periods as the monthly shedding of the uterus lining. Cycle length can differ from person to person and from month to month.",
        "CycleCare never uses a calendar guess in place of your logs. If your days differ from a textbook 28-day cycle, that alone is not a diagnosis.",
      ],
    },
    {
      title: "मासिक चक्र की मूल बातें",
      summary: "रक्तस्राव चक्र का एक भाग है, जिसकी गिनती पीरियड के पहले दिन से होती है।",
      body: [
        "चक्र एक पीरियड के पहले दिन से अगले के पहले दिन तक गिना जाता है। रक्तस्राव अक्सर लगभग 2–7 दिन रहता है — यह आम सीमा है, हर शरीर का नियम नहीं।",
        "NHS पीरियड को गर्भाशय की परत का स्राव बताता है। लंबाई व्यक्ति और महीने के अनुसार बदल सकती है।",
        "CycleCare आपके लॉग की जगह कैलेंडर अनुमान नहीं लगाता। 28 दिन से अलग होना स्वयं निदान नहीं है।",
      ],
    },
    ["nhsPeriods", "whoMenstrual"],
  ),
  lesson(
    "irregular",
    "wave",
    {
      title: "Irregular periods",
      summary: "Changing cycle length is common in some life stages and still worth naming honestly.",
      body: [
        "NHS suggests speaking with a GP if cycles are shorter than 21 days, if you bleed between periods, or if the pattern changes in a way that worries you.",
        "After the first period, ACOG notes that cycles may be irregular for a number of years. 'Common in adolescence' does not mean 'no need to check'.",
        "This lesson will not tell you that irregular cycles are PCOS, thyroid disease, stress, or 'nothing'. Those conclusions need a clinician and often tests.",
      ],
    },
    {
      title: "अनियमित पीरियड",
      summary: "बदलती चक्र लंबाई कुछ अवस्थाओं में आम है, फिर भी ईमानदारी से नाम देना चाहिए।",
      body: [
        "NHS: 21 दिन से छोटे चक्र, पीरियड के बीच रक्तस्राव, या चिंता बढ़ाने वाला बदलाव हो तो GP से बात करें।",
        "ACOG: पहली पीरियड के बाद कुछ वर्षों तक चक्र अनियमित हो सकते हैं। 'आम' का अर्थ 'जाँच नहीं' नहीं है।",
        "यह पाठ अनियमित चक्र को PCOS, थायरॉइड या 'कुछ नहीं' नहीं कहेगा। निष्कर्ष चिकित्सक और अक्सर जाँच से होते हैं।",
      ],
    },
    ["nhsIrregular", "acogAdolescents"],
  ),
  lesson(
    "pcos",
    "info",
    {
      title: "PCOS / PCOD — what it is, and what apps must not do",
      summary: "In India, PCOD and PCOS are often used for the same condition. A tracker cannot diagnose it.",
      body: [
        "Polycystic ovary syndrome is a hormonal condition. In everyday talk in India, people often say PCOD and PCOS for the same thing. Clinicians use diagnostic criteria, not an app label.",
        "NHS explains that PCOS is diagnosed by a healthcare professional after checking several things — symptoms, examination, and often blood tests or ultrasound — not by a tracker score.",
        "Signs that may prompt a clinical assessment include very irregular or far-apart periods, excess hair growth, acne, or weight change. Those signs also happen without PCOS. CycleCare will never say you have it or do not have it.",
        "A doctor may suggest lifestyle support, medicines, or further tests. Only they can choose treatment. FOGSI members in India are obstetrician-gynaecologists who can guide next steps.",
      ],
    },
    {
      title: "PCOS / PCOD — क्या है, और ऐप क्या नहीं कर सकता",
      summary: "भारत में PCOD और PCOS अक्सर एक ही चीज़ के लिए बोले जाते हैं। ट्रैकर निदान नहीं कर सकता।",
      body: [
        "PCOS एक हार्मोनल स्थिति है। भारत में रोज़मर्रा की बात में PCOD और PCOS अक्सर एक ही अर्थ में आते हैं। चिकित्सक मापदंडों से निदान करते हैं, ऐप लेबल से नहीं।",
        "NHS के अनुसार PCOS स्वास्थ्य पेशेवर कई चीज़ें जाँचकर निदान करते हैं — लक्षण, जाँच और अक्सर रक्त/अल्ट्रासाउंड — ऐप स्कोर से नहीं।",
        "बहुत अनियमित चक्र, अधिक बाल, मुंहासे या वजन बदलाव चिकित्सकीय आकलन का कारण बन सकते हैं। ये संकेत PCOS के बिना भी होते हैं। CycleCare 'है/नहीं' नहीं कहेगा।",
        "डॉक्टर जीवनशैली सहयोग, दवा या और जाँच सुझा सकते हैं। उपचार केवल वे चुनते हैं। भारत में FOGSI स्त्री रोग विशेषज्ञ अगले कदम बता सकते हैं।",
      ],
    },
    ["nhsPcos", "fogsi"],
  ),
  lesson(
    "late",
    "wait",
    {
      title: "Late periods",
      summary: "A late period has more than one possible explanation. An app cannot pick one.",
      body: [
        "A period can be late with stress, weight change, illness, travel, pregnancy, PCOS, or thyroid problems — among other reasons. NHS covers missed or stopped periods. Only clinical care can sort among them.",
        "If you might be pregnant, use a pregnancy test or clinic. CycleCare logs are not a test and cannot confirm or exclude pregnancy.",
        "If periods stop for more than three to six months after they have started, NHS suggests asking a GP. Bring your logged start dates.",
      ],
    },
    {
      title: "देर से पीरियड",
      summary: "देरी के कई कारण हो सकते हैं। ऐप एक कारण नहीं चुन सकता।",
      body: [
        "तनाव, वजन बदलाव, बीमारी, यात्रा, गर्भ, PCOS या थायरॉइड सहित कई कारणों से पीरियड लेट हो सकती है। NHS रुकी/छूटी पीरियड कवर करता है। केवल चिकित्सकीय देखभाल उनमें से छांट सकती है।",
        "गर्भ संभव हो तो टेस्ट या क्लिनिक लें। CycleCare के लॉग टेस्ट नहीं हैं।",
        "पीरियड शुरू होने के बाद 3–6 महीने रुकें तो NHS GP से पूछने को कहता है। लॉग तारीखें साथ ले जाएँ।",
      ],
    },
    ["nhsMissed"],
  ),
  lesson(
    "cramps",
    "pain",
    {
      title: "Cramps and period pain",
      summary: "Pain that stops daily life is a reason to ask for help, not to 'push through' in silence.",
      body: [
        "NHS describes period pain as common and also advises seeing a GP if pain is severe or stops normal activities.",
        "Heat, rest, and medicines a clinician says are appropriate may help some people. Do not start prescription medicine from an app suggestion — CycleCare does not prescribe.",
        "Repeated vomiting, fainting, or pain that is suddenly much worse than your usual pattern needs prompt medical advice.",
      ],
    },
    {
      title: "ऐंठन और पीरियड दर्द",
      summary: "रोज़मर्रा रोकने वाला दर्द मदद माँगने का कारण है, चुपचाप सहने का नहीं।",
      body: [
        "NHS पीरियड दर्द को आम बताता है और गंभीर या काम रोकने पर GP से मिलने को कहता है।",
        "गर्माहट, आराम और चिकित्सक द्वारा उचित दवा कुछ लोगों को मदद कर सकती है। ऐप से नुस्खा न शुरू करें।",
        "बार-बार उल्टी, बेहोशी, या अचानक बहुत बढ़े दर्द पर तुरंत सलाह लें।",
      ],
    },
    ["nhsPain", "acogPain"],
  ),
  lesson(
    "hygiene",
    "care",
    {
      title: "Pads, cups and cloth",
      summary: "How to use each more safely — comfort and infection prevention, not shame.",
      body: [
        "Pads: change as often as your flow needs, often every few hours, and follow the pack. Wash hands before and after. Used pads go in a bin, not flushed.",
        "Cloth: wash with soap and water, dry fully in sunlight if you can, and change often. Damp cloth left in a bag can smell or irritate. Seek care for fever, rash, or pain.",
        "Cups: wash hands, follow the brand’s boil/wash steps, and do not leave a cup in longer than the instructions. Fever, rash, or sudden illness needs urgent care.",
        "WHO frames menstrual health as a health and rights issue. India’s NHM menstrual hygiene scheme supports education and product access in public programmes. CycleCare does not sell or endorse a brand.",
      ],
    },
    {
      title: "पैड, कप और कपड़ा",
      summary: "प्रत्येक का सुरक्षित उपयोग — आराम और संक्रमण रोकथाम, शर्म नहीं।",
      body: [
        "पैड: फ्लो के अनुसार बदलें, अक्सर कुछ घंटों में, पैक देखें। पहले-बाद हाथ धोएँ। इस्तेमाल पैड कूड़े में, शौचालय में नहीं।",
        "कपड़ा: साबुन से धोएँ, यदि हो सके धूप में सुखाएँ, अक्सर बदलें। गीला कपड़ा बैग में न छोड़ें। बुखार/चकत्ते/दर्द पर देखभाल लें।",
        "कप: हाथ धोएँ, ब्रांड के उबाल/धुलाई चरण देखें, निर्देश से अधिक समय न छोड़ें। बुखार या अचानक बीमारी पर तुरंत देखभाल लें।",
        "WHO मासिक धर्म स्वास्थ्य को अधिकार का विषय मानता है। भारत के NHM में स्वच्छता योजना है। CycleCare कोई ब्रांड नहीं बेचता।",
      ],
    },
    ["whoMenstrual", "nhmHygiene"],
  ),
  lesson(
    "first",
    "first",
    {
      title: "First periods",
      summary: "The first period can be light, irregular, or surprising. Support matters more than a perfect calendar.",
      body: [
        "ACOG explains menarche (the first period) and notes that early cycles are often irregular. There is no single 'correct' start age that an app can certify as healthy.",
        "If periods have not started by about 15 years, or by three years after breast development, ACOG advises seeing a clinician. CycleCare cannot estimate that without those facts.",
        "A trusted adult, school nurse, or adolescent clinic can help with products, pain, and questions. You do not need to wait until the pattern looks 'regular' to ask.",
      ],
    },
    {
      title: "पहली पीरियड",
      summary: "पहली पीरियड हल्की, अनियमित या अचानक हो सकती है। सही कैलेंडर से ज्यादा साथ मायने रखता है।",
      body: [
        "ACOG मेनार्चे समझाता है और कहता है कि शुरुआती चक्र अक्सर अनियमित होते हैं। ऐप किसी आयु को 'स्वस्थ' प्रमाणित नहीं कर सकता।",
        "लगभग 15 वर्ष तक पीरियड न शुरू हों, या स्तन विकास के तीन वर्ष बाद भी न हों, तो ACOG चिकित्सक से मिलने को कहता है।",
        "विश्वसनीय वयस्क, स्कूल नर्स या किशोर क्लिनिक उत्पाद, दर्द और प्रश्नों में मदद कर सकते हैं।",
      ],
    },
    ["acogAdolescents", "nhsPeriods"],
  ),
  lesson(
    "warnings",
    "alert",
    {
      title: "Medical warning signs",
      summary: "Some patterns should go to a clinician even if an app feels calm.",
      body: [
        "NHS lists reasons to see a GP including periods lasting longer than 7 days, bleeding between periods, very heavy bleeding, and period pain that stops normal life.",
        "Soaking through protection every hour or two, feeling dizzy or faint, or passing large clots are described by NHS and CDC as reasons to seek care. CycleCare cannot measure blood loss.",
        "Sudden severe pain, fever with tampon use, bleeding after sex, or bleeding after menopause (if relevant) need medical care. This app does not provide emergency triage.",
      ],
    },
    {
      title: "चिकित्सकीय चेतावनी संकेत",
      summary: "कुछ पैटर्न ऐप शांत लगने पर भी चिकित्सक तक जाने चाहिए।",
      body: [
        "NHS: 7 दिन से अधिक पीरियड, बीच में रक्तस्राव, बहुत भारी फ्लो, और जीवन रोकने वाला दर्द GP से मिलने के कारण हैं।",
        "हर 1–2 घंटे में भीगना, चक्कर, या बड़े थक्के NHS/CDC के अनुसार देखभाल के कारण हैं। CycleCare रक्त हानि नहीं मापता।",
        "अचानक तेज़ दर्द, टैम्पोन के साथ बुखार, यौन संबंध के बाद रक्तस्राव — चिकित्सा देखभाल लें। यह ऐप आपातकालीन ट्राएज नहीं है।",
      ],
    },
    ["nhsPeriods", "nhsHeavy", "cdcHeavy"],
  ),
];
