"use client";

import { useEffect, useState } from "react";

type Props = {
  paymentKey: string;
  orderId: string;
  orderName: string;
  amount: number;
};

export function PaymentSuccessRecorder({ paymentKey, orderId, orderName, amount }: Props) {
  const [status, setStatus] = useState("결제 결과 저장 준비 중");

  useEffect(() => {
    const savePayment = async () => {
      try {
        const response = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ paymentKey, orderId, orderName, amount, status: "success" })
        });
        const data = await response.json();
        setStatus(data.message || "결제 결과를 저장했습니다.");
      } catch {
        setStatus("결제 결과 화면은 표시되었지만 저장 요청은 실패했습니다.");
      }
    };

    savePayment();
  }, [amount, orderId, orderName, paymentKey]);

  return <p className="status-line">{status}</p>;
}
