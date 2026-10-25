import { useEffect, useState } from "react";
import { Flag, MessageCircle, Send, ShieldCheck, Trash2 } from "lucide-react";
import {
  communityConfigured,
  deleteMyPosts,
  getMembership,
  getStaff,
  joinCircle,
  moderatePost,
  readPosts,
  readReports,
  reportPost,
  resolveReport,
  submitPost,
} from "../lib/community";
import { SAMPLE_DISCUSSIONS, TOPICS, postsForView } from "../lib/communityView";

const REPORT_REASONS = ["Bullying", "Personal information", "Harmful advice", "Other"];

function CircleMark() {
  return (
    <svg className="h-14 w-14 shrink-0" viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="18" fill="#F6C1CF" />
      <circle cx="32" cy="28" r="7" fill="#FFF8F2" />
      <circle cx="22" cy="34" r="7" fill="#E9DDF7" />
      <circle cx="42" cy="34" r="7" fill="#E9DDF7" />
      <circle cx="32" cy="32" r="4" fill="#563F68" />
    </svg>
  );
}

export function CommunityPage() {
  const [member, setMember] = useState(null);
  const [staff, setStaff] = useState(null);
  const [items, setItems] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [topic, setTopic] = useState("All");
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [reporting, setReporting] = useState(null);
  const [moderation, setModeration] = useState(false);
  const [consent, setConsent] = useState(false);

  async function refresh() {
    if (!communityConfigured) return;
    try {
      const nextMember = await getMembership();
      setMember(nextMember);
      if (!nextMember) {
        setStaff(null);
        setItems([]);
        return;
      }
      const nextStaff = await getStaff(nextMember.user_id);
      setStaff(nextStaff);
      setItems(await readPosts());
      setReports(nextStaff ? await readReports() : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function join(space) {
    setError("");
    setLoading(true);
    try {
      await joinCircle(space, { consent });
      await refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function post(event) {
    event.preventDefault();
    setError("");
    try {
      await submitPost(member, {
        title: replyTo ? "" : title.trim(),
        body: body.trim(),
        topic: replyTo?.topic || (topic === "All" ? "Periods" : topic),
        parent_id: replyTo?.id || null,
      });
      setTitle("");
      setBody("");
      setReplyTo(null);
      setNotice("Sent for review. Only you can see it until a moderator says yes.");
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function action(postItem, changes) {
    try {
      await moderatePost(postItem, changes);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  const shown = postsForView(items, { memberId: member?.user_id, memberAge: member?.age_space, staff: Boolean(staff), moderation, topic, query });
  const questions = shown.filter((post) => !post.parent_id);

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-8">
      <header className="flex items-start gap-3 rounded-3xl bg-gradient-to-r from-rose-100 to-lavender-100 p-5">
        <CircleMark />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lavender-700">Community</p>
          <h1 className="font-display text-3xl text-ink-900">Saheli Circle</h1>
          <p className="mt-1 text-sm text-ink-700">Ask questions. Be kind. No private messages.</p>
        </div>
      </header>

      <p className="rounded-2xl bg-white p-4 text-sm text-ink-700 ring-1 ring-rose-100">
        Do not share your name, phone, school, or address. This is not a doctor. Your period logs stay on this phone.
      </p>

      {!communityConfigured ? <p className="rounded-2xl bg-white p-4 text-sm">Community setup is still missing.</p> : null}
      {error ? <p role="alert" className="rounded-xl bg-rose-100 p-3 text-sm text-rose-800">{error}</p> : null}
      {notice ? <p role="status" className="rounded-xl bg-lavender-100 p-3 text-sm">{notice}</p> : null}

      {communityConfigured && !member && !loading ? (
        <section className="space-y-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-lavender-100">
          <h2 className="font-display text-xl">Join with a nickname</h2>
          <p className="text-sm text-ink-700">You get a name like Saheli 4821. We do not check your age. You choose a space.</p>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1" />
            I agree that my question can be shown in my age space after a moderator checks it.
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={!consent} className="rounded-2xl bg-rose-200 px-4 py-3 text-sm font-medium disabled:opacity-50" onClick={() => join("teen")}>Under 18</button>
            <button type="button" disabled={!consent} className="rounded-2xl bg-lavender-200 px-4 py-3 text-sm font-medium disabled:opacity-50" onClick={() => join("adult")}>18 or older</button>
          </div>
        </section>
      ) : null}

      {member ? (
        <>
          <p className="rounded-2xl bg-white p-4 text-sm ring-1 ring-lavender-100">
            You are <strong>{member.alias}</strong> in the {member.age_space === "teen" ? "under-18" : "adult"} space. New posts wait for approval.
          </p>

          {staff ? (
            <button type="button" className="rounded-2xl bg-lavender-200 px-4 py-3 text-sm font-medium" onClick={() => setModeration((value) => !value)}>
              {moderation ? "Back to questions" : "Review posts"}
            </button>
          ) : null}

          {staff && moderation ? (
            <section className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-lavender-100">
              <h2 className="font-display text-lg">Reports</h2>
              {reports.filter((report) => report.status === "open").map((report) => (
                <div key={report.id} className="rounded-xl bg-cream-50 p-3 text-sm">
                  <p>{report.reason}</p>
                  <button type="button" className="mt-2 rounded-xl bg-lavender-100 px-3 py-2" onClick={async () => {
                    try { await resolveReport(report.id); await refresh(); } catch (err) { setError(err.message); }
                  }}>Mark reviewed</button>
                </div>
              ))}
              {!reports.some((report) => report.status === "open") ? <p className="text-sm">No open reports.</p> : null}
              <h2 className="font-display text-lg">Waiting and published</h2>
              {shown.map((post) => (
                <article key={post.id} className="rounded-xl border border-lavender-100 p-3">
                  <p className="text-xs text-ink-500">{post.parent_id ? "Reply" : "Question"} · {post.age_space} · {post.author_alias} · {post.status}</p>
                  {post.title ? <h3 className="font-semibold">{post.title}</h3> : null}
                  <p className="my-2 whitespace-pre-wrap text-sm">{post.body}</p>
                  {post.checked_by_doctor ? <p className="text-xs font-medium text-plum">Checked by a verified reviewer</p> : null}
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="rounded-xl bg-lavender-200 px-3 py-2 text-sm" onClick={() => action(post, { status: "approved" })}>Approve</button>
                    <button type="button" className="rounded-xl bg-rose-100 px-3 py-2 text-sm" onClick={() => action(post, { status: "rejected" })}>Remove</button>
                    <button type="button" className="rounded-xl bg-cream-100 px-3 py-2 text-sm" onClick={async () => {
                      const next = window.prompt("Edit text", post.body);
                      if (next?.trim()) await action(post, { body: next.trim() });
                    }}>Edit</button>
                    {staff.is_doctor ? (
                      <button type="button" className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-lavender-200" onClick={() => action(post, { checked_by_doctor: true })}>
                        <ShieldCheck className="h-4 w-4" /> Doctor-checked
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </section>
          ) : (
            <form onSubmit={post} className="space-y-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-lavender-100">
              <h2 className="font-display text-xl">{replyTo ? "Reply" : "Ask a question"}</h2>
              {replyTo ? <button type="button" className="text-sm text-plum underline" onClick={() => setReplyTo(null)}>Cancel reply</button> : (
                <input required maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Your question" aria-label="Question title" className="w-full rounded-2xl border border-lavender-200 p-3" />
              )}
              <select value={replyTo?.topic || (topic === "All" ? "Periods" : topic)} disabled={Boolean(replyTo)} onChange={(event) => setTopic(event.target.value)} className="w-full rounded-2xl border border-lavender-200 p-3" aria-label="Topic">
                {TOPICS.map((item) => <option key={item}>{item}</option>)}
              </select>
              <textarea required minLength={4} maxLength={2000} value={body} onChange={(event) => setBody(event.target.value)} placeholder="No names, phone numbers, or addresses." className="min-h-24 w-full rounded-2xl border border-lavender-200 p-3" />
              <button className="inline-flex items-center gap-2 rounded-2xl bg-lavender-700 px-5 py-3 text-sm text-white"><Send className="h-4 w-4" /> Send for review</button>
            </form>
          )}

          <div className="flex flex-wrap gap-2">
            {["All", ...TOPICS].map((item) => (
              <button key={item} type="button" onClick={() => setTopic(item)} className={`rounded-full px-3 py-2 text-sm ${topic === item ? "bg-lavender-700 text-white" : "bg-white text-ink-700"}`}>{item}</button>
            ))}
          </div>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" aria-label="Search discussions" className="w-full rounded-2xl border border-lavender-200 bg-white p-3" />

          <section className="space-y-3">
            {questions.map((post) => (
              <article key={post.id} className="space-y-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-lavender-100">
                <div className="flex justify-between text-xs text-ink-500">
                  <span>{post.author_alias} · {post.topic}</span>
                  <span>{post.status === "pending" ? "Waiting for review" : ""}</span>
                </div>
                <h3 className="font-semibold">{post.title}</h3>
                <p className="whitespace-pre-wrap text-sm">{post.body}</p>
                {post.checked_by_doctor ? <p className="text-xs font-medium text-plum">Checked by a verified reviewer</p> : null}
                <div className="flex flex-wrap gap-3 text-sm">
                  {post.status === "approved" ? (
                    <>
                      <button type="button" className="inline-flex items-center gap-1" onClick={() => { setReplyTo(post); setTopic(post.topic); window.scrollTo({ top: 0, behavior: "smooth" }); }}><MessageCircle className="h-4 w-4" /> Reply</button>
                      <button type="button" className="inline-flex items-center gap-1" onClick={() => setReporting(post.id)}><Flag className="h-4 w-4" /> Report</button>
                    </>
                  ) : null}
                </div>
                {shown.filter((reply) => reply.parent_id === post.id).map((reply) => (
                  <div key={reply.id} className="ml-3 border-l-2 border-lavender-200 pl-3 text-sm">
                    <p className="text-xs text-ink-500">{reply.author_alias} · {reply.status === "pending" ? "Waiting for review" : "Reply"}</p>
                    <p>{reply.body}</p>
                    {reply.checked_by_doctor ? <p className="text-xs font-medium text-plum">Checked by a verified reviewer</p> : null}
                    {reply.status === "approved" ? (
                      <button type="button" className="mt-1 inline-flex items-center gap-1 text-xs" onClick={() => setReporting(reply.id)}><Flag className="h-3 w-3" /> Report</button>
                    ) : null}
                  </div>
                ))}
              </article>
            ))}
          </section>

          {reporting ? (
            <div className="rounded-2xl bg-white p-4 ring-1 ring-rose-100">
              <p className="mb-2 font-semibold">Why report this?</p>
              {REPORT_REASONS.map((reason) => (
                <button key={reason} type="button" className="m-1 rounded-xl bg-rose-100 px-3 py-2 text-sm" onClick={async () => {
                  try { await reportPost(reporting, reason); setNotice("Report sent."); setReporting(null); } catch (err) { setError(err.message); }
                }}>{reason}</button>
              ))}
              <button type="button" className="ml-2 text-sm underline" onClick={() => setReporting(null)}>Cancel</button>
            </div>
          ) : null}

          <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-3 text-sm text-rose-800" onClick={async () => {
            if (!window.confirm("Delete your questions and replies? Other people's replies stay.")) return;
            try { await deleteMyPosts(); await refresh(); setNotice("Your community posts were deleted."); } catch (err) { setError(err.message); }
          }}><Trash2 className="h-4 w-4" /> Delete all my posts</button>
        </>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-display text-lg">Example questions</h2>
        <p className="text-sm text-ink-500">These ten stories are made up. They are not real people.</p>
        {SAMPLE_DISCUSSIONS.filter((item) => topic === "All" || item.topic === topic).filter((item) => !query || `${item.title} ${item.body}`.toLowerCase().includes(query.toLowerCase())).map((item) => (
          <article key={item.title} className="rounded-2xl border border-dashed border-lavender-200 bg-cream-50 p-4">
            <p className="text-xs font-medium text-lavender-700">Example only · {item.topic}</p>
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm">{item.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
