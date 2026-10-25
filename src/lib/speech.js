const SPEECH_EVENT = "cyclecare-speech";

let speechToken = 0;

function emitSpeech(mode, token = null) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SPEECH_EVENT, { detail: { mode, token } }));
}

export function onSpeechChange(handler) {
  if (typeof window === "undefined") return () => {};
  const listener = (event) => handler(event.detail ?? {});
  window.addEventListener(SPEECH_EVENT, listener);
  return () => window.removeEventListener(SPEECH_EVENT, listener);
}

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function langPrefix(lang) {
  return lang === "hi" ? "hi" : "en";
}

export function voicesForLang(lang, allVoices) {
  const prefix = langPrefix(lang);
  return (allVoices ?? []).filter((voice) => (voice.lang || "").toLowerCase().startsWith(prefix));
}

const FEMALE_HINT = /female|woman|zira|heera|vaani|swara|neerja|kalpana|priya|samantha|susan|hazel|aria|jenny|sara|zira|karen|moira/i;
const MALE_HINT = /male|\bman\b|david|mark|george|ravi|hemant|richard|daniel|james|thomas/i;

function preferNatural(matched) {
  const female = matched.filter((voice) => FEMALE_HINT.test(voice.name) && !MALE_HINT.test(voice.name));
  const pool = female.length ? female : matched.filter((voice) => !MALE_HINT.test(voice.name));
  const use = pool.length ? pool : matched;
  return use.find((voice) => voice.localService) ?? use[0];
}

export function pickVoice(lang, allVoices, preferredURI) {
  const matched = voicesForLang(lang, allVoices);
  if (preferredURI) {
    const preferred = matched.find((voice) => voice.voiceURI === preferredURI);
    if (preferred) return { voice: preferred, status: "ok" };
  }
  if (!matched.length) {
    return { voice: null, status: lang === "hi" ? "no-hindi" : "no-lang" };
  }
  return { voice: preferNatural(matched), status: "ok" };
}

function getVoicesSafe() {
  if (!canSpeak()) return [];
  return window.speechSynthesis.getVoices() ?? [];
}

export function speakText(text, { lang = "en", rate = 1, voiceURI } = {}) {
  if (!canSpeak() || !text) return { ok: false, status: "unsupported" };
  const picked = pickVoice(lang, getVoicesSafe(), voiceURI);
  if (!picked.voice) return { ok: false, status: picked.status };
  window.speechSynthesis.cancel();
  speechToken += 1;
  const token = speechToken;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = picked.voice;
  utterance.lang = picked.voice.lang || (lang === "hi" ? "hi-IN" : "en-IN");
  utterance.rate = Math.min(1.4, Math.max(0.7, rate));
  utterance.addEventListener("end", () => {
    if (speechToken === token) emitSpeech("idle", token);
  });
  utterance.addEventListener("error", () => {
    if (speechToken === token) emitSpeech("idle", token);
  });
  window.speechSynthesis.speak(utterance);
  emitSpeech("playing", token);
  return { ok: true, status: "ok", utterance, token };
}

export function pauseSpeaking() {
  if (!canSpeak()) return false;
  const synth = window.speechSynthesis;
  if (synth.speaking && !synth.paused) {
    synth.pause();
    emitSpeech("paused", speechToken);
    return true;
  }
  return false;
}

export function resumeSpeaking() {
  if (!canSpeak()) return false;
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    emitSpeech("playing", speechToken);
    return true;
  }
  return false;
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
  speechToken += 1;
  emitSpeech("idle", speechToken);
}

export function speak(text, lang = "en") {
  const result = speakText(text, { lang });
  return result.ok;
}
