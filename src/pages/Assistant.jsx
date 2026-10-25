import { useRef, useState } from "react";
import { Doodle } from "../components/art/Doodles";
import { Button } from "../components/ui/Button";
import { useAppState } from "../context/AppState";
import { openAssistantChat } from "../lib/assistantChat";
import { cycleSummaryForAssistant } from "../lib/assistantContext";
import { assistantConfigured } from "../lib/firebaseApp";

let messageId = 0;

export function AssistantPage() {
  const { t, lang, analysis } = useAppState();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [includeSummary, setIncludeSummary] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const chatRef = useRef(null);
  const listRef = useRef(null);
  const ready = assistantConfigured();
  const suggestions = t("assistant.suggestions");

  function scrollDown() {
    requestAnimationFrame(() => {
      listRef.current?.lastElementChild?.scrollIntoView({ block: "nearest" });
    });
  }

  async function ask(text) {
    const question = text.trim();
    if (!question || busy) return;
    setError("");
    setDraft("");
    const userId = ++messageId;
    const replyId = ++messageId;
    setMessages((current) => [
      ...current,
      { id: userId, role: "user", text: question },
      { id: replyId, role: "assistant", text: "" },
    ]);
    setBusy(true);
    scrollDown();
    try {
      if (!chatRef.current) chatRef.current = openAssistantChat();
      const summary = includeSummary
        ? cycleSummaryForAssistant({ prediction: analysis?.prediction, lang })
        : "";
      const answer = await chatRef.current.send({
        text: question,
        lang,
        summary,
        onChunk: (full) => {
          setMessages((current) => current.map((item) => (item.id === replyId ? { ...item, text: full } : item)));
          scrollDown();
        },
      });
      setMessages((current) =>
        current.map((item) => (item.id === replyId ? { ...item, text: answer || t("assistant.failed") } : item)),
      );
    } catch (caught) {
      const blocked = /blocked|safety|SAFETY/i.test(String(caught?.message || ""));
      setMessages((current) => current.filter((item) => item.id !== replyId || item.text));
      setError(caught?.code === "missing-config" ? t("assistant.empty") : blocked ? t("assistant.blocked") : t("assistant.failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="assistant-page mx-auto max-w-2xl">
      <div className="page-enter space-y-4">
        <header className="flex items-start gap-3">
          <Doodle kind="heart" className="h-14 w-14 shrink-0" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lavender-500">{t("assistant.kicker")}</p>
            <h1 className="mt-1 font-display text-3xl text-ink-900">{t("assistant.title")}</h1>
            <p className="mt-2 text-lg leading-relaxed text-ink-700">{t("assistant.intro")}</p>
          </div>
        </header>

        <p className="rounded-2xl bg-rose-100 px-4 py-3 text-base leading-relaxed text-rose-700" role="note">
          {t("assistant.notDoctor")}
        </p>
        <p className="text-base leading-relaxed text-ink-700">{t("assistant.privacy")}</p>

        {messages.length === 0 ? (
          <div className="grid gap-2">
            {(Array.isArray(suggestions) ? suggestions : []).map((question) => (
              <button
                key={question}
                type="button"
                className="min-h-14 rounded-2xl bg-white px-4 py-3 text-left text-lg leading-snug text-ink-900 ring-1 ring-lavender-100 motion-safe:transition hover:bg-lavender-50"
                onClick={() => ask(question)}
                disabled={!ready || busy}
              >
                {question}
              </button>
            ))}
          </div>
        ) : (
          <ol ref={listRef} className="space-y-3" aria-live="polite">
            {messages.map((message) => (
              <li
                key={message.id}
                className={
                  message.role === "user"
                    ? "ml-10 rounded-2xl bg-plum px-4 py-3 text-lg leading-relaxed text-cream-50"
                    : "mr-6 rounded-2xl bg-white px-4 py-3 text-lg leading-relaxed text-ink-900 ring-1 ring-lavender-100"
                }
              >
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-70">
                  {message.role === "user" ? t("assistant.you") : t("assistant.reply")}
                </p>
                <p className="whitespace-pre-wrap">{message.text || (busy ? t("assistant.thinking") : "")}</p>
              </li>
            ))}
          </ol>
        )}

        {error ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-base text-rose-700" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <form
        className="assistant-dock rounded-2.5xl bg-cream-50/95 p-3 shadow-float ring-1 ring-lavender-100 backdrop-blur"
        onSubmit={(event) => {
          event.preventDefault();
          ask(draft);
        }}
      >
        <label className="flex items-start gap-3 text-base leading-snug text-ink-800">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0 accent-plum"
            checked={includeSummary}
            onChange={(event) => setIncludeSummary(event.target.checked)}
          />
          <span>
            {t("assistant.include")}
            <span className="mt-1 block text-sm text-ink-500">{t("assistant.includeHint")}</span>
          </span>
        </label>
        <div className="mt-3 flex items-end gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">{t("assistant.placeholder")}</span>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={2}
              placeholder={t("assistant.placeholder")}
              className="ui-input min-h-14 text-lg leading-relaxed"
              disabled={!ready || busy}
            />
          </label>
          <Button type="submit" size="lg" disabled={!ready || busy || !draft.trim()}>
            {busy ? t("assistant.thinking") : t("assistant.ask")}
          </Button>
        </div>
        {!ready ? <p className="mt-2 text-base text-ink-700">{t("assistant.empty")}</p> : null}
      </form>
    </div>
  );
}
