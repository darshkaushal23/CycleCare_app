import { useState } from "react";
import { Doodle } from "../components/art/Doodles";
import { MeanTip } from "../components/MeanTip";
import { Card } from "../components/ui/Card";
import { CycleDiagram } from "../components/education/CycleDiagram";
import { LessonArt } from "../components/education/LessonArt";
import { ListenBar } from "../components/education/ListenBar";
import { useAppState } from "../context/AppState";
import { LESSONS } from "../lib/learnContent";

export function LearnPage() {
  const { lang, t, analysis } = useAppState();
  const [open, setOpen] = useState("");
  const [phase, setPhase] = useState("menstrual");

  return (
    <div className="page-enter mx-auto max-w-3xl space-y-4">
      <header className="flex items-start gap-3">
        <Doodle kind="journal" className="h-14 w-14 shrink-0" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lavender-500">{t("learn.kicker")}</p>
          <h1 className="mt-1 font-display text-3xl">{t("nav.learn")}</h1>
          <p className="mt-2 text-sm text-ink-500">{t("learn.intro")}</p>
        </div>
      </header>

      <Card className="overflow-visible">
        <div className="flex items-start gap-3">
          <Doodle kind="drop" className="h-14 w-14 shrink-0" />
          <div>
            <h2 className="font-display text-xl">{t("phases.title")}</h2>
            <p className="mt-1 text-sm text-ink-500">{t("phases.intro")}</p>
          </div>
        </div>
        <div className="mt-4">
          <CycleDiagram lang={lang} t={t} selected={phase} onSelect={setPhase} prediction={analysis.prediction} />
        </div>
        <MeanTip t={t}>{t("phases.overlapNote")}</MeanTip>
      </Card>

      {LESSONS.map((lesson) => {
        const copy = lesson[lang] ?? lesson.en;
        const expanded = open === lesson.id;
        const urgent = lesson.id === "warnings";
        const speakText = [copy.title, copy.summary, copy.body[0]].join(". ");
        return (
          <Card key={lesson.id} className={urgent ? "ring-2 ring-rose-300" : ""}>
            <div className="flex items-start gap-3">
              <LessonArt kind={lesson.icon} />
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl">{copy.title}</h2>
                <p className="mt-1 text-sm text-ink-700">{copy.summary}</p>
              </div>
            </div>
            {urgent ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-800">
                {copy.body.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            ) : null}
            <button
              type="button"
              className="mt-3 text-sm font-medium text-plum"
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? "" : lesson.id)}
            >
              {t("learn.readMore")}
            </button>
            {expanded ? (
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink-700">
                <ListenBar text={speakText} lang={lang} />
                {urgent ? null : (
                  <div className="space-y-2">
                    {copy.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                )}
                <details className="rounded-2xl bg-cream-50 p-3">
                  <summary className="cursor-pointer font-medium">{t("learn.sources")}</summary>
                  <ul className="mt-2 space-y-1 text-xs text-plum">
                    {lesson.sources.map((source) => (
                      <li key={source.url}>
                        <a href={source.url} className="underline" target="_blank" rel="noreferrer">
                          {source.name}: {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
