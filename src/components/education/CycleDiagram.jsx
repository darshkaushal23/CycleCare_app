import { CYCLE_PHASES, PHASE_COLORS, PHASE_SOURCES, phaseCopy } from "../../lib/cyclePhases";
import { formatDisplayDate } from "../../lib/dates";
import { Doodle } from "../art/Doodles";
import { ListenBar } from "./ListenBar";

const TRACK = {
  follicular: "#E9DDF7",
  luteal: "#C4A9DC",
  menstrual: "#F6C1CF",
};

const PHASE_ART = { menstrual: "drop", follicular: "flower", ovulation: "spark", luteal: "moon" };

export function CycleDiagram({ lang = "en", t, selected, onSelect, compact = false, prediction = null }) {
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const canPersonalize = Boolean(
    prediction?.canPredict && !prediction.irregular && !prediction.skipOvulation && prediction.lastPeriod,
  );
  const last = prediction?.lastPeriod;
  const ovu = prediction?.ovulationWindow;
  const open = phaseCopy(selected, lang);

  function pick(id) {
    onSelect?.(selected === id ? "" : id);
  }

  const on = (id) => selected === id;

  return (
    <div className="grid min-w-0 gap-4 overflow-x-hidden">
      {compact ? null : (
        <details className="rounded-2xl bg-cream-50 px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium text-plum">{t("learn.readMore")}</summary>
          <p className="mt-2 text-sm leading-relaxed text-ink-700">{t("phases.timelineIntro")}</p>
        </details>
      )}
      {canPersonalize ? (
        <p className="rounded-2xl bg-cream-50 px-3 py-2 text-xs leading-relaxed text-ink-700">
          {t("phases.loggedBleed")}: {formatDisplayDate(last.startDate, locale)} – {formatDisplayDate(last.endDate, locale)}
          {ovu ? (
            <>
              {" · "}
              {t("phases.ovuEstimate")}: {formatDisplayDate(ovu.start, locale)} – {formatDisplayDate(ovu.end, locale)} (
              {t("phases.estimateOnly")})
            </>
          ) : null}
        </p>
      ) : (
        <p className="rounded-2xl bg-cream-50 px-3 py-2 text-xs leading-relaxed text-ink-700">{t("phases.educationalOnly")}</p>
      )}

      <div className="min-w-0">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-lavender-500">{t("phases.diagramLabel")}</p>

        <div className="relative min-w-0 px-0.5 pb-1 pt-3">
          <div className="relative h-10 overflow-hidden rounded-full shadow-soft ring-1 ring-lavender-200 sm:h-11">
            <button
              type="button"
              aria-pressed={on("follicular")}
              aria-label={t("phases.short.follicular")}
              onClick={() => pick("follicular")}
              className={`absolute inset-y-0 left-0 w-[58%] motion-safe:transition duration-200 ${
                on("follicular") ? "brightness-95 shadow-[inset_0_0_0_2px_#563F68]" : "hover:brightness-[0.97]"
              }`}
              style={{ background: TRACK.follicular }}
            />
            <button
              type="button"
              aria-pressed={on("luteal")}
              aria-label={t("phases.short.luteal")}
              onClick={() => pick("luteal")}
              className={`absolute inset-y-0 right-0 w-[42%] motion-safe:transition duration-200 ${
                on("luteal") ? "brightness-95 shadow-[inset_0_0_0_2px_#563F68]" : "hover:brightness-[0.97]"
              }`}
              style={{ background: TRACK.luteal }}
            />
            <button
              type="button"
              aria-pressed={on("menstrual")}
              aria-label={t("phases.short.menstrual")}
              onClick={() => pick("menstrual")}
              className={`absolute bottom-0 left-0 h-[42%] w-[24%] rounded-tr-3xl motion-safe:transition duration-200 ${
                on("menstrual") ? "h-[52%] shadow-[inset_0_0_0_2px_#563F68]" : "hover:brightness-[0.97]"
              }`}
              style={{ background: TRACK.menstrual }}
            />
          </div>
          <button
            type="button"
            aria-pressed={on("ovulation")}
            aria-label={t("phases.short.ovulation")}
            onClick={() => pick("ovulation")}
            className={`absolute left-[58%] top-[1.55rem] z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full motion-safe:transition duration-200 sm:h-3.5 sm:w-3.5 ${
              on("ovulation") ? "ring-2 ring-offset-2 ring-offset-cream-50" : "ring-2 ring-cream-50"
            }`}
            style={{ background: "#563F68", outlineColor: "#563F68" }}
          >
            <span className="sr-only">{t("phases.ovuMarker")}</span>
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1 text-[10px] leading-tight text-ink-500">
          <p>{t("phases.dayOne")}</p>
          <p className="text-center font-medium text-plum">{t("phases.ovuMarker")}</p>
          <p className="text-right">{t("phases.nextPeriod")}</p>
        </div>
      </div>

      <ul className="grid min-w-0 grid-cols-2 gap-2">
        {CYCLE_PHASES.map((phase) => {
          const copy = phaseCopy(phase.id, lang);
          const active = on(phase.id);
          return (
            <li key={phase.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => pick(phase.id)}
                className={`flex h-full w-full min-w-0 flex-col rounded-2xl p-2 text-left motion-safe:transition duration-200 sm:p-2.5 ${
                  active ? "bg-cream-50 ring-2 ring-plum shadow-soft" : "bg-cream-50/80 ring-1 ring-lavender-100 hover:ring-lavender-300"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Doodle kind={PHASE_ART[phase.id]} className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" />
                  <span className="min-w-0 break-words text-[12px] font-medium leading-tight text-ink-900 sm:text-[13px]">{t(`phases.short.${phase.id}`)}</span>
                </span>
                <span className="mt-1.5 break-words text-[11px] leading-snug text-ink-500">{copy.short}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {open ? (
        <div
          className="rounded-2xl bg-cream-50 p-3 text-xs leading-relaxed text-ink-700"
          style={{ boxShadow: `inset 0 0 0 1px ${PHASE_COLORS[selected]}55` }}
        >
          <p className="font-display text-base text-ink-900">{open.title}</p>
          {open.mean ? <p className="mt-1 text-ink-500">{open.mean}</p> : null}
          <p className="mt-2">
            <strong>{t("phases.happens")}</strong> {open.happens}
          </p>
          <p className="mt-1">
            <strong>{t("phases.uncertainty")}</strong> {open.uncertainty}
          </p>
          {compact ? null : (
            <div className="pt-2">
              <ListenBar text={[open.title, open.mean, open.happens, open.uncertainty].filter(Boolean).join(". ")} lang={lang} />
            </div>
          )}
        </div>
      ) : null}

      <details className="rounded-2xl bg-cream-50 p-3">
        <summary className="cursor-pointer text-xs font-medium text-ink-800">{t("phases.uncertainty")}</summary>
        <p className="mt-2 text-xs leading-relaxed text-ink-500">{t("phases.overlapNote")}</p>
        <p className="mt-2 text-xs leading-relaxed text-ink-500">{t("phases.noContraception")}</p>
      </details>
      {compact ? null : (
        <ul className="space-y-1 text-xs text-plum">
          {PHASE_SOURCES.map((source) => (
            <li key={source.url}>
              <a href={source.url} className="underline" target="_blank" rel="noreferrer">
                {source.name}: {source.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
