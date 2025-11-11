// src/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: true, // refresh 쿠키 전송 필수
});

let accessToken: string | null = null;
export const setAccessToken = (t: string | null) => { accessToken = t; };

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshing = false;
let waiters: Array<(t: string | null) => void> = [];

async function refreshOnce(): Promise<string | null> {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE}/auth/token/refresh`,
      {},
      { withCredentials: true }
    );
    const newAccess = res.data?.access ?? null;
    setAccessToken(newAccess);
    return newAccess;
  } catch {
    setAccessToken(null);
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config;
    if (err?.response?.status === 401 && !original._retry) {
      if (!refreshing) {
        refreshing = true;
        const tok = await refreshOnce();
        refreshing = false;
        waiters.forEach(fn => fn(tok));
        waiters = [];
      }
      return new Promise((resolve, reject) => {
        waiters.push((tok) => {
          if (tok) {
            original._retry = true;
            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${tok}`;
            resolve(axios(original));
          } else {
            reject(err);
          }
        });
      });
    }
    return Promise.reject(err);
  }
);

export async function logout() {
  try { await api.post("/auth/token/logout"); } finally { setAccessToken(null); }
}
