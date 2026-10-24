import { useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { Chip } from "../components/ui/Input";
import { useAppState } from "../context/AppState";
import { SAHELI_FAQS, searchFaqs } from "../lib/saheliFaqs";

const SUGGESTED = ["late period", "heavy bleeding", "PCOS", "cramps", "first period", "spotting"];
const SUGGESTED_HI = ["लेट पीरियड", "भारी रक्तस्राव", "PCOS", "ऐंठन", "पहली पीरियड", "स्पॉटिंग"];

export function SaheliPage() {
  const { lang, t } = useAppState();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(null);
  const result = useMemo(() => searchFaqs(query, lang), [query, lang]);
  const list = query.trim() ? result.matches : SAHELI_FAQS.slice(0, 8);
  const suggestions = lang === "hi" ? SUGGESTED_HI : SUGGESTED;

  return (
    <div className="page-enter mx-auto max-w-3xl space-y-4">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lavender-500">{t("nav.saheli")}</p>
        <h1 className="mt-1 font-display text-3xl">{lang === "hi" ? "सहेली से पूछें" : "Ask Saheli"}</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">{t("saheli.intro")}</p>
      </header>

      <label className="block">
        <span className="sr-only">{t("saheli.search")}</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("saheli.placeholder")}
          className="h-12 w-full rounded-2xl bg-white px-4 text-sm ring-1 ring-lavender-200"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <Chip key={item} selected={query === item} onClick={() => setQuery(item)}>
            {item}
          </Chip>
        ))}
      </div>

      {result.fallback ? (
        <Card>
          <p className="text-sm leading-relaxed text-ink-700">{t("saheli.fallback")}</p>
        </Card>
      ) : null}

      {list.map((faq) => {
        const copy = faq[lang] ?? faq.en;
        const open = activeId === faq.id;
        return (
          <Card key={faq.id}>
            <button type="button" className="w-full text-left" onClick={() => setActiveId(open ? null : faq.id)}>
              <h2 className="font-display text-lg">{copy.q}</h2>
            </button>
            {open ? (
              <div className="mt-3 space-y-2 text-sm leading-relaxed text-ink-700">
                <p>{copy.a}</p>
                {faq.tags.some((tag) =>
                  ["heavy", "pain", "doctor", "missed", "soak", "spotting", "between", "clot", "anaemia"].includes(tag),
                ) ? (
                  <p className="text-sm font-medium text-rose-700">{t("today.seeDoctor")}</p>
                ) : null}
                <ul className="text-xs text-lavender-700">
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
