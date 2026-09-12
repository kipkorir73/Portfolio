import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LOGIN_EMAIL } from "./profile";

const COOKIE = "apply_desk";

export async function isLoggedIn() {
  const jar = await cookies();
  return jar.get(COOKIE)?.value === LOGIN_EMAIL;
}

export async function setSession() {
  const jar = await cookies();
  jar.set(COOKIE, LOGIN_EMAIL, {
    httpOnly: true,
    sameSite: "lax",
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
