// src/lib/apiClient.ts
import axios from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "./tokenStore";

type RefreshResponse = {
  accessToken?: string;
  access_token?: string; // 백엔드가 이 키로 줄 수도 있음
};

const API_BASE = import.meta.env.VITE_API_BASE; // ✅ 반드시 설정되어 있어야 함

export const apiClient = axios.create({
  baseURL: API_BASE,            // ✅ 중요
  withCredentials: true,        // ✅ refresh 쿠키 전송
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

    // refresh 자기 자신이면 재시도 금지
    const isRefreshCall = original?.url?.includes("/auth/token/refresh");
    if (status !== 401 || original?._retry || isRefreshCall) {
      return Promise.reject(error);
    }

    original._retry = true;

    // 이미 refresh 중이면 큐에 대기
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
      // ✅ 반드시 백엔드로 가야 함 (baseURL 덕분에 안전)
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
