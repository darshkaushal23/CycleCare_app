import { useState } from "react";
import { Doodle } from "./art/Doodles";
import { Button } from "./ui/Button";

export function FirstTour({ t, onDone }) {
  const [step, setStep] = useState(0);
  const slides = [
    { doodle: "flower", title: t("tour.s1title"), body: t("tour.s1body") },
    { doodle: "journal", title: t("tour.s2title"), body: t("tour.s2body") },
    { doodle: "calendar", title: t("tour.s3title"), body: t("tour.s3body") },
    { doodle: "care", title: t("tour.s4title"), body: t("tour.s4body") },
  ];
  const slide = slides[step];
  const last = step === slides.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 p-4 md:items-center" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <div className="w-full max-w-md rounded-3xl bg-cream-50 p-5 shadow-float">
        <div className="mb-4 flex gap-1" aria-hidden="true">
          {slides.map((_, index) => (
            <span key={index} className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-plum" : "bg-lavender-200"}`} />
          ))}
        </div>
        <Doodle kind={slide.doodle} className="h-16 w-16" />
        <h2 id="tour-title" className="mt-3 font-display text-2xl text-ink-900">
          {slide.title}
        </h2>
        <p className="mt-2 text-base leading-relaxed text-ink-700">{slide.body}</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button variant="ghost" className="flex-1" onClick={onDone}>
            {t("tour.skip")}
          </Button>
          {last ? (
            <Button className="flex-1" onClick={onDone}>
              {t("tour.start")}
            </Button>
          ) : (
            <Button className="flex-1" onClick={() => setStep((value) => value + 1)}>
              {t("common.next")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
