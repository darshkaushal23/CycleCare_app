import { SOURCES, sourceList } from "./sources";

const S = {
  periods: sourceList(["nhsPeriods"]),
  irregular: sourceList(["nhsIrregular"]),
  heavy: sourceList(["nhsHeavy", "cdcHeavy"]),
  pain: sourceList(["nhsPain", "acogPain"]),
  missed: sourceList(["nhsMissed"]),
  pcos: sourceList(["nhsPcos"]),
  first: sourceList(["acogAdolescents"]),
  who: sourceList(["whoMenstrual"]),
  hygiene: sourceList(["nhmHygiene", "whoMenstrual"]),
  fogsi: sourceList(["fogsi"]),
};

function faq(id, tags, qEn, aEn, qHi, aHi, sources) {
  return {
    id,
    tags,
    en: { q: qEn, a: aEn },
    hi: { q: qHi, a: aHi },
    sources,
  };
}

export const SAHELI_FAQS = [
  faq("what-period", ["period", "cycle", "blood", "पीरियड", "चक्र"], "What is a period?", "A period is bleeding from the uterus, usually lasting a few days. NHS explains it as the monthly shedding of the uterus lining. Length and flow differ between people.", "पीरियड क्या है?", "पीरियड गर्भाशय से रक्तस्राव है, अक्सर कुछ दिन। NHS इसे गर्भाशय की परत का स्राव बताता है। लंबाई और फ्लो अलग-अलग होते हैं।", S.periods),
  faq("cycle-length", ["cycle", "28", "length", "लंबाई"], "How long is a normal cycle?", "There is no single normal number. Many cycles last a few weeks; NHS discusses typical ranges and when to speak with a GP if cycles are shorter than 21 days or the pattern worries you.", "सामान्य चक्र कितना लंबा होता है?", "एक ही 'सही' संख्या नहीं है। कई चक्र कुछ सप्ताह के होते हैं; NHS 21 दिन से छोटे चक्र या चिंता वाले पैटर्न पर GP से बात करने को कहता है।", S.periods),
  faq("period-days", ["days", "how long", "7", "दिन"], "How many days should bleeding last?", "NHS describes bleeding that often lasts 2–7 days and suggests seeing a GP if periods last longer than 7 days. Your logs are not a diagnosis.", "रक्तस्राव कितने दिन चले?", "NHS अक्सर 2–7 दिन बताता है और 7 दिन से अधिक हो तो GP से मिलने को कहता है। आपके लॉग निदान नहीं हैं।", S.periods),
  faq("first-period", ["first", "menarche", "age", "पहली", "मेनार्चे"], "When do first periods usually start?", "ACOG describes menarche and notes a wide range of ages. If periods have not started by about 15, or three years after breast development, see a clinician. An app cannot certify your timeline.", "पहली पीरियड कब शुरू होती है?", "ACOG मेनार्चे की आयु सीमा बताता है। लगभग 15 तक या स्तन विकास के तीन वर्ष बाद भी न शुरू हो तो चिकित्सक से मिलें।", S.first),
  faq("irregular-teen", ["teen", "adolescent", "irregular", "किशोर", "अनियमित"], "Are irregular cycles normal for teens?", "ACOG notes early cycles are often irregular. That is common, not a guarantee of health. NHS still lists short cycles, bleeding between periods, or a worrying change as reasons to see a GP.", "किशोरों में अनियमित चक्र सामान्य है?", "ACOG कहता है शुरुआती चक्र अक्सर अनियमित होते हैं। यह आम है, स्वास्थ्य की गारंटी नहीं। NHS छोटे चक्र या बीच में रक्तस्राव पर GP से मिलने को कहता है।", S.irregular),
  faq("late", ["late", "missed", "delay", "देर", "नहीं आया"], "My period is late. What should I do?", "A late period has several possible causes. NHS discusses missed periods. If pregnancy is possible, take a test or visit a clinic. CycleCare cannot confirm or exclude pregnancy.", "पीरियड लेट है। क्या करूँ?", "देरी के कई कारण हो सकते हैं। गर्भ संभव हो तो टेस्ट या क्लिनिक लें। CycleCare गर्भ बता या खारिज नहीं कर सकता।", S.missed),
  faq("pregnancy", ["pregnant", "pregnancy", "गर्भ", "प्रेग्नेंट"], "Can this app tell if I am pregnant?", "No. Logs and estimates are not a pregnancy test. Use a licensed test or a clinic. Saheli will not guess from a late period.", "क्या ऐप बता सकता है कि मैं गर्भवती हूँ?", "नहीं। लॉग और अनुमान गर्भावस्था टेस्ट नहीं हैं। लाइसेंसशुदा टेस्ट या क्लिनिक लें।", S.missed),
  faq("pcos", ["pcos", "pcod", "cyst"], "Do irregular periods mean I have PCOS?", "No. NHS states PCOS is diagnosed by a healthcare professional, often with tests. Irregular cycles happen with and without PCOS. CycleCare will not diagnose or rule out PCOS.", "अनियमित पीरियड का मतलब PCOS है?", "नहीं। NHS के अनुसार PCOS स्वास्थ्य पेशेवर निदान करते हैं। अनियमित चक्र PCOS के बिना भी होते हैं।", S.pcos),
  faq("pcod-diff", ["pcod", "pcos", "difference"], "What is the difference between PCOS and PCOD?", "People often use both names. Clinicians follow diagnostic criteria for polycystic ovary syndrome. An app cannot sort informal labels. Ask a gynaecologist what they mean in your case.", "PCOS और PCOD में फर्क?", "लोग दोनों नाम इस्तेमाल करते हैं। चिकित्सक PCOS के मापदंडों से निदान करते हैं। ऐप लेबल नहीं छांट सकता।", S.pcos),
  faq("heavy", ["heavy", "flooding", "clot", "भारी", "थक्के"], "What counts as heavy bleeding?", "NHS and CDC describe soaking pads frequently (about every 1–2 hours), large clots, or feeling dizzy as reasons to seek care. CycleCare cannot measure millilitres of blood.", "भारी रक्तस्राव क्या है?", "NHS/CDC बार-बार भीगना (लगभग हर 1–2 घंटे), बड़े थक्के या चक्कर को देखभाल का कारण बताते हैं। ऐप मिलीलीटर नहीं मापता।", S.heavy),
  faq("soaking", ["soak", "pad", "hour", "भीग"], "I soak a pad in under two hours. Is that urgent?", "That matches descriptions NHS and CDC give for seeking care. If you also feel faint, go sooner. The app cannot say you are safe to wait.", "दो घंटे में पैड भीग जाए तो?", "यह NHS/CDC की देखभाल वाली तस्वीर से मेल खाता है। चक्कर हों तो जल्दी जाएँ। ऐप इंतज़ार सुरक्षित नहीं कह सकता।", S.heavy),
  faq("pain-school", ["pain", "cramp", "school", "दर्द", "ऐंठन", "स्कूल"], "Period pain stops me from school. What now?", "NHS advises seeing a GP if pain stops normal activities. Tell a trusted adult. Do not start prescription drugs because an app suggested them.", "दर्द से स्कूल छूटता है?", "NHS सामान्य काम रुकने पर GP से मिलने को कहता है। विश्वसनीय वयस्क को बताएँ। ऐप की सलाह से नुस्खा न शुरू करें।", S.pain),
  faq("painkillers", ["ibuprofen", "mefenamic", "medicine", "दवाई"], "Which painkiller should I take?", "Saheli does not prescribe. A pharmacist or clinician can say what is appropriate for your age, stomach, and other medicines. Heat and rest help some people; that is not medical advice for every body.", "कौन सी दर्द की दवा लूँ?", "सहेली नुस्खा नहीं देती। फार्मासिस्ट या चिकित्सक आपकी आयु और अन्य दवाओं के अनुसार बता सकते हैं।", S.pain),
  faq("between", ["spotting", "between", "midcycle", "स्पॉटिंग", "बीच"], "I bleed between periods. Is that OK?", "NHS lists bleeding between periods as a reason to see a GP. One spot does not explain itself. The app will not call it harmless.", "पीरियड के बीच रक्तस्राव?", "NHS इसे GP से मिलने का कारण बताता है। ऐप इसे हानिरहित नहीं कहेगा।", S.irregular),
  faq("missed-months", ["3 months", "amenorrhea", "stopped", "महीने"], "No period for three months. What does NHS say?", "NHS suggests asking a GP if periods stop for more than 3–6 months after they have begun. Bring dates. The app cannot name the cause.", "तीन महीने पीरियड नहीं?", "NHS: शुरू होने के बाद 3–6 महीने रुकें तो GP से पूछें। कारण ऐप नहीं बताएगा।", S.missed),
  faq("ovulation", ["ovulation", "fertile", "ओव्यूलेशन"], "Can you tell me my ovulation day?", "Not when cycles are irregular or history is short. Even with steadier logs, CycleCare only offers a rough estimate and never as contraception.", "ओव्यूलेशन दिन बता सकते हो?", "अनियमित चक्र या कम इतिहास पर नहीं। स्थिर लॉग पर भी यह मोटा अनुमान है, गर्भनिरोध नहीं।", S.periods),
  faq("contraception", ["contraception", "safe sex", "गर्भनिरोध"], "Can I use CycleCare as contraception?", "No. Estimates are not a fertility-awareness method and are not protection against pregnancy or infections.", "क्या CycleCare गर्भनिरोध है?", "नहीं। अनुमान फर्टिलिटी विधि नहीं है और गर्भ या संक्रमण से रक्षा नहीं करता।", S.periods),
  faq("hygiene-pad", ["pad", "hygiene", "change", "पैड", "स्वच्छता"], "How often should I change a pad?", "Follow the product instructions and your flow. WHO and India’s NHM menstrual hygiene scheme emphasise clean materials and changing as needed. Fever or unusual discharge needs clinical advice.", "पैड कितनी देर में बदलें?", "उत्पाद निर्देश और फ्लो देखें। बुखार या असामान्य स्राव पर चिकित्सकीय सलाह लें।", S.hygiene),
  faq("cloth", ["cloth", "wash", "कपड़ा"], "Is cloth OK to use?", "Many people use cloth. Wash with soap and water, dry fully in sunlight if you can, and change often. Seek care for fever, rash, or pain. This is hygiene information, not a product endorsement.", "क्या कपड़ा ठीक है?", "कई लोग कपड़ा इस्तेमाल करते हैं। साबुन से धोएँ, सुखाएँ, अक्सर बदलें। बुखार/दर्द पर देखभाल लें।", S.hygiene),
  faq("tampon-tss", ["tampon", "cup", "tss", "fever", "टैम्पोन"], "Can tampons be dangerous?", "Follow wear-time instructions. Fever, rash, or sudden illness while using a tampon needs urgent care (toxic shock is rare but serious). Saheli cannot diagnose TSS.", "टैम्पोन खतरनाक?", "समय सीमा का पालन करें। टैम्पोन के साथ बुखार/चकत्ते पर तुरंत देखभाल लें। सहेली TSS निदान नहीं करती।", S.hygiene),
  faq("exercise", ["sport", "exercise", "swim", "खेल"], "Can I play sports on my period?", "Yes if you feel able. Pain that stops sport is a reason to talk to a clinician, per NHS period-pain guidance — not a reason for shame.", "पीरियड पर खेल?", "यदि शरीर साथ दे तो हाँ। खेल रोकने वाला दर्द NHS के अनुसार चिकित्सक से बात का कारण है।", S.pain),
  faq("school", ["school", "exam", "स्कूल"], "What if I bleed at school?", "Carry spare products if you can. A teacher, counsellor, or school health staff can help. NHM programmes exist to support menstrual hygiene in schools. Shame is not a medical requirement.", "स्कूल में रक्तस्राव हो तो?", "यदि हो सके तो अतिरिक्त उत्पाद रखें। शिक्षक या स्वास्थ्य स्टाफ मदद कर सकते हैं।", S.hygiene),
  faq("diet", ["food", "iron", "diet", "खाना", "आयरन"], "Which foods fix irregular periods?", "No food plan in this app can treat irregular cycles or PCOS. A clinician may discuss iron if bleeding is heavy. Beware of social-media 'cures'.", "कौन सा खाना अनियमित पीरियड ठीक करे?", "इस ऐप का कोई आहार चक्र या PCOS ठीक नहीं करता। भारी रक्तस्राव पर चिकित्सक आयरन की बात कर सकते हैं।", S.pcos),
  faq("weight", ["weight", "thin", "weight loss", "वजन"], "Does weight stop periods?", "Very low energy availability or rapid weight change can affect periods, among many other causes. That is a clinic conversation, not an app verdict.", "क्या वजन से पीरियड रुकते हैं?", "बहुत कम ऊर्जा या तेज़ वजन बदलाव समेत कई कारण हो सकते हैं। यह क्लिनिक की बात है।", S.missed),
  faq("stress", ["stress", "exam", "तनाव"], "Can stress delay a period?", "Stress is one of several possible factors NHS mentions in missed periods. It is not a diagnosis you can confirm in an app, and it should not be used to ignore other possibilities such as pregnancy.", "क्या तनाव से देरी होती है?", "तनाव कई संभावित कारणों में से एक है। ऐप से पुष्टि नहीं होती, और गर्भ जैसी संभावनाओं को नज़रअंदाज़ न करें।", S.missed),
  faq("sex", ["sex", "virgin", "यौन"], "Does sex change my cycle?", "Bleeding after sex should be mentioned to a clinician. CycleCare does not give sexual advice and cannot detect infections.", "क्या सेक्स से चक्र बदलता है?", "सेक्स के बाद रक्तस्राव चिकित्सक को बताएँ। CycleCare संक्रमण नहीं पकड़ता।", S.irregular),
  faq("privacy", ["privacy", "parent", "lock", "गोपनीयता"], "Is my data on a server?", "No. CycleCare stores logs in this browser only. Anyone with access to this device could still open the browser. There is no account login.", "क्या मेरा डेटा सर्वर पर है?", "नहीं। लॉग केवल इस ब्राउज़र में हैं। इस डिवाइस वाला व्यक्ति ब्राउज़र खोल सकता है।", S.who),
  faq("doctor-when", ["doctor", "gp", "clinic", "डॉक्टर"], "When should I see a doctor?", "NHS lists longer-than-7-day periods, bleeding between periods, very heavy flow, pain that stops life, and long gaps after periods have started. Care Guidance maps your logs to those ideas without diagnosing.", "डॉक्टर कब दिखाएँ?", "NHS: 7 दिन से अधिक, बीच में रक्तस्राव, बहुत भारी फ्लो, जीवन रोकने वाला दर्द, लंबे अंतराल। Care Guidance निदान किए बिना लॉग मिलाता है।", S.periods),
  faq("india-clinic", ["india", "fogsi", "government", "भारत"], "Where can I find a gynaecologist in India?", "FOGSI is the national federation of obstetrician-gynaecologists. Government primary health centres and adolescent clinics (including RKSK-linked services) may also help. This app does not book appointments.", "भारत में स्त्री रोग विशेषज्ञ?", "FOGSI राष्ट्रीय संघ है। सरकारी प्राथमिक स्वास्थ्य केंद्र और किशोर क्लिनिक भी मदद कर सकते हैं। ऐप अपॉइंटमेंट नहीं करता।", S.fogsi),
  faq("anaemia", ["anaemia", "anemia", "tired", "एनीमिया", "थकान"], "Could heavy periods cause tiredness?", "Heavy bleeding can be associated with anaemia; CDC and NHS discuss this. Only a blood test can check. Feeling tired has many causes.", "क्या भारी पीरियड से थकान?", "भारी रक्तस्राव एनीमिया से जुड़ सकता है। केवल रक्त जाँच बता सकती है। थकान के कई कारण हैं।", S.heavy),
  faq("discharge", ["discharge", "itch", "smell", "स्राव"], "I have itching and discharge. Is it my period?", "Vaginal discharge and infections are separate from menstrual bleeding. See a clinic. Saheli cannot identify infections.", "खुजली और स्राव पीरियड है?", "स्राव और संक्रमण मासिक रक्तस्राव से अलग हैं। क्लिनिक जाएँ। सहेली संक्रमण नहीं पहचानती।", S.periods),
  faq("estimate", ["confidence", "predict", "window", "अनुमान"], "Why is my prediction a range?", "CycleCare uses the median of up to six logged cycles and widens the window when lengths vary. It is an estimate, not a validated probability score.", "भविष्यवाणी एक सीमा क्यों है?", "छह चक्र तक की मध्य लंबाई और अंतर पर चौड़ी विंडो। यह अनुमान है, प्रमाणित प्रतिशत नहीं।", S.periods),
];

export function searchFaqs(query, lang = "en") {
  const q = (query ?? "").trim().toLowerCase();
  if (!q) return { matches: [], fallback: false };
  const tokens = q.split(/\s+/).filter((token) => token.length > 1);
  const scored = SAHELI_FAQS.map((item) => {
    const blob = `${item.en.q} ${item.en.a} ${item.hi.q} ${item.hi.a} ${item.tags.join(" ")}`.toLowerCase();
    const score = tokens.reduce((sum, token) => sum + (blob.includes(token) ? 1 : 0), 0);
    return { item, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);
  return {
    matches: scored.map((row) => row.item),
    fallback: scored.length === 0,
  };
}

export { SOURCES };
