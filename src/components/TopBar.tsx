import { useNavigate } from "react-router-dom"
import "./topbar.css"

export default function TopBar({ title }: { title: string }) {
  const nav = useNavigate()
  return (
    <header className="topbar">
      <button className="topbar__back" aria-label="뒤로가기" onClick={() => nav(-1)}>
        {/* 화살표는 텍스트로 처리 (이미지 불필요) */}
        ←
      </button>
      <h1 className="topbar__title">{title}</h1>
      <div className="topbar__spacer" />
    </header>
  )
}
