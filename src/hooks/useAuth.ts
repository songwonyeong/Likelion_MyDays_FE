// src/hooks/useAuth.ts
import { useEffect, useState } from "react";
import { apiClient } from "../lib/apiClient";
import { getAccessToken, setAccessToken, clearAccessToken } from "../lib/tokenStore";

type RefreshResponse = {
  accessToken?: string;
  access_token?: string; // ✅ 네 백엔드 응답
};

export function useAuth(): boolean | null {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      // 1) 메모리에 토큰 있으면 통과
      const token = getAccessToken();
      if (token) {
        if (alive) setAuthed(true);
        return;
      }

      // 2) refresh 쿠키로 access 재발급
      try {
        const { data } = await apiClient.post<RefreshResponse>("/auth/token/refresh");

        const newToken = data.accessToken ?? data.access_token ?? null;
        setAccessToken(newToken);

        if (alive) setAuthed(!!newToken); // 토큰 없으면 false
      } catch {
        clearAccessToken();
        if (alive) setAuthed(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return authed;
}
