import { NextRequest, NextResponse } from "next/server";
import { NAVER_STATE_COOKIE } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const clientId = process.env.NAVER_CLIENT_ID || process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const redirectUri = process.env.NAVER_REDIRECT_URI || `${appUrl}/auth/naver/callback`;

  if (!clientId) {
    return NextResponse.redirect(new URL("/?login=missing-naver-client-id", request.url));
  }

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state
  });

  const response = NextResponse.redirect(`https://nid.naver.com/oauth2.0/authorize?${params.toString()}`);
  response.cookies.set(NAVER_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/"
  });

  return response;
}
