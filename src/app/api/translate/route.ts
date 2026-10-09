import { NextResponse } from "next/server";

import { requireAuth } from "@/app/api/auth/utilsAuth";
import { checkRateLimit } from "@/app/api/shared/rateLimitShared";
import {
  MAX_INPUT_CHARS,
  MAX_SEGMENTS,
  translateMany,
  translateText,
  TranslationUnavailableError,
} from "@/lib/translationServer";

import type { Language } from "@/types";
import type { NextRequest } from "next/server";

function isLanguage(value: unknown): value is Language {
  return value === "ar" || value === "en";
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const limit = checkRateLimit(request, "translate", 60, 60_000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = (await request.json()) as {
      from?: unknown;
      to?: unknown;
      text?: unknown;
      segments?: unknown;
    };

    const { from, to } = body;

    if (!isLanguage(from) || !isLanguage(to) || from === to) {
      return NextResponse.json(
        { error: "Invalid source or target language" },
        { status: 400 },
      );
    }

    if (Array.isArray(body.segments)) {
      const segments = body.segments;
      if (
        segments.length === 0 ||
        segments.length > MAX_SEGMENTS ||
        segments.some((segment) => typeof segment !== "string")
      ) {
        return NextResponse.json(
          { error: "Invalid segments" },
          { status: 400 },
        );
      }

      const translations = await translateMany(segments as string[], from, to);
      return NextResponse.json({ translations });
    }

    if (typeof body.text === "string") {
      if (body.text.length > MAX_INPUT_CHARS) {
        return NextResponse.json(
          { error: "Input is too long" },
          { status: 400 },
        );
      }

      const translation = await translateText(body.text, from, to);
      return NextResponse.json({ translations: [translation] });
    }

    return NextResponse.json(
      { error: "Provide 'text' or 'segments'" },
      { status: 400 },
    );
  } catch (error) {
    if (error instanceof TranslationUnavailableError) {
      return NextResponse.json(
        {
          error: "Translation is unavailable",
          code: "translation_unavailable",
        },
        { status: 503 },
      );
    }

    const status =
      error instanceof Error && error.message === "Unauthorized"
        ? 401
        : error instanceof Error && error.message.includes("Forbidden")
          ? 403
          : 500;
    return NextResponse.json({ error: "Internal server error" }, { status });
  }
}
