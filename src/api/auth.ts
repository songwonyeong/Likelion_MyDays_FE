// src/api/auth.ts
import { api } from "../api";

export async function requestEmailCode(email: string): Promise<void> {
  await api.post("/auth/signup/request-email-code", { email });
}

export async function verifyEmailCode(email: string, code: string): Promise<{ emailVerifiedToken: string }> {
  const res = await api.post("/auth/signup/verify-email", { email, code });
  return { emailVerifiedToken: res.data?.emailVerifiedToken };
}

export async function signupEmail(params: { emailVerifiedToken: string; password: string; name: string }): Promise<void> {
  await api.post("/auth/signup", params);
}



