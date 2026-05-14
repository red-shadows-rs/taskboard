import { NextResponse } from "next/server";

import { login, signSession } from "@/app/api/auth/utilsAuth";
import { loginSchema } from "@/app/api/shared/validatorsShared";
import { checkRateLimit } from "@/app/api/shared/rateLimitShared";

import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(request, "login", 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 },
      );
    }

    const { email, password } = result.data;
    const user = await login(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const sessionData = JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const signedSession = signSession(sessionData);

    const response = NextResponse.json({
      success: true,
      user,
    });

    response.cookies.set("taskboard_session", signedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    const status =
      error instanceof Error && error.message === "Unauthorized"
        ? 401
        : error instanceof Error && error.message.includes("Forbidden")
          ? 403
          : 500;
    return NextResponse.json(
      { error: "Internal server error" },
      { status },
    );
  }
}
