"use client";

import { useLanguage } from "@/contexts/languageContext";

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-8 py-6">
        <div className="flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            {t("common.footer.copyright").replace(
              "{year}",
              currentYear.toString(),
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
