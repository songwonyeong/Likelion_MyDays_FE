// src/lib/apiClient.ts
import axios from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "./tokenStore";

type RefreshResponse = {
  accessToken?: string;
  access_token?: string; // 백엔드 응답 호환
};

const API_BASE = import.meta.env.VITE_API_BASE;

// (선택) 배포에서 env 제대로 먹는지 확인용 — 확인 끝나면 지워도 됨
console.log("[VITE_API_BASE]", API_BASE);

export const apiClient = axios.create({
  baseURL: API_BASE, // ✅ 이게 없어서 Vercel로 POST가 날아가던 거임
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ✅ 요청마다 accessToken 붙이기
apiClient.interceptors.request.use((config) => {
  const t = getAccessToken();
  if (t) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${t}`;
  }
  return config;
});

// ✅ 401이면 refresh 후 원요청 재시도
let isRefreshing = false;
let waitQueue: Array<(token: string | null) => void> = [];

function pushQueue(cb: (token: string | null) => void) {
  waitQueue.push(cb);
}
function flushQueue(token: string | null) {
  waitQueue.forEach((cb) => cb(token));
  waitQueue = [];
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const original = error?.config;

    const isRefreshCall = original?.url?.includes("/auth/token/refresh");
    if (status !== 401 || original?._retry || isRefreshCall) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pushQueue((token) => {
          if (!token) return reject(error);
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(original));
        });
      });
    }

    isRefreshing = true;

    try {
      const { data } = await apiClient.post<RefreshResponse>("/auth/token/refresh");
      const newToken = data.accessToken ?? data.access_token ?? null;

      setAccessToken(newToken);
      flushQueue(newToken);

      if (!newToken) {
        clearAccessToken();
        return Promise.reject(new Error("토큰 재발급 실패(응답에 토큰 없음)"));
      }

      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    } catch (e) {
      clearAccessToken();
      flushQueue(null);
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);
