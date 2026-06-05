import Link from "next/link";
import { XCircle } from "lucide-react";

type FailPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function PaymentFailPage({ searchParams }: FailPageProps) {
  const params = await searchParams;
  const message = readParam(params, "message") || "테스트 결제가 취소되었거나 실패했습니다.";

  return (
    <section className="payment-result fail">
      <XCircle size={44} aria-hidden />
      <p className="eyebrow">Payment Failed</p>
      <h1>결제 결과를 확인해주세요.</h1>
      <p>{message}</p>
      <Link className="primary-link" href="/subscribe">
        구독 화면으로 돌아가기
      </Link>
    </section>
  );
}
