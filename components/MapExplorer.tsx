"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LocateFixed, MapPinned } from "lucide-react";
import { demoPublicItems } from "@/lib/demo-data";
import type { PublicItem } from "@/lib/types";

declare global {
  interface Window {
    naver?: {
      maps: {
        Map: new (element: HTMLElement, options: Record<string, unknown>) => unknown;
        LatLng: new (lat: number, lng: number) => unknown;
        Marker: new (options: Record<string, unknown>) => { setMap: (map: unknown | null) => void };
        InfoWindow: new (options: Record<string, unknown>) => { open: (map: unknown, marker: unknown) => void };
        Event: {
          addListener: (target: unknown, eventName: string, listener: () => void) => void;
        };
      };
    };
  }
}

function getStoredItems(): PublicItem[] {
  if (typeof window === "undefined") {
    return demoPublicItems;
  }

  const saved = localStorage.getItem("public-items");
  return saved ? JSON.parse(saved) : demoPublicItems;
}

export function MapExplorer() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<PublicItem[]>(demoPublicItems);
  const [mapReady, setMapReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(demoPublicItems[0].id);

  const mappableItems = useMemo(
    () => items.filter((item) => item.latitude !== undefined && item.longitude !== undefined),
    [items]
  );

  useEffect(() => {
    setItems(getStoredItems());
  }, []);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

    if (!clientId || !mapRef.current) {
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>("script[data-naver-map]");
    if (existingScript) {
      existingScript.addEventListener("load", () => setMapReady(true), { once: true });
      setMapReady(Boolean(window.naver?.maps));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    script.dataset.naverMap = "true";
    script.onload = () => setMapReady(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.naver?.maps || mappableItems.length === 0) {
      return;
    }

    const naverMaps = window.naver.maps;
    const first = mappableItems[0];
    const map = new naverMaps.Map(mapRef.current, {
      center: new naverMaps.LatLng(first.latitude!, first.longitude!),
      zoom: 13
    });

    const markers = mappableItems.map((item) => {
      const marker = new naverMaps.Marker({
        position: new naverMaps.LatLng(item.latitude!, item.longitude!),
        map
      });
      const infoWindow = new naverMaps.InfoWindow({
        content: `<div class="map-infowindow"><strong>${item.title}</strong><p>${item.address}</p></div>`
      });

      naverMaps.Event.addListener(marker, "click", () => {
        setSelectedId(item.id);
        infoWindow.open(map, marker);
      });

      return marker;
    });

    return () => {
      markers.forEach((marker) => marker.setMap(null));
    };
  }, [mapReady, mappableItems]);

  return (
    <div className="map-layout">
      <aside className="map-sidebar">
        <p className="eyebrow">Map</p>
        <h1>위치 데이터</h1>
        <p className="muted">좌표가 있는 항목은 마커로 표시됩니다.</p>

        <div className="map-list">
          {items.map((item) => (
            <button
              className={item.id === selectedId ? "map-list-item active" : "map-list-item"}
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
            >
              <MapPinned size={17} aria-hidden />
              <span>
                <strong>{item.title}</strong>
                <small>{item.latitude && item.longitude ? item.address : "좌표 정보 없음"}</small>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section className="map-surface" aria-label="네이버 지도">
        <div ref={mapRef} className="naver-map">
          {!process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID && (
            <div className="map-placeholder">
              <LocateFixed size={34} aria-hidden />
              <strong>지도 API 키를 입력하면 네이버 지도가 표시됩니다.</strong>
              <span>현재는 데모 지도 영역입니다.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
