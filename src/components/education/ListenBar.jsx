import { useEffect, useRef, useState } from "react";
import { Pause, Play, Square, Volume2 } from "lucide-react";
import { useAppState } from "../../context/AppState";
import {
  canSpeak,
  onSpeechChange,
  pauseSpeaking,
  pickVoice,
  resumeSpeaking,
  speakText,
  stopSpeaking,
  voicesForLang,
} from "../../lib/speech";

export function ListenBar({ text, lang }) {
  const { t } = useAppState();
  const [allVoices, setAllVoices] = useState([]);
  const [voiceURI, setVoiceURI] = useState("");
  const [rate, setRate] = useState(1);
  const [mode, setMode] = useState("idle");
  const [notice, setNotice] = useState("");
  const tokenRef = useRef(null);
  const voices = voicesForLang(lang, allVoices);

  useEffect(() => {
    function load() {
      setAllVoices(window.speechSynthesis?.getVoices?.() ?? []);
    }
    load();
    window.speechSynthesis?.addEventListener?.("voiceschanged", load);
    const off = onSpeechChange((detail) => {
      const incoming = detail?.token;
      const mine = tokenRef.current;
      if (mine == null) return;
      if (incoming !== mine) {
        setMode("idle");
        return;
      }
      if (detail?.mode) setMode(detail.mode);
    });
    return () => {
      window.speechSynthesis?.removeEventListener?.("voiceschanged", load);
      off();
      stopSpeaking();
      tokenRef.current = null;
      setMode("idle");
    };
  }, []);

  useEffect(() => {
    setVoiceURI("");
    setNotice("");
    stopSpeaking();
    tokenRef.current = null;
    setMode("idle");
  }, [lang]);

  useEffect(() => {
    stopSpeaking();
    tokenRef.current = null;
    setMode("idle");
    return () => {
      stopSpeaking();
      tokenRef.current = null;
    };
  }, [text]);

  function start() {
    if (!canSpeak()) {
      setNotice(t("listen.unsupported"));
      return;
    }
    const picked = pickVoice(lang, window.speechSynthesis.getVoices(), voiceURI || undefined);
    if (!picked.voice) {
      setNotice(lang === "hi" ? t("listen.noHindi") : t("listen.noLang"));
      setMode("idle");
      return;
    }
    const result = speakText(text, { lang, rate, voiceURI: picked.voice.voiceURI });
    if (!result.ok) {
      setNotice(result.status === "no-hindi" ? t("listen.noHindi") : t("listen.noLang"));
      return;
    }
    tokenRef.current = result.token;
    setNotice("");
    setMode("playing");
  }

  if (!text) return null;

  return (
    <div className="mb-4 scroll-mt-28 rounded-2xl bg-lavender-50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={`inline-flex h-11 items-center gap-2 rounded-2xl px-3 text-sm ring-1 ${
            mode === "playing" ? "bg-plum text-cream-50 ring-plum" : "bg-cream-50 text-plum ring-lavender-200"
          }`}
          onClick={start}
          aria-label={t("listen.listen")}
        >
          <Volume2 className="h-4 w-4" />
          {t("listen.listen")}
        </button>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cream-50 ring-1 ring-lavender-200"
          aria-label={t("listen.pause")}
          onClick={() => {
            if (mode !== "playing") return;
            pauseSpeaking();
            setMode("paused");
          }}
        >
          <Pause className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cream-50 ring-1 ring-lavender-200"
          aria-label={t("listen.resume")}
          onClick={() => {
            if (mode !== "paused") return;
            resumeSpeaking();
            setMode("playing");
          }}
        >
          <Play className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cream-50 ring-1 ring-lavender-200"
          aria-label={t("listen.stop")}
          onClick={() => {
            stopSpeaking();
            tokenRef.current = null;
            setMode("idle");
          }}
        >
          <Square className="h-4 w-4" />
        </button>
        <label className="ml-auto flex min-w-[8rem] items-center gap-2 text-xs text-ink-500">
          {t("listen.speed")}
          <input
            type="range"
            min="0.7"
            max="1.3"
            step="0.1"
            value={rate}
            onChange={(event) => setRate(Number(event.target.value))}
            className="w-24 accent-lavender-700"
          />
        </label>
      </div>
      {voices.length >= 1 ? (
        <label className="mt-2 block text-xs text-ink-500">
          {t("listen.voice")}
          <select
            className="ui-input mt-1 h-10 text-sm"
            value={voiceURI}
            onChange={(event) => setVoiceURI(event.target.value)}
          >
            <option value="">{t("listen.voiceAuto")}</option>
            {voices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <p className="mt-2 text-xs text-ink-500">{t("listen.disclaimer")}</p>
      {lang === "hi" && canSpeak() && voices.length === 0 ? (
        <p className="mt-1 text-xs text-rose-700" role="status">
          {t("listen.noHindi")}
        </p>
      ) : notice ? (
        <p className="mt-1 text-xs text-rose-700" role="status">
          {notice}
        </p>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {mode}
      </p>
    </div>
  );
}
