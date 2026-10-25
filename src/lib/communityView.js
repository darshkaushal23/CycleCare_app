export const TOPICS = ["Periods", "Cramps", "PCOS", "First Period", "Hygiene", "Feelings"];

export const SAMPLE_DISCUSSIONS = [
  { title: "Is it common for periods to change dates?", body: "Sometimes a cycle changes by a few days. What can make that happen?", topic: "Periods" },
  { title: "How can I prepare for my first period?", body: "What should I keep in my school bag?", topic: "First Period" },
  { title: "What helps with everyday cramps?", body: "Are there simple comfort ideas, like rest or a warm cloth?", topic: "Cramps" },
  { title: "What does PCOS mean?", body: "How can I learn about it without deciding I have it?", topic: "PCOS" },
  { title: "How often should pads be changed?", body: "I want to learn clean habits for school days.", topic: "Hygiene" },
  { title: "Feeling tired before a period", body: "Does anyone else feel sleepy a few days before?", topic: "Feelings" },
  { title: "How do I track a period?", body: "Which dates should I save in the app?", topic: "Periods" },
  { title: "Is a warm cloth useful?", body: "What are safe ways to feel more comfortable?", topic: "Cramps" },
  { title: "Talking to a trusted adult", body: "How do I start that conversation?", topic: "First Period" },
  { title: "How do I prepare for a doctor visit?", body: "What notes might help me explain my dates?", topic: "PCOS" },
];

export function postsForView(items, { memberId, memberAge = null, staff = false, moderation = false, topic = "All", query = "" } = {}) {
  const needle = query.trim().toLowerCase();
  return (items ?? []).filter((post) => {
    if (memberAge && post.age_space && post.age_space !== memberAge && !(staff && moderation)) return false;
    const mine = post.author_id === memberId;
    const visible = staff && moderation ? post.status === "pending" || post.status === "approved" : post.status === "approved" || mine;
    if (!visible) return false;
    if (topic && topic !== "All" && post.topic !== topic) return false;
    if (!needle) return true;
    return [post.title, post.body, post.author_alias, post.topic].join(" ").toLowerCase().includes(needle);
  });
}
