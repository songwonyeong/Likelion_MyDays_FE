// src/pages/Home.tsx
import { Link } from "react-router-dom";
import "../styles/auth.css";

export default function Home() {
  const handleKakaoLogin = () => {
    const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      alert("⚠️ 카카오 환경변수가 비어 있습니다.\nVITE_KAKAO_CLIENT_ID, VITE_KAKAO_REDIRECT_URI를 .env.local에 확인하세요.");
      console.error("Kakao ENV missing", { clientId, redirectUri });
      return;
    }

    const kakaoAuthUrl = 
      `https://kauth.kakao.com/oauth/authorize?` +
      `client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=code`;

    console.log("[KAKAO] redirecting to:", kakaoAuthUrl);
    window.location.href = kakaoAuthUrl;
  };

  return (
    <div className="auth__wrap">
      <div className="auth__card">
        <h1 className="auth__title">My Days</h1>
        <p className="auth__subtitle">할 일을 작성하고 매일을 기록하세요.</p>

        <div className="auth__actions">
          <button type="button" className="btn btn--primary" onClick={() => location.href="/login"}>
            로그인
          </button>

          <button type="button" className="btn btn--kakao" onClick={handleKakaoLogin}>
            카카오 로그인
          </button>
        </div>

        <p className="auth__footer">
          회원이 아니신가요? <Link to="/signup" className="auth__link">회원가입</Link>
        </p>
      </div>
    </div>
  );
}
