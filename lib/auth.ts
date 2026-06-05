import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import type { UserProfile } from "./types";

export const NAVER_USER_COOKIE = "naver-user";
export const NAVER_STATE_COOKIE = "naver-oauth-state";

export function encodeUserCookie(user: UserProfile) {
  return encodeURIComponent(JSON.stringify(user));
}

export function parseUserCookie(cookieStore: ReadonlyRequestCookies): UserProfile | null {
  const value = cookieStore.get(NAVER_USER_COOKIE)?.value;

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(value)) as UserProfile;
  } catch {
    return null;
  }
}
