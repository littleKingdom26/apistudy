import { NextRequest, NextResponse } from "next/server";
import { NAVER_USER_COOKIE } from "@/lib/auth";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { extractRecords, filterPublicItems, normalizePublicItems } from "@/lib/public-data";

const ACTIVITY_API_ENDPOINT =
  "https://api.odcloud.kr/api/15111393/v1/uddi:703ed001-91d0-453c-b0d0-ee3c517fdecd";
const PAGE_SIZE = 1000;
const MAX_SEARCH_PAGES = 25;

function resolvePublicApiUrl(apiUrl: string) {
  const url = new URL(apiUrl);
  const namespace = url.searchParams.get("namespace");

  if (url.hostname === "infuser.odcloud.kr" && namespace === "15111393/v1") {
    return new URL(ACTIVITY_API_ENDPOINT);
  }

  return url;
}

function normalizeServiceKey(apiKey: string) {
  try {
    return decodeURIComponent(apiKey);
  } catch {
    return apiKey;
  }
}

async function fetchPublicDataPage(baseUrl: URL, page: number) {
  const url = new URL(baseUrl.toString());
  url.searchParams.set("page", String(page));
  url.searchParams.set("perPage", String(PAGE_SIZE));
  url.searchParams.set("returnType", "JSON");

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`공공 API 응답 오류: ${response.status}`);
  }

  return response.json();
}

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

  if (!apiUrl) {
    return NextResponse.json(
      {
        items: [],
        isDemo: false,
        message: "PUBLIC_DATA_API_URL이 비어 있어 공공 API를 호출할 수 없습니다."
      },
      { status: 400 }
    );
  }

  try {
    const url = resolvePublicApiUrl(apiUrl);
    if (apiKey) {
      url.searchParams.set("serviceKey", normalizeServiceKey(apiKey));
    }
    if (!apiKey && !url.searchParams.has("serviceKey")) {
      return NextResponse.json(
        {
          items: [],
          isDemo: false,
          message: "PUBLIC_DATA_API_KEY가 비어 있습니다. 전체 호출 URL에 serviceKey가 포함되어 있지 않다면 키를 입력해야 합니다."
        },
        { status: 400 }
      );
    }

    const records: Record<string, unknown>[] = [];
    let lastTotalCount = 0;

    for (let page = 1; page <= MAX_SEARCH_PAGES; page += 1) {
      const payload = await fetchPublicDataPage(url, page);
      const pageRecords = extractRecords(payload);
      const filtered = filterPublicItems(pageRecords, query);
      const totalCount = typeof payload.totalCount === "number" ? payload.totalCount : 0;

      records.push(...filtered);
      lastTotalCount = totalCount;

      if (records.length >= 30 || page * PAGE_SIZE >= totalCount || pageRecords.length === 0) {
        break;
      }
    }

    const items = normalizePublicItems(records, "전국 문화 여가 활동 시설");

    if (items.length === 0) {
      return NextResponse.json({
        items: [],
        isDemo: false,
        message: `공공 API 응답은 받았지만 검색어와 일치하는 시설이 없습니다. 현재 최대 ${Math.min(
          PAGE_SIZE * MAX_SEARCH_PAGES,
          lastTotalCount || PAGE_SIZE * MAX_SEARCH_PAGES
        ).toLocaleString("ko-KR")}건까지 확인했습니다.`
      });
    }

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

    return NextResponse.json({ items, isDemo: false, message: "공공 API 데이터를 불러왔습니다." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "공공 API 조회 중 오류가 발생했습니다.";

    return NextResponse.json(
      {
        items: [],
        isDemo: false,
        message
      },
      { status: 502 }
    );
  }
}
