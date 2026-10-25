import { Doodle } from "../art/Doodles";

const KIND_MAP = {
  cycle: "calendar",
  wave: "wave",
  pain: "heat",
  care: "pad",
  first: "flower",
  alert: "alert",
  wait: "moon",
  info: "pcos",
  pcos: "pcos",
  pad: "pad",
  hygiene: "pad",
};

export function LessonArt({ kind }) {
  return <Doodle kind={KIND_MAP[kind] ?? "flower"} className="h-16 w-16 shrink-0" />;
}
