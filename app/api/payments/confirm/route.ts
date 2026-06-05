import { NextRequest, NextResponse } from "next/server";
import { subscriptionPlan } from "@/lib/demo-data";
import { NAVER_USER_COOKIE } from "@/lib/auth";
import { createSupabaseServiceClient } from "@/lib/supabase";

type PaymentBody = {
  paymentKey?: string;
  orderId?: string;
  orderName?: string;
  amount?: number;
  status?: string;
};

export async function POST(request: NextRequest) {
  if (!request.cookies.get(NAVER_USER_COOKIE)?.value) {
    return NextResponse.json({ ok: false, message: "네이버 인증 후 결제 결과를 저장할 수 있습니다." }, { status: 401 });
  }

  const body = (await request.json()) as PaymentBody;
  const orderId = body.orderId || `demo-order-${Date.now()}`;
  const orderName = body.orderName || subscriptionPlan.name;
  const amount = Number(body.amount || subscriptionPlan.price);

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({
      ok: true,
      message: "Supabase 키가 없어 화면에서만 결제 성공을 표시합니다."
    });
  }

  const { data: payment, error } = await supabase
    .from("payments")
    .upsert(
      {
        payment_key: body.paymentKey || null,
        order_id: orderId,
        order_name: orderName,
        amount,
        status: body.status || "success",
        raw_response: body
      },
      { onConflict: "order_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    payment,
    message: "Supabase payments 테이블에 결제 결과를 저장했습니다."
  });
}
