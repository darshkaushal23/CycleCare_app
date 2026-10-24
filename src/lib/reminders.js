import { todayISO } from "./dates";

export const defaultReminders = {
  nextPeriod: false,
  dailyCheckIn: false,
  medicines: false,
  medicineTimes: ["08:00"],
  customEnabled: false,
  customLabel: "",
};

export function reminderBanners({ reminders, logs, prediction, settings, today = todayISO() }) {
  const discreet = Boolean(settings?.discreetMode);
  const banners = [];
  const hasToday = logs.some((log) => log.date === today);
  if (reminders?.dailyCheckIn && !hasToday) {
    banners.push({
      id: "daily",
      to: `/log?date=${today}`,
      en: discreet ? "Add today’s note when you can." : "Daily check-in: log today when you can.",
      hi: discreet ? "आज का नोट जोड़ें।" : "दैनिक जाँच: आज का लॉग कर सकती हैं।",
    });
  }
  if (reminders?.nextPeriod && prediction?.window && today >= prediction.window.start && today <= prediction.window.end) {
    banners.push({
      id: "period-window",
      to: "/calendar",
      en: discreet ? "A saved reminder is due." : "You are inside the estimated next-period window.",
      hi: discreet ? "एक सहेया रिमाइंडर है।" : "आप अनुमानित अगली पीरियड विंडो में हैं।",
    });
  }
  if (reminders?.medicines) {
    banners.push({
      id: "meds",
      to: "/settings",
      en: discreet ? "A timed reminder is on." : `Medicine reminder is on (${(reminders.medicineTimes ?? []).join(", ") || "time not set"}).`,
      hi: discreet ? "समय वाला रिमाइंडर चालू है।" : `दवाई रिमाइंडर चालू है (${(reminders.medicineTimes ?? []).join(", ") || "समय नहीं"})।`,
    });
  }
  if (reminders?.customEnabled && reminders.customLabel) {
    banners.push({
      id: "custom",
      to: "/reminders",
      en: discreet ? "A custom reminder is on." : reminders.customLabel,
      hi: discreet ? "एक निजी रिमाइंडर चालू है।" : reminders.customLabel,
    });
  }
  return banners;
}

export async function requestNotifyPermission() {
  if (typeof Notification === "undefined") return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export function notifyIfAllowed({ title, body, discreet }) {
  if (typeof Notification === "undefined") return false;
  if (Notification.permission !== "granted") return false;
  try {
    new Notification(discreet ? "Daybook" : title, {
      body: discreet ? "You have a reminder." : body,
      silent: true,
    });
    return true;
  } catch {
    return false;
  }
}
