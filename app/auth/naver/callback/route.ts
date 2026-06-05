import { NextRequest, NextResponse } from "next/server";
import { encodeUserCookie, NAVER_STATE_COOKIE, NAVER_USER_COOKIE } from "@/lib/auth";
import { createSupabaseServiceClient } from "@/lib/supabase";

type NaverTokenResponse = {
  access_token?: string;
  error?: string;
};

type NaverProfileResponse = {
  response?: {
    id?: string;
    name?: string;
    email?: string;
    profile_image?: string;
  };
};

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(NAVER_STATE_COOKIE)?.value;
  const clientId = process.env.NAVER_CLIENT_ID || process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  const redirectUri =
    process.env.NAVER_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/auth/naver/callback`;

  if (!code || !clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/?login=missing-naver-env", request.url));
  }

  if (!state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/?login=invalid-state", request.url));
  }

  const tokenParams = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    code,
    state: state || "",
    redirect_uri: redirectUri
  });

  const tokenResponse = await fetch(`https://nid.naver.com/oauth2.0/token?${tokenParams.toString()}`);
  const token = (await tokenResponse.json()) as NaverTokenResponse;

  if (!token.access_token || token.error) {
    return NextResponse.redirect(new URL("/?login=failed", request.url));
  }

  const profileResponse = await fetch("https://openapi.naver.com/v1/nid/me", {
    headers: {
      Authorization: `Bearer ${token.access_token}`
    }
  });
  const profile = (await profileResponse.json()) as NaverProfileResponse;
  const naverUser = profile.response;

  if (!naverUser?.id) {
    return NextResponse.redirect(new URL("/?login=failed", request.url));
  }

  const supabase = createSupabaseServiceClient();
  if (supabase) {
    await supabase.from("users").upsert(
      {
        naver_id: naverUser.id,
        name: naverUser.name || "네이버 사용자",
        email: naverUser.email || null,
        profile_image: naverUser.profile_image || null
      },
      { onConflict: "naver_id" }
    );
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set(
    NAVER_USER_COOKIE,
    encodeUserCookie({
      naverId: naverUser.id,
      name: naverUser.name || "네이버 사용자",
      email: naverUser.email || "",
      profileImage: naverUser.profile_image || ""
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/"
    }
  );
  response.cookies.delete(NAVER_STATE_COOKIE);

  return response;
}
