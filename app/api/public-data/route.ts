import { NextRequest, NextResponse } from "next/server";
import { demoPublicItems } from "@/lib/demo-data";
import { NAVER_USER_COOKIE } from "@/lib/auth";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { extractRecords, normalizePublicItems } from "@/lib/public-data";

export async function GET(request: NextRequest) {
  if (!request.cookies.get(NAVER_USER_COOKIE)?.value) {
    return NextResponse.json(
      {
        items: [],
        isDemo: false,
        message: "네이버 인증 후 공공데이터를 조회할 수 있습니다."
      },
      { status: 401 }
    );
  }

  const query = request.nextUrl.searchParams.get("query") || "서울";
  const apiUrl = process.env.PUBLIC_DATA_API_URL;
  const apiKey = process.env.PUBLIC_DATA_API_KEY;

  if (!apiUrl || !apiKey) {
    return NextResponse.json({
      items: demoPublicItems,
      isDemo: true,
      message: "PUBLIC_DATA_API_URL 또는 PUBLIC_DATA_API_KEY가 없어 데모 데이터를 반환합니다."
    });
  }

  try {
    const url = new URL(apiUrl);
    url.searchParams.set("serviceKey", apiKey);
    url.searchParams.set("query", query);
    url.searchParams.set("type", "json");

    const response = await fetch(url, { next: { revalidate: 60 } });

    if (!response.ok) {
      throw new Error(`공공 API 응답 오류: ${response.status}`);
    }

    const payload = await response.json();
    const records = extractRecords(payload);
    const items = normalizePublicItems(records, "공공 API");

    const supabase = createSupabaseServiceClient();
    if (supabase && items.length > 0) {
      await supabase.from("public_items").insert(
        items.slice(0, 20).map((item) => ({
          title: item.title,
          address: item.address,
          latitude: item.latitude ?? null,
          longitude: item.longitude ?? null,
          phone: item.phone ?? null,
          source: item.source,
          raw_data: item.rawData ?? null
        }))
      );
    }

    return NextResponse.json({ items, isDemo: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "공공 API 조회 중 오류가 발생했습니다.";

    return NextResponse.json(
      {
        items: demoPublicItems,
        isDemo: true,
        message
      },
      { status: 200 }
    );
  }
}
