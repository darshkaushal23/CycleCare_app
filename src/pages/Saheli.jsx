import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Doodle } from "../components/art/Doodles";
import { Card } from "../components/ui/Card";
import { Chip } from "../components/ui/Input";
import { ListenBar } from "../components/education/ListenBar";
import { CycleDiagram } from "../components/education/CycleDiagram";
import { useAppState } from "../context/AppState";
import { FAQ_CATEGORIES, FAQ_LESSON, searchFaqs } from "../lib/saheliFaqs";
import { LESSONS } from "../lib/learnContent";

const CAT_ART = {
  cycle: "drop",
  fertility: "spark",
  symptoms: "bottle",
  mood: "mood",
  pcos: "pcos",
  pregnancy: "moon",
  contraception: "notebook",
  privacy: "wait",
};

const SUGGESTED = {
  en: ["late period", "heavy bleeding", "PCOS", "cramps", "cycle phases", "spotting"],
  hi: ["लेट पीरियड", "भारी रक्तस्राव", "PCOS", "ऐंठन", "चक्र चरण", "स्पॉटिंग"],
};

const WORRY = ["heavy", "pain", "doctor", "missed", "soak", "spotting", "between", "clot", "anaemia"];

function preview(text) {
  const sentence = (text ?? "").split(/(?<=[.।])\s+/)[0];
  return sentence || text;
}

export function SaheliPage() {
  const { lang, t, analysis } = useAppState();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [activeId, setActiveId] = useState(null);
  const [phase, setPhase] = useState("");
  const result = useMemo(() => searchFaqs(query, lang, category), [query, lang, category]);
  const list = result.matches;
  const suggestions = SUGGESTED[lang] ?? SUGGESTED.en;

  return (
    <div className="page-enter mx-auto max-w-3xl space-y-4">
      <header className="flex items-start gap-3">
        <Doodle kind="mood" className="h-14 w-14 shrink-0" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lavender-500">{t("nav.saheli")}</p>
          <h1 className="mt-1 font-display text-3xl">{t("nav.saheli")}</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">{t("saheli.intro")}</p>
        </div>
      </header>

      <label className="block">
        <span className="sr-only">{t("saheli.search")}</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("saheli.placeholder")}
          className="ui-input"
        />
      </label>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-lavender-500">{t("saheli.categories")}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist" aria-label={t("saheli.categories")}>
          <CategoryCard
            selected={category === "all"}
            doodle="flower"
            label={t("saheli.cat.all")}
            onClick={() => setCategory("all")}
          />
          {FAQ_CATEGORIES.map((id) => (
            <CategoryCard
              key={id}
              selected={category === id}
              doodle={CAT_ART[id]}
              label={t(`saheli.cat.${id}`)}
              onClick={() => setCategory(id)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <Chip key={item} selected={query === item} onClick={() => setQuery(item)}>
            {item}
          </Chip>
        ))}
      </div>

      {category === "cycle" || category === "fertility" ? (
        <Card className="overflow-visible">
          <h2 className="font-display text-lg">{t("phases.title")}</h2>
          <div className="mt-3">
            <CycleDiagram lang={lang} t={t} selected={phase} onSelect={setPhase} compact prediction={analysis.prediction} />
          </div>
        </Card>
      ) : null}

      {result.fallback ? (
        <Card>
          <Doodle kind="alert" className="h-12 w-12" />
          <p className="mt-3 text-sm leading-relaxed text-ink-700">{t("saheli.fallback")}</p>
        </Card>
      ) : null}

      {list.map((faq) => {
        const copy = faq[lang] ?? faq.en;
        const open = activeId === faq.id;
        const lessonId = FAQ_LESSON[faq.id];
        const lesson = LESSONS.find((item) => item.id === lessonId);
        const lessonCopy = lesson ? lesson[lang] ?? lesson.en : null;
        return (
          <Card key={faq.id}>
            <button
              type="button"
              className="flex w-full items-start gap-3 text-left"
              onClick={() => setActiveId(open ? null : faq.id)}
              aria-expanded={open}
            >
              <Doodle kind={CAT_ART[faq.category] ?? "flower"} className="h-11 w-11 shrink-0" />
              <span className="min-w-0">
                <h2 className="font-display text-lg">{copy.q}</h2>
                {open ? null : (
                  <>
                    <p className="mt-1 text-sm text-ink-500">{preview(copy.a)}</p>
                    <p className="mt-2 text-sm font-medium text-plum">{t("learn.readMore")}</p>
                  </>
                )}
              </span>
            </button>
            {open ? (
              <div className="mt-3 space-y-2 text-sm leading-relaxed text-ink-700">
                <ListenBar text={`${copy.q}. ${copy.a}`} lang={lang} />
                <p>{copy.a}</p>
                {faq.tags.some((tag) => WORRY.includes(tag)) ? (
                  <p className="text-sm font-medium text-rose-700">{t("today.seeDoctor")}</p>
                ) : null}
                {lessonCopy ? (
                  <Link to="/learn" className="inline-flex text-sm font-medium text-plum">
                    {t("saheli.related")}: {lessonCopy.title}
                  </Link>
                ) : null}
                <ul className="text-xs text-plum">
                  {faq.sources.map((source) => (
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

function CategoryCard({ selected, doodle, label, onClick }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={`flex min-h-[4.75rem] flex-col items-center justify-center gap-1 rounded-2xl p-2 text-center text-xs font-medium motion-safe:transition sm:text-sm ${
        selected ? "bg-lavender-100 text-plum ring-2 ring-plum shadow-soft" : "bg-cream-50 text-ink-900 ring-1 ring-lavender-100 hover:ring-lavender-300"
      }`}
    >
      <Doodle kind={doodle} className="h-9 w-9" />
      {label}
    </button>
  );
}
