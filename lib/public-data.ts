import type { PublicItem } from "./types";

const titleKeys = ["title", "name", "facltNm", "facilityName", "FCLTY_NM", "시설명", "데이터명"];
const addressKeys = ["address", "addr", "roadAddress", "rdnmadr", "ADDR", "주소"];
const latitudeKeys = ["latitude", "lat", "y", "위도", "LAT", "la"];
const longitudeKeys = ["longitude", "lng", "lon", "x", "경도", "LNG", "lo"];
const phoneKeys = ["phone", "tel", "telno", "TELNO", "전화번호"];

function pick(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value);
    }
  }

  return "";
}

function toNumber(value: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function extractRecords(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const root = payload as Record<string, unknown>;
  const candidates = [
    root.items,
    root.data,
    root.list,
    root.response && typeof root.response === "object" ? (root.response as Record<string, unknown>).body : undefined
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
    }

    if (candidate && typeof candidate === "object") {
      const nested = candidate as Record<string, unknown>;
      if (Array.isArray(nested.items)) {
        return nested.items.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
      }
      if (Array.isArray(nested.item)) {
        return nested.item.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
      }
    }
  }

  return [];
}

export function normalizePublicItems(records: Record<string, unknown>[], source = "공공 API"): PublicItem[] {
  return records.map((record, index) => {
    const latitude = toNumber(pick(record, latitudeKeys));
    const longitude = toNumber(pick(record, longitudeKeys));

    return {
      id: String(record.id ?? record.ID ?? `public-${index + 1}`),
      title: pick(record, titleKeys) || `공공데이터 ${index + 1}`,
      address: pick(record, addressKeys) || "주소 정보 없음",
      latitude,
      longitude,
      phone: pick(record, phoneKeys),
      source,
      rawData: record
    };
  });
}
