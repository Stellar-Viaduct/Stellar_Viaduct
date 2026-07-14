import { useTranslation } from "react-i18next";

export function LoadingFallback() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-viaduct-background flex items-center justify-center text-viaduct-text-secondary">
      {t("app.loadingPage")}
    </div>
  );
}
