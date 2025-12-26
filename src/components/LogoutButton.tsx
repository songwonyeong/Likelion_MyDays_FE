import { useNavigate } from "react-router-dom";
import { logout } from "../api/auth";
import { clearAccessToken } from "../lib/tokenStore";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // refresh 쿠키 제거
    } catch {
      // 실패해도 로컬 토큰은 제거
    } finally {
      clearAccessToken();
      navigate("/", { replace: true });
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded bg-red-500 text-white text-sm hover:bg-red-600"
    >
      로그아웃
    </button>
  );
}
