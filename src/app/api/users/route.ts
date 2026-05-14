import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import {
  hashPassword,
  requireAuth,
  requireLeaderOrClient,
} from "@/app/api/auth/utilsAuth";
import { getUsers, createUser } from "@/app/api/shared/databaseShared";
import { userCreateSchema } from "@/app/api/shared/validatorsShared";

import type { NextRequest } from "next/server";

export async function GET() {
  try {
    await requireAuth();
    const users = await getUsers();

    const usersWithoutPasswords = users.map(
      ({ password: _password, ...user }) => user,
    );
    return NextResponse.json({ users: usersWithoutPasswords });
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

export async function POST(request: NextRequest) {
  try {
    await requireLeaderOrClient();
    const body = await request.json();

    const result = userCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 },
      );
    }

    const { name, email, password, role } = result.data;
    const hashedPassword = await hashPassword(password);

    const user = await createUser({
      id: uuidv4(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });

    const { password: _password, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
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
