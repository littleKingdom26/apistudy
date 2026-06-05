import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { PaymentSuccessRecorder } from "@/components/PaymentSuccessRecorder";
import { parseUserCookie } from "@/lib/auth";

type SuccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
  const user = parseUserCookie(await cookies());

  if (!user) {
    redirect("/?auth=required");
  }

  const params = await searchParams;
  const paymentKey = readParam(params, "paymentKey") || readParam(params, "tid") || "nicepay-payment";
  const orderId = readParam(params, "orderId") || "nicepay-order";
  const orderName = readParam(params, "orderName") || readParam(params, "goodsName") || "관심 지역 알림 구독";
  const amount = Number(readParam(params, "amount") || 9900);

  return (
    <section className="payment-result success">
      <CheckCircle2 size={44} aria-hidden />
      <p className="eyebrow">Payment Success</p>
      <h1>테스트 결제가 완료되었습니다.</h1>
      <dl>
        <div>
          <dt>상품명</dt>
          <dd>{orderName}</dd>
        </div>
        <div>
          <dt>결제 금액</dt>
          <dd>{amount.toLocaleString("ko-KR")}원</dd>
        </div>
        <div>
          <dt>구독 상태</dt>
          <dd>활성</dd>
        </div>
      </dl>
      <PaymentSuccessRecorder paymentKey={paymentKey} orderId={orderId} orderName={orderName} amount={amount} />
      <Link className="primary-link" href="/dashboard">
        대시보드로 돌아가기
      </Link>
    </section>
  );
}
