import translationConfig from "../../translation.config.json";

import type { DataType } from "@huggingface/transformers";
import type { Language } from "@/types";

export const TRANSLATION_MODEL_ID = translationConfig.modelId;
export const TRANSLATION_DTYPE = translationConfig.dtype as DataType;

export const TRANSLATION_FLORES_CODES: Record<Language, string> = {
  ar: translationConfig.flores.ar,
  en: translationConfig.flores.en,
};

export function resolveModelsDir(): string {
  return process.env.TRANSLATION_MODELS_DIR || translationConfig.modelsDir;
}
