import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../lib/apiClient";
import { setAccessToken } from "../lib/tokenStore";

export default function KakaoCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        // ✅ refresh_token 쿠키로 accessToken 발급
        const { data } = await apiClient.post<{ accessToken: string }>(
          "/auth/token/refresh"
        );

        setAccessToken(data.accessToken);

        // ✅ 로그인 성공 → 메인
        navigate("/main", { replace: true });
      } catch (e) {
        console.error("Kakao refresh failed", e);
        navigate("/login", { replace: true });
      }
    })();
  }, []);

  return <div style={{ padding: 24 }}>카카오 로그인 처리 중...</div>;
}
