import { env, pipeline } from "@huggingface/transformers";

import {
  resolveModelsDir,
  TRANSLATION_DTYPE,
  TRANSLATION_FLORES_CODES,
  TRANSLATION_MODEL_ID,
} from "@/lib/translationConfig";

import type { Language } from "@/types";

interface TranslationOutput {
  translation_text: string;
}

interface TranslationOptions {
  src_lang?: string;
  tgt_lang?: string;
  max_new_tokens?: number;
}

type Translator = (
  text: string,
  options?: TranslationOptions,
) => Promise<TranslationOutput | TranslationOutput[]>;

export const MAX_INPUT_CHARS = 8000;
export const MAX_SEGMENTS = 200;

export class TranslationUnavailableError extends Error {
  constructor(message = "Translation is unavailable") {
    super(message);
    this.name = "TranslationUnavailableError";
  }
}

export function isTranslationEnabled(): boolean {
  return process.env.TRANSLATION_ENABLED !== "false";
}

let configured = false;

function ensureConfigured(): void {
  if (configured) return;

  env.cacheDir = resolveModelsDir();
  env.allowRemoteModels = false;
  env.allowLocalModels = true;
  configured = true;
}

const globalForTranslator = globalThis as unknown as {
  __taskboardTranslator?: Promise<Translator>;
};

let queue: Promise<unknown> = Promise.resolve();

function runExclusive<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task, task);
  queue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function getTranslator(): Promise<Translator> {
  ensureConfigured();

  if (!globalForTranslator.__taskboardTranslator) {
    const promise = (
      pipeline("translation", TRANSLATION_MODEL_ID, {
        dtype: TRANSLATION_DTYPE,
      }) as unknown as Promise<Translator>
    ).catch((error: unknown) => {
      delete globalForTranslator.__taskboardTranslator;
      throw error instanceof TranslationUnavailableError
        ? error
        : new TranslationUnavailableError(
            `Failed to load translation model: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
    });

    globalForTranslator.__taskboardTranslator = promise;
  }

  return globalForTranslator.__taskboardTranslator;
}

async function translateChunk(
  translator: Translator,
  text: string,
  from: Language,
  to: Language,
): Promise<string> {
  const output = await translator(text, {
    src_lang: TRANSLATION_FLORES_CODES[from],
    tgt_lang: TRANSLATION_FLORES_CODES[to],
    max_new_tokens: 512,
  });
  const first = Array.isArray(output) ? output[0] : output;
  return first?.translation_text?.trim() ?? "";
}

function assertEnabled(): void {
  if (!isTranslationEnabled()) {
    throw new TranslationUnavailableError("Translation is disabled");
  }
}

export async function translateText(
  text: string,
  from: Language,
  to: Language,
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return "";

  assertEnabled();

  if (trimmed.length > MAX_INPUT_CHARS) {
    throw new TranslationUnavailableError("Input is too long");
  }

  return runExclusive(async () => {
    const translator = await getTranslator();
    return translateChunk(translator, trimmed, from, to);
  });
}

export async function translateMany(
  segments: string[],
  from: Language,
  to: Language,
): Promise<string[]> {
  if (segments.length === 0) return [];

  assertEnabled();

  if (segments.length > MAX_SEGMENTS) {
    throw new TranslationUnavailableError("Too many segments");
  }

  const totalChars = segments.reduce((sum, segment) => sum + segment.length, 0);
  if (totalChars > MAX_INPUT_CHARS) {
    throw new TranslationUnavailableError("Input is too long");
  }

  return runExclusive(async () => {
    const translator = await getTranslator();
    const results: string[] = [];
    for (const segment of segments) {
      if (!segment.trim()) {
        results.push(segment);
        continue;
      }
      results.push(await translateChunk(translator, segment, from, to));
    }
    return results;
  });
}
