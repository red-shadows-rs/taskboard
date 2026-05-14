import { NextResponse } from "next/server";

import {
  requireAuth,
  hashPassword,
  verifyPassword,
} from "@/app/api/auth/utilsAuth";
import {
  getUserById,
  updateUser,
  deleteUser,
} from "@/app/api/shared/databaseShared";

import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;
    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { password: _password, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    if (currentUser.id !== id && currentUser.role !== "leader") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updates: Record<string, unknown> = { ...body };

    if (body.password) {
      const user = await getUserById(id);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (body.currentPassword) {
        const isValid = await verifyPassword(
          body.currentPassword,
          user.password,
        );
        if (!isValid) {
          return NextResponse.json(
            { error: "Current password is incorrect" },
            { status: 400 },
          );
        }
      }

      updates.password = await hashPassword(body.password);
      delete updates.currentPassword;
    }

    const user = await updateUser(id, updates);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { password: _password2, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await requireAuth();
    const { id } = await params;

    if (currentUser.role !== "leader") {
      return NextResponse.json(
        { error: "Forbidden: Only leaders can delete users" },
        { status: 403 },
      );
    }

    const success = await deleteUser(id);

    if (!success) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
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
