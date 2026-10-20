"use client";

import Image from "next/image";
import { useLanguage } from "@/contexts/languageContext";

export function Footer({ bordered = false }: { bordered?: boolean }) {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-transparent ${bordered ? "border-t" : ""}`}>
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {t("common.footer.copyright").replace(
            "{year}",
            currentYear.toString(),
          )}
        </p>
        <a
          href="https://red-shadows-rs.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Image
            src="/red-shadows-logo.png"
            alt="RED SHADOWS | RS"
            width={512}
            height={353}
            className="h-4 w-auto"
          />
          <span dir="ltr" className="font-medium">
            RED SHADOWS | RS
          </span>
        </a>
      </div>
    </footer>
  );
}
