import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "node:fs";

const url = "https://wvmuytmygrhicxcljbzg.supabase.co";
const key = "sb_publishable_WnFB9Vv2mdDiE9oseGJE8A_rufU6KMr";
const sessionFile = new URL("./.community-sessions.json", import.meta.url);

function client() {
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function signIn() {
  const supabase = client();
  const signed = await supabase.auth.signInAnonymously();
  if (signed.error) throw signed.error;
  return supabase;
}

async function join(supabase, age) {
  const { data: { user } } = await supabase.auth.getUser();
  const created = await supabase.from("circle_members").insert({ user_id: user.id, age_space: age, alias: "Not Allowed" }).select().single();
  if (created.error) throw created.error;
  return { user, member: created.data };
}

async function setup() {
  const teen = await signIn();
  const adult = await signIn();
  const moderator = await signIn();
  const teenJoin = await join(teen, "teen");
  const adultJoin = await join(adult, "adult");
  const modJoin = await join(moderator, "adult");
  const post = await teen.from("circle_posts").insert({
    author_id: teenJoin.user.id,
    age_space: "teen",
    topic: "Periods",
    title: "Test question email me@example.com",
    body: "Please call 9876543210 about this fictional test.",
  }).select().single();
  if (post.error) throw post.error;
  const adultRead = await adult.from("circle_posts").select("id,age_space").eq("id", post.data.id);
  const selfApprove = await teen.from("circle_posts").update({ status: "approved" }).eq("id", post.data.id);
  const grantStaff = await teen.from("circle_staff").insert({ user_id: teenJoin.user.id, is_doctor: true });
  const report = {
    teenId: teenJoin.user.id,
    adultId: adultJoin.user.id,
    moderatorId: modJoin.user.id,
    postId: post.data.id,
    alias: teenJoin.member.alias,
    redactedTitle: post.data.title,
    redactedBody: post.data.body,
    adultSawTeenPost: (adultRead.data ?? []).length,
    selfApproveError: selfApprove.error?.message ?? null,
    grantStaffError: grantStaff.error?.message ?? null,
    sessions: {
      teen: (await teen.auth.getSession()).data.session,
      adult: (await adult.auth.getSession()).data.session,
      moderator: (await moderator.auth.getSession()).data.session,
    },
  };
  writeFileSync(sessionFile, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ...report, sessions: "saved" }, null, 2));
}

async function finish() {
  const saved = JSON.parse(readFileSync(sessionFile, "utf8"));
  const teen = client();
  const adult = client();
  const moderator = client();
  await teen.auth.setSession(saved.sessions.teen);
  await adult.auth.setSession(saved.sessions.adult);
  await moderator.auth.setSession(saved.sessions.moderator);

  const approved = await moderator.from("circle_posts").update({ status: "approved" }).eq("id", saved.postId).select().single();
  const teenRead = await teen.from("circle_posts").select("id,status,title").eq("id", saved.postId).maybeSingle();
  const reply = await adult.from("circle_posts").insert({
    author_id: saved.adultId,
    age_space: "adult",
    topic: "Periods",
    title: "",
    body: "This adult reply must not land in the teen space.",
    parent_id: saved.postId,
  });
  const teenReply = await teen.from("circle_posts").insert({
    author_id: saved.teenId,
    age_space: "teen",
    topic: "Periods",
    title: "",
    body: "A fictional reply that should stay when the question is withdrawn.",
    parent_id: saved.postId,
  }).select().single();
  const replyApproved = teenReply.data
    ? await moderator.from("circle_posts").update({ status: "approved" }).eq("id", teenReply.data.id)
    : null;
  const selfDoctor = await moderator.from("circle_posts").update({ checked_by_doctor: true }).eq("id", saved.postId);
  const report = await teen.from("circle_reports").insert({ post_id: saved.postId, reporter_id: saved.teenId, reason: "Other", status: "resolved" });
  const openReport = await teen.from("circle_reports").insert({ post_id: saved.postId, reporter_id: saved.teenId, reason: "Other" }).select().single();
  const strangerReportUpdate = await adult.from("circle_reports").update({ status: "resolved" }).eq("id", openReport.data?.id ?? "00000000-0000-0000-0000-000000000000");
  const staffResolve = openReport.data ? await moderator.from("circle_reports").update({ status: "resolved" }).eq("id", openReport.data.id) : null;
  const deleted = await teen.rpc("circle_delete_my_posts");
  const replyLeft = teenReply.data ? await moderator.from("circle_posts").select("id,author_id,body").eq("id", teenReply.data.id).maybeSingle() : null;
  const questionLeft = await moderator.from("circle_posts").select("id,status,title").eq("id", saved.postId).maybeSingle();

  console.log(JSON.stringify({
    approveError: approved.error?.message ?? null,
    approvedStatus: approved.data?.status ?? teenRead.data?.status ?? null,
    crossAgeReplyError: reply.error?.message ?? null,
    teenReplyError: teenReply.error?.message ?? null,
    replyApproveError: replyApproved?.error?.message ?? null,
    fakeDoctorError: selfDoctor.error?.message ?? null,
    forgedReportError: report.error?.message ?? null,
    strangerReportError: strangerReportUpdate.error?.message ?? null,
    staffResolveError: staffResolve?.error?.message ?? null,
    deleteError: deleted.error?.message ?? null,
    replyStillThere: Boolean(replyLeft?.data),
    questionStatus: questionLeft.data?.status ?? null,
  }, null, 2));
}

const mode = process.argv[2] || "setup";
if (mode === "finish") await finish();
else await setup();
