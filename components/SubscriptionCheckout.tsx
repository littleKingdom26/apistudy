"use client";

import { useState } from "react";
import { CreditCard, Sparkles } from "lucide-react";
import { subscriptionPlan } from "@/lib/demo-data";

declare global {
  interface Window {
    AUTHNICE?: {
      requestPay: (options: {
        clientId: string;
        method: string;
        orderId: string;
        amount: number;
        goodsName: string;
        returnUrl: string;
        fnError?: (result: { errorMsg?: string; errorCode?: string }) => void;
      }) => void;
    };
  }
}

function loadNicePayScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.AUTHNICE) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>("script[data-nicepay]");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("나이스페이 결제 스크립트 로드 실패")), {
        once: true
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://pay.nicepay.co.kr/v1/js/";
    script.async = true;
    script.dataset.nicepay = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("나이스페이 결제 스크립트 로드 실패"));
    document.head.appendChild(script);
  });
}

export function SubscriptionCheckout() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    const clientKey = process.env.NEXT_PUBLIC_NICEPAY_CLIENT_KEY;

    if (!clientKey) {
      const query = new URLSearchParams({
        message: "NEXT_PUBLIC_NICEPAY_CLIENT_KEY가 없어 결제창을 호출할 수 없습니다."
      });
      window.location.href = `/payment/fail?${query.toString()}`;
      return;
    }

    setIsLoading(true);
    const orderId = `demo-order-${Date.now()}`;

    try {
      await loadNicePayScript();

      if (!window.AUTHNICE) {
        throw new Error("나이스페이 결제 객체를 찾을 수 없습니다.");
      }

      window.AUTHNICE.requestPay({
        clientId: clientKey,
        method: "card",
        orderId,
        amount: subscriptionPlan.price,
        goodsName: subscriptionPlan.name,
        returnUrl: `${window.location.origin}/payment/return`,
        fnError: (result) => {
          const query = new URLSearchParams({
            message: result.errorMsg || result.errorCode || "나이스페이 결제가 실패했습니다."
          });
          window.location.href = `/payment/fail?${query.toString()}`;
        }
      });
    } catch (error) {
      const query = new URLSearchParams({
        message: error instanceof Error ? error.message : "결제창 호출 중 오류가 발생했습니다."
      });
      window.location.href = `/payment/fail?${query.toString()}`;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="subscribe-layout">
      <section className="workspace-panel subscription-panel">
        <p className="eyebrow">Subscription</p>
        <h1>{subscriptionPlan.name}</h1>
        <p className="price">
          월 <strong>{subscriptionPlan.price.toLocaleString("ko-KR")}원</strong>
        </p>

        <ul className="feature-list">
          {subscriptionPlan.features.map((feature) => (
            <li key={feature}>
              <Sparkles size={17} aria-hidden />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <button className="checkout-button" type="button" onClick={handleCheckout} disabled={isLoading}>
          <CreditCard size={20} aria-hidden />
          <span>{isLoading ? "결제창 호출 중" : "테스트 결제하기"}</span>
        </button>
      </section>
    </div>
  );
}
