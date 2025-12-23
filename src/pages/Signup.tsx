// src/pages/Signup.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";

import {
  requestSignupEmailCode,
  verifySignupEmailCode,
  signupLocal,
} from "../api/auth";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [ageOk, setAgeOk] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");

  const [loading, setLoading] = useState({
    send: false,
    verify: false,
    signup: false,
  });

  // ✅ 서버에 보내야 하는 토큰 (verify-email 결과)
  const [emailVerifiedToken, setEmailVerifiedToken] = useState<string>("");
  const [verifySuccess, setVerifySuccess] = useState(false);

  const nav = useNavigate();

  const handleSendCode = async () => {
    if (!email.includes("@")) {
      setEmailError("올바른 이메일 형식이 아닙니다.");
      return;
    }
    setLoading((v) => ({ ...v, send: true }));
    setEmailError("");

    try {
      await requestSignupEmailCode(email);
      alert("인증코드가 이메일로 전송되었습니다.");
    } catch (e: any) {
      setEmailError(e?.message ?? "인증코드 전송에 실패했습니다.");
    } finally {
      setLoading((v) => ({ ...v, send: false }));
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      setCodeError("인증번호를 입력하세요.");
      return;
    }

    setLoading((v) => ({ ...v, verify: true }));
    setCodeError("");
    setVerifySuccess(false);

    try {
      // ✅ verifySignupEmailCode는 문자열(token) 반환 (서버 응답이 text)
      const tokenText = await verifySignupEmailCode(email, code);

      if (!tokenText || typeof tokenText !== "string") {
        throw new Error("이메일 인증 토큰 발급 실패");
      }

      setEmailVerifiedToken(tokenText);
      setVerifySuccess(true);
    } catch (e: any) {
      setCodeError(e?.message ?? "인증번호가 올바르지 않습니다.");
    } finally {
      setLoading((v) => ({ ...v, verify: false }));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ageOk) return alert("만 14세 이상 동의가 필요합니다.");
    if (!emailVerifiedToken) return alert("이메일 인증을 먼저 완료해주세요.");
    if (!password.trim()) return alert("비밀번호를 입력하세요.");
    if (!name.trim()) return alert("이름을 입력하세요.");

    setLoading((v) => ({ ...v, signup: true }));

    try {
      // ✅ 핵심: emailVerifiedToken을 서버로 반드시 보냄
      await signupLocal({
        email,
        password,
        name,
        emailVerifiedToken,
      });

      alert("회원가입이 완료되었습니다. 로그인 해주세요.");
      nav("/login", { replace: true });
    } catch (e: any) {
      alert(e?.message ?? "회원가입에 실패했습니다.");
    } finally {
      setLoading((v) => ({ ...v, signup: false }));
    }
  };

  return (
    <>
      <TopBar title="회원가입" />
      <main className="page">
        <form className="form form--signup" onSubmit={submit}>
          <div className="field-inline">
            <input
              className="form__input"
              type="email"
              placeholder="이메일 등록"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
            />
            <button
              type="button"
              className="btn btn--pill action-btn"
              onClick={handleSendCode}
              disabled={loading.send}
            >
              인증코드 전송
            </button>
          </div>
          {emailError && <p className="form__help is-error">{emailError}</p>}

          <div className="field-inline">
            <input
              className="form__input"
              type="text"
              placeholder="인증번호 입력"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setCodeError("");
              }}
            />
            <button
              type="button"
              className="btn btn--pill action-btn"
              onClick={handleVerifyCode}
              disabled={loading.verify}
            >
              확인
            </button>
          </div>
          {codeError && <p className="form__help is-error">{codeError}</p>}
          {verifySuccess && (
            <p className="form__help" style={{ color: "#16a34a" }}>
              이메일 인증이 완료되었습니다.
            </p>
          )}

          <div className="field-single">
            <input
              className="form__input"
              type="password"
              placeholder="비밀번호 등록"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="field-single">
            <input
              className="form__input"
              type="text"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <label className="form__row" style={{ marginTop: 16 }}>
            <input
              type="checkbox"
              checked={ageOk}
              onChange={(e) => setAgeOk(e.target.checked)}
            />
            <span>[필수] 만 14세 이상입니다.</span>
          </label>

          <button
            type="submit"
            className="btn btn--primary btn--xl"
            disabled={loading.signup}
          >
            가입하기
          </button>
        </form>
      </main>
    </>
  );
}
