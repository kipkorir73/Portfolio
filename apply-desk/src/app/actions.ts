"use server";

import { redirect } from "next/navigation";
import { LOGIN_EMAIL, LOGIN_PASSWORD } from "@/lib/profile";
import { clearSession, requireUser, setSession } from "@/lib/session";
import {
  connectEmail,
  markApplication,
  markRead,
  runDailyScan,
  syncInbox,
} from "@/lib/daily";
import { mutateStore } from "@/lib/store";
import type { ApplicationStatus } from "@/lib/types";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (email !== LOGIN_EMAIL.toLowerCase() || password !== LOGIN_PASSWORD) {
    redirect("/login?error=1");
  }
  await setSession();
  redirect("/");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function scanAction() {
  await requireUser();
  await runDailyScan({ apply: true });
  redirect("/?ran=1");
}

export async function connectEmailAction() {
  await requireUser();
  connectEmail();
  redirect("/inbox?connected=1");
}

export async function syncInboxAction() {
  await requireUser();
  syncInbox();
  redirect("/inbox?synced=1");
}

export async function setStatusAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as ApplicationStatus;
  markApplication(id, status);
  redirect("/applications");
}

export async function readMessageAction(formData: FormData) {
  await requireUser();
  markRead(String(formData.get("id") ?? ""));
  redirect("/inbox");
}

export async function saveSettingsAction(formData: FormData) {
  await requireUser();
  mutateStore((s) => {
    s.settings.autoApplyEmail = formData.get("autoApplyEmail") === "on";
    s.settings.dailyCap = Math.max(1, Number(formData.get("dailyCap") ?? 6));
    s.settings.minScore = Math.max(0, Number(formData.get("minScore") ?? 40));
    s.settings.keywords = String(formData.get("keywords") ?? s.settings.keywords);
  });
  redirect("/settings?saved=1");
}
