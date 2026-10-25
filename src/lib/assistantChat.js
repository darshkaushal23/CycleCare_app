import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { getFirebaseApp } from "./firebaseApp";

const SYSTEM = [
  "You are the CycleCare assistant.",
  "Use short sentences and everyday words a school student can read.",
  "You are not a doctor. You do not diagnose, name a disease, prescribe medicine, or say someone is pregnant.",
  "If bleeding is very heavy, the person feels faint, pain is severe, or they may be pregnant and bleeding, tell them to get medical help now.",
  "Cycle dates the person shares are estimates from their own saved logs, not a confirmed medical result.",
  "If you are unsure, say so.",
  "Do not invent test results, dates, or a diagnosis.",
].join(" ");

function model() {
  const app = getFirebaseApp();
  if (!app) {
    const error = new Error("missing-config");
    error.code = "missing-config";
    throw error;
  }
  const ai = getAI(app, { backend: new GoogleAIBackend() });
  return getGenerativeModel(ai, {
    model: "gemini-3.5-flash-lite",
    systemInstruction: SYSTEM,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 700,
      topP: 0.9,
    },
  });
}

export function openAssistantChat() {
  const chat = model().startChat({ history: [] });
  return {
    async send({ text, lang, summary, onChunk }) {
      const language = lang === "hi" ? "Reply in simple Hindi." : "Reply in simple English.";
      const context = summary
        ? `The person chose to share this short summary from their device. It is an estimate, not a diagnosis:\n${summary}`
        : "The person did not share their saved logs.";
      const prompt = `${language}\n\n${context}\n\nQuestion: ${text}`;
      const result = await chat.sendMessageStream(prompt);
      let full = "";
      for await (const chunk of result.stream) {
        full += chunk.text();
        onChunk?.(full);
      }
      return full.trim();
    },
  };
}
