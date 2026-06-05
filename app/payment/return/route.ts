import { NextRequest, NextResponse } from "next/server";

function toQueryString(values: Record<string, string>) {
  const params = new URLSearchParams(values);
  return params.toString();
}

async function readReturnValues(request: NextRequest) {
  if (request.method === "POST") {
    const formData = await request.formData();
    return Object.fromEntries(Array.from(formData.entries()).map(([key, value]) => [key, String(value)]));
  }

  return Object.fromEntries(request.nextUrl.searchParams.entries());
}

async function handleReturn(request: NextRequest) {
  const values = await readReturnValues(request);
  const resultCode = values.authResultCode || values.resultCode || values.status;
  const isSuccess = resultCode === "0000" || resultCode === "paid" || values.status === "paid";

  if (!isSuccess) {
    const message = values.authResultMsg || values.resultMsg || "나이스페이 결제 인증에 실패했습니다.";
    return NextResponse.redirect(new URL(`/payment/fail?${toQueryString({ message })}`, request.url));
  }

  const query = toQueryString({
    paymentKey: values.tid || values.paymentKey || "",
    orderId: values.orderId || "",
    orderName: values.goodsName || values.orderName || "관심 지역 알림 구독",
    amount: values.amount || "9900"
  });

  return NextResponse.redirect(new URL(`/payment/success?${query}`, request.url));
}

export async function GET(request: NextRequest) {
  return handleReturn(request);
}

export async function POST(request: NextRequest) {
  return handleReturn(request);
}
