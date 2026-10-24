import { UnderConstruction } from "../components/ui/States";
import { useAppState } from "../context/AppState";

export function SettingsPage() {
  const { t } = useAppState();
  return (
    <UnderConstruction
      title={t("pages.settings.title")}
      next={`${t("construction.body")} ${t("pages.settings.next")}`}
      backLabel={t("construction.backToday")}
    />
  );
}
