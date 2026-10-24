import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Card } from "../components/ui/Card";
import { useAppState } from "../context/AppState";
import { LESSONS } from "../lib/learnContent";
import { speak, stopSpeaking } from "../lib/speech";

function LessonArt({ kind }) {
  const colors = {
    cycle: "bg-lavender-100",
    wave: "bg-rose-100",
    info: "bg-lavender-50",
    wait: "bg-cream-200",
    pain: "bg-rose-50",
    care: "bg-lavender-100",
    first: "bg-rose-100",
    alert: "bg-rose-100",
  };
  return (
    <svg className={`h-16 w-16 rounded-2xl ${colors[kind] ?? "bg-lavender-50"}`} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="18" fill="none" stroke="#6F57A5" strokeWidth="3" />
      <path d="M32 14v18l10 6" fill="none" stroke="#C45B6C" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function LearnPage() {
  const { lang, t } = useAppState();
  const [open, setOpen] = useState(LESSONS[0].id);
  const [speaking, setSpeaking] = useState("");
  const lessons = LESSONS;

  return (
    <div className="page-enter mx-auto max-w-3xl space-y-4">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lavender-500">{t("learn.kicker")}</p>
        <h1 className="mt-1 font-display text-3xl">{t("nav.learn")}</h1>
        <p className="mt-2 text-sm text-ink-500">{t("learn.intro")}</p>
      </header>
      {lessons.map((lesson) => {
        const copy = lesson[lang] ?? lesson.en;
        const expanded = open === lesson.id;
        return (
          <Card key={lesson.id}>
            <div className="flex items-start gap-3">
              <LessonArt kind={lesson.icon} />
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? "" : lesson.id)}
              >
                <h2 className="font-display text-xl">{copy.title}</h2>
                <p className="mt-1 text-sm text-ink-500">{copy.summary}</p>
              </button>
            </div>
            {expanded ? (
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink-700">
                <button
                  type="button"
                  className="inline-flex h-11 items-center gap-2 rounded-2xl bg-lavender-50 px-3 text-sm text-lavender-700"
                  onClick={() => {
                    if (speaking === lesson.id) {
                      stopSpeaking();
                      setSpeaking("");
                      return;
                    }
                    speak([copy.title, copy.summary, ...copy.body].join(". "), lang);
                    setSpeaking(lesson.id);
                  }}
                >
                  {speaking === lesson.id ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  {speaking === lesson.id ? t("learn.stop") : t("learn.listen")}
                </button>
                {copy.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <ul className="space-y-1 text-xs text-lavender-700">
                  {lesson.sources.map((source) => (
                    <li key={source.url}>
                      <a href={source.url} className="underline" target="_blank" rel="noreferrer">
                        {source.name}: {source.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
