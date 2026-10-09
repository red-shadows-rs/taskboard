import { resolvePlan, stripHtmlToText } from "@/utils/textScriptUtil";

import type { Language } from "@/types";

export interface LocalizedText {
  en: string;
  ar: string;
}

const SKIPPED_TAGS = new Set(["script", "style", "code", "pre"]);

async function requestTranslation(
  segments: string[],
  from: Language,
  to: Language,
): Promise<string[] | null> {
  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ segments, from, to }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { translations?: unknown };
    if (!Array.isArray(data.translations)) return null;

    return data.translations as string[];
  } catch {
    return null;
  }
}

function asIs(value: string): LocalizedText {
  return { en: value, ar: value };
}

function merge(
  source: Language,
  typed: string,
  translated: string,
): LocalizedText {
  return source === "ar"
    ? { ar: typed, en: translated }
    : { en: typed, ar: translated };
}

export async function buildLocalizedPair(
  value: string,
  uiLanguage: Language,
): Promise<LocalizedText> {
  const plan = resolvePlan(value, uiLanguage);
  if (!plan.translate) return asIs(value);

  const translations = await requestTranslation([value], plan.from, plan.to);
  if (!translations || translations.length !== 1 || !translations[0]) {
    return asIs(value);
  }

  return merge(plan.from, value, translations[0]);
}

function isInsideSkippedTag(node: Text, root: Element): boolean {
  let element = node.parentElement;
  while (element && element !== root) {
    if (SKIPPED_TAGS.has(element.tagName.toLowerCase())) return true;
    element = element.parentElement;
  }
  return false;
}

function collectTextNodes(root: Element): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) {
        return NodeFilter.FILTER_REJECT;
      }
      if (isInsideSkippedTag(node as Text, root)) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }
  return nodes;
}

export async function buildLocalizedHtmlPair(
  html: string,
  uiLanguage: Language,
): Promise<LocalizedText> {
  const plan = resolvePlan(stripHtmlToText(html), uiLanguage);
  if (!plan.translate) return asIs(html);

  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return asIs(html);
  }

  const parsed = new DOMParser().parseFromString(
    `<body>${html}</body>`,
    "text/html",
  );
  const nodes = collectTextNodes(parsed.body);
  if (nodes.length === 0) return asIs(html);

  const segments = nodes.map((node) => node.nodeValue?.trim() ?? "");
  const translations = await requestTranslation(segments, plan.from, plan.to);
  if (!translations || translations.length !== nodes.length) {
    return asIs(html);
  }

  nodes.forEach((node, index) => {
    const original = node.nodeValue ?? "";
    const leading = original.match(/^\s*/)?.[0] ?? "";
    const trailing = original.match(/\s*$/)?.[0] ?? "";
    node.nodeValue = `${leading}${translations[index]}${trailing}`;
  });

  return merge(plan.from, html, parsed.body.innerHTML);
}
