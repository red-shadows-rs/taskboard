import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

import { getUserByEmail, getUserById } from "@/app/api/shared/databaseShared";

import type { User } from "@/types";

const SESSION_COOKIE = "taskboard_session";
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET environment variable is required. Set a strong random secret in .env.local",
  );
}

function signData(data: string): string {
  return createHmac("sha256", SESSION_SECRET).update(data).digest("hex");
}

export function signSession(sessionData: string): string {
  const signature = signData(sessionData);
  return `${signature}.${sessionData}`;
}

export function verifySession(signedValue: string): string | null {
  const firstDot = signedValue.indexOf(".");
  if (firstDot === -1) return null;

  const signature = signedValue.slice(0, firstDot);
  const sessionData = signedValue.slice(firstDot + 1);

  const expectedSignature = signData(sessionData);

  try {
    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expectedSignature, "hex");
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;
    return sessionData;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function login(
  email: string,
  password: string,
): Promise<User | null> {
  const user = await getUserByEmail(email.toLowerCase());

  if (!user) return null;

  const isValidPassword = await verifyPassword(password, user.password);

  if (!isValidPassword) return null;

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword as User;
}

export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE);

    if (!session) return null;

    const sessionData = verifySession(session.value);
    if (!sessionData) return null;

    const parsed = JSON.parse(sessionData);

    if (!parsed || !parsed.id) return null;

    const user = await getUserById(parsed.id);

    if (!user) return null;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  } catch (_error) {
    return null;
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireAuth(): Promise<User> {
  const user = await getSession();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function requireLeaderOrClient(): Promise<User> {
  const user = await requireAuth();

  if (user.role !== "leader" && user.role !== "client") {
    throw new Error("Forbidden: Leader or Client access required");
  }

  return user;
}
