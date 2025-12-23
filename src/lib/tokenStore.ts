// src/lib/tokenStore.ts
let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}

// ✅ undefined 들어와도 null 처리되게
export function setAccessToken(t: string | null | undefined) {
  accessToken = t ?? null;
}

export function clearAccessToken() {
  accessToken = null;
}
