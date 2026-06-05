"use client";

import { LogIn } from "lucide-react";

export function NaverLoginButton() {
  const handleLogin = () => {
    window.location.href = "/auth/naver/start";
  };

  return (
    <button className="naver-login" type="button" onClick={handleLogin}>
      <LogIn size={20} aria-hidden />
      <span>네이버로 시작하기</span>
    </button>
  );
}
