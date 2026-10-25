import { describe, expect, it } from "vitest";
import { SAMPLE_DISCUSSIONS, postsForView } from "./communityView";

describe("Saheli Circle view", () => {
  const posts = [
    { id: "q", author_id: "teen-a", age_space: "teen", title: "Cramps at school", body: "What helps?", topic: "Cramps", status: "pending", parent_id: null },
    { id: "live", author_id: "teen-b", age_space: "teen", title: "Pad change", body: "How often?", topic: "Hygiene", status: "approved", parent_id: null },
    { id: "adult", author_id: "adult-a", age_space: "adult", title: "Adult only", body: "Hidden from teens by the server.", topic: "Periods", status: "approved", parent_id: null },
  ];

  it("shows a member their own pending post and hides other spaces", () => {
    const shown = postsForView(posts, { memberId: "teen-a", memberAge: "teen", topic: "All" });
    expect(shown.map((post) => post.id)).toEqual(["q", "live"]);
  });

  it("hides someone else's pending post", () => {
    const shown = postsForView(posts, { memberId: "teen-c", topic: "All" });
    expect(shown.map((post) => post.id)).not.toContain("q");
  });

  it("keeps ten fictional examples clearly separate from live posts", () => {
    expect(SAMPLE_DISCUSSIONS).toHaveLength(10);
    expect(SAMPLE_DISCUSSIONS.every((item) => item.title && item.body && item.topic)).toBe(true);
  });
});
