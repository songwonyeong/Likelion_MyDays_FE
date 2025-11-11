import { useState } from "react"
import { useNavigate } from "react-router-dom"
import TopBar from "../components/TopBar"
import "../styles/auth.css"

function SimpleModal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.35)",
      display:"grid", placeItems:"center", zIndex:50
    }}>
      <div style={{
        background:"#fff", width:"min(420px,92vw)", borderRadius:12, padding:"20px 18px",
        boxShadow:"0 10px 30px rgba(0,0,0,.18)", textAlign:"center"
      }}>
        <div style={{fontSize:18, fontWeight:800, marginBottom:8}}>알림</div>
        <div style={{fontSize:14, color:"#4b5563", marginBottom:16}}>{children}</div>
        <button className="btn btn--primary" style={{height:42}} onClick={onClose}>확인</button>
      </div>
    </div>
  )
}

export default function Login() {
  const nav = useNavigate()
  const [open, setOpen] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nav("/main") // 임시: 로그인 성공 없이 메인으로 이동
  }

  return (
    <>
      <TopBar title="로그인" />
      <main className="page">
        <section className="form" style={{textAlign:"center"}}>
          <form onSubmit={onSubmit}>
            <div className="form__group">
              <input className="form__input" placeholder="이메일" type="email" required />
              <input className="form__input" placeholder="비밀번호" type="password" required />
            </div>
            <p className="link-muted" style={{cursor:"pointer"}} onClick={()=>setOpen(true)}>
              비밀번호를 잊으셨나요?
            </p>
            <button type="submit" className="btn btn--primary btn--block">확인</button>
          </form>
        </section>
      </main>

      <SimpleModal open={open} onClose={()=>setOpen(false)}>
        비밀번호 재설정 기능은 <b>추후 개발 예정입니다</b>.
      </SimpleModal>
    </>
  )
}
