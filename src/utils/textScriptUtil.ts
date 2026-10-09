import type { Language } from "@/types";

const ARABIC_LETTER =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
const LATIN_LETTER = /[A-Za-z\u00C0-\u024F]/g;

export type DetectedScript = "ar" | "en" | "mixed";

export interface TranslationPlan {
  translate: boolean;
  from: Language;
  to: Language;
}

function countMatches(text: string, pattern: RegExp): number {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

export function detectScript(text: string): DetectedScript {
  const arabic = countMatches(text, ARABIC_LETTER);
  const latin = countMatches(text, LATIN_LETTER);

  if (arabic === 0 && latin === 0) return "mixed";
  if (arabic > latin) return "ar";
  if (latin > arabic) return "en";
  return "mixed";
}

export function resolvePlan(
  text: string,
  uiLanguage: Language,
): TranslationPlan {
  const script = detectScript(text);

  if (script === "mixed") {
    return { translate: false, from: uiLanguage, to: uiLanguage };
  }

  if (script === uiLanguage) {
    return {
      translate: true,
      from: uiLanguage,
      to: uiLanguage === "ar" ? "en" : "ar",
    };
  }

  return { translate: false, from: uiLanguage, to: uiLanguage };
}

export function stripHtmlToText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
