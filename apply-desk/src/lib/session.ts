import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LOGIN_EMAIL } from "./profile";

export const SESSION_COOKIE = "apply_desk";
const COOKIE = SESSION_COOKIE;

export function hasSession(value: string | undefined) {
  return value === LOGIN_EMAIL;
}

export async function isLoggedIn() {
  const jar = await cookies();
  return jar.get(COOKIE)?.value === LOGIN_EMAIL;
}

export async function setSession() {
  const jar = await cookies();
  jar.set(COOKIE, LOGIN_EMAIL, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function requireUser() {
  if (!(await isLoggedIn())) {
    redirect("/login");
  }
}
