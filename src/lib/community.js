import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || "https://wvmuytmygrhicxcljbzg.supabase.co";
// Public browser key only. Never put a service-role key here.
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_WnFB9Vv2mdDiE9oseGJE8A_rufU6KMr";

export const communityConfigured = Boolean(url && key);
export const community = communityConfigured
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

export async function joinCircle(ageSpace, { consent } = {}) {
  if (!community) throw Error("Community is not configured yet.");
  if (!consent) throw Error("Please agree before joining.");
  if (ageSpace !== "teen" && ageSpace !== "adult") throw Error("Choose an age space.");

  let { data: { user } } = await community.auth.getUser();
  if (!user) {
    const signedIn = await community.auth.signInAnonymously();
    if (signedIn.error) throw signedIn.error;
    user = signedIn.data.user;
  }

  const existing = await community.from("circle_members").select("*").eq("user_id", user.id).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) {
    if (existing.data.age_space !== ageSpace) throw Error("This anonymous account belongs to a different age space.");
    return existing.data;
  }

  const created = await community.from("circle_members").insert({ user_id: user.id, age_space: ageSpace }).select().single();
  if (created.error) throw created.error;
  return created.data;
}

export async function getMembership() {
  if (!community) return null;
  const { data: { user } } = await community.auth.getUser();
  if (!user) return null;
  const result = await community.from("circle_members").select("*").eq("user_id", user.id).maybeSingle();
  if (result.error) throw result.error;
  return result.data;
}

export async function readPosts() {
  const result = await community.from("circle_posts").select("*").order("created_at", { ascending: false }).limit(100);
  if (result.error) throw result.error;
  return result.data ?? [];
}

export async function submitPost(member, { title, body, topic, parent_id = null }) {
  const result = await community.from("circle_posts").insert({
    author_id: member.user_id,
    age_space: member.age_space,
    title: title || "",
    body,
    topic,
    parent_id,
  }).select().single();
  if (result.error) throw result.error;
  return result.data;
}

export async function reportPost(postId, reason) {
  const { data: { user } } = await community.auth.getUser();
  const result = await community.from("circle_reports").insert({ post_id: postId, reason, reporter_id: user.id });
  if (result.error) throw result.error;
}

export async function deleteMyPosts() {
  const result = await community.rpc("circle_delete_my_posts");
  if (result.error) throw result.error;
}

export async function readReports() {
  const result = await community.from("circle_reports").select("*").order("created_at", { ascending: false }).limit(100);
  if (result.error) throw result.error;
  return result.data ?? [];
}

export async function resolveReport(id) {
  const result = await community.from("circle_reports").update({ status: "resolved" }).eq("id", id);
  if (result.error) throw result.error;
}

export async function getStaff(userId) {
  const result = await community.from("circle_staff").select("*").eq("user_id", userId).maybeSingle();
  if (result.error) throw result.error;
  return result.data;
}

export async function moderatePost(post, changes) {
  const allowed = {};
  if (changes.status) allowed.status = changes.status;
  if (changes.body) allowed.body = changes.body;
  if (changes.checked_by_doctor != null) allowed.checked_by_doctor = changes.checked_by_doctor;
  const result = await community.from("circle_posts").update(allowed).eq("id", post.id);
  if (result.error) throw result.error;
}
