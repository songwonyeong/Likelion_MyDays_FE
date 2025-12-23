// src/api/auth.ts
import { apiClient } from "../lib/apiClient";
import { setAccessToken, clearAccessToken } from "../lib/tokenStore";

export async function login(body: { email: string; password: string }) {
  const { data } = await apiClient.post<{ accessToken: string }>("/auth/login", body);
  setAccessToken(data.accessToken);
  return data;
}

export async function requestSignupEmailCode(email: string) {
  await apiClient.post("/auth/signup/request-email-code", { email });
}

export async function verifySignupEmailCode(email: string, code: string) {
  const res = await apiClient.post<string>(
    "/auth/signup/verify-email",
    { email, code },
    { responseType: "text" }
  );
  return res.data; // emailVerifiedToken string
}

export async function signupLocal(body: {
  email: string;
  password: string;
  name: string;
  emailVerifiedToken: string;
}) {
  const { data } = await apiClient.post<{ accessToken: string }>("/auth/signup", body);
  return data;
}

export async function logout() {
  await apiClient.post("/auth/token/logout");
  clearAccessToken();
}


// // src/api/auth.ts
// // ✅ MyDays Auth API (local + kakao) - refresh token is HttpOnly cookie

// const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

// // 공통 fetch 헬퍼
// async function apiFetch<T>(
//   path: string,
//   options: RequestInit = {}
// ): Promise<T> {
//   const res = await fetch(`${API_BASE}${path}`, {
//     ...options,
//     headers: {
//       "Content-Type": "application/json",
//       ...(options.headers ?? {}),
//     },
//     // 🔥 refresh 쿠키를 주고받기 위해 필수
//     credentials: "include",
//   });

//   // 에러 메시지 파싱(가능하면)
//   if (!res.ok) {
//     let msg = `HTTP ${res.status}`;
//     try {
//       const data = await res.json();
//       if (data?.message) msg = data.message;
//       else if (typeof data === "string") msg = data;
//     } catch {
//       // ignore
//     }
//     throw new Error(msg);
//   }

//   // 204 같은 경우 대비
//   if (res.status === 204) return undefined as T;

//   return (await res.json()) as T;
// }

// // =========================
// // 1) 로컬 회원가입 (이메일 인증 포함)
// // =========================

// export async function requestSignupEmailCode(email: string) {
//   // POST /auth/signup/request-email-code
//   return apiFetch<{ status?: string; message?: string }>(
//     "/auth/signup/request-email-code",
//     {
//       method: "POST",
//       body: JSON.stringify({ email }),
//     }
//   );
// }

// export async function verifySignupEmailCode(email: string, code: string) {
//   // POST /auth/signup/verify-email
//   return apiFetch<{ emailVerifiedToken: string }>(
//     "/auth/signup/verify-email",
//     {
//       method: "POST",
//       body: JSON.stringify({ email, code }),
//     }
//   );
// }

// export async function signupLocal(params: {
//   email: string;
//   password: string;
//   name: string;
//   emailVerifiedToken: string;
// }) {
//   // POST /auth/signup
//   // 응답: { accessToken: "..." } + refresh_token 쿠키가 HttpOnly로 저장됨
//   return apiFetch<{ accessToken: string }>("/auth/signup", {
//     method: "POST",
//     body: JSON.stringify(params),
//   });
// }

// // =========================
// // 2) 로컬 로그인
// // =========================

// export async function loginLocal(email: string, password: string) {
//   // POST /auth/login
//   // 응답: { accessToken: "..." } + refresh_token 쿠키 저장
//   return apiFetch<{ accessToken: string }>("/auth/login", {
//     method: "POST",
//     body: JSON.stringify({ email, password }),
//   });
// }

// // =========================
// // 3) 공통 토큰 API (로컬/카카오 동일)
// // =========================

// export async function refreshAccessToken() {
//   // POST /auth/token/refresh
//   // refresh는 HttpOnly 쿠키로 서버가 읽음 → 바디 없이 호출 가능
//   return apiFetch<{ accessToken: string }>("/auth/token/refresh", {
//     method: "POST",
//   });
// }

// export async function logout() {
//   // POST /auth/token/logout
//   // 서버에서 refresh 폐기 + 쿠키 제거
//   return apiFetch<{ status?: string; message?: string }>(
//     "/auth/token/logout",
//     { method: "POST" }
//   );
// }

// // =========================
// // 4) 카카오 로그인 시작 URL (프론트에서 이동용)
// // =========================

// // 너의 카카오 인가 URL 생성 로직이 프론트에 있거나,
// // 백엔드가 별도 authorize url을 내려주는 엔드포인트가 있다면 그걸 쓰면 됨.
// // 지금은 "callback은 /kakao/callback"만 서버에 있는 상태라서,
// // 카카오 인증 시작은 보통 프론트에서 kakao authorize url로 이동시킴.

// // 예시(카카오 인가 URL 직접 구성할 때):
// export function getKakaoAuthorizeUrl(params: {
//   clientId: string;
//   redirectUri: string; // 보통 백엔드의 /kakao/callback
//   scope?: string; // optional
// }) {
//   const q = new URLSearchParams({
//     response_type: "code",
//     client_id: params.clientId,
//     redirect_uri: params.redirectUri,
//   });
//   if (params.scope) q.set("scope", params.scope);
//   return `https://kauth.kakao.com/oauth/authorize?${q.toString()}`;
// }
