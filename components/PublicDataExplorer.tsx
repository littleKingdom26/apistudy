"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapPinned, Search, ShieldCheck } from "lucide-react";
import type { PublicDataResponse, PublicItem, UserProfile } from "@/lib/types";

type PublicDataExplorerProps = {
  user: UserProfile;
};

export function PublicDataExplorer({ user }: PublicDataExplorerProps) {
  const [query, setQuery] = useState("서울");
  const [items, setItems] = useState<PublicItem[]>([]);
  const [message, setMessage] = useState("검색어를 입력하고 조회 버튼을 눌러 공공 API를 호출하세요.");
  const [isLoading, setIsLoading] = useState(false);

  const mappableCount = useMemo(
    () => items.filter((item) => item.latitude !== undefined && item.longitude !== undefined).length,
    [items]
  );

  useEffect(() => {
    localStorage.removeItem("public-items");
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/public-data?query=${encodeURIComponent(query)}`);
      const data = (await response.json()) as PublicDataResponse;

      if (!response.ok) {
        if (response.status === 401) {
          setItems([]);
          localStorage.removeItem("public-items");
        }
        throw new Error(data.message || "공공데이터 조회에 실패했습니다.");
      }

      setItems(data.items);
      localStorage.setItem("public-items", JSON.stringify(data.items));
      setMessage(data.message || "공공 API 데이터를 불러왔습니다.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      setItems([]);
      localStorage.removeItem("public-items");
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <section className="workspace-panel search-panel">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>안녕하세요, {user.name}님.</h1>
          <p className="muted">조회하고 싶은 지역 또는 키워드를 입력해보세요.</p>
        </div>

        <form className="search-form" onSubmit={handleSubmit}>
          <label htmlFor="query">검색어</label>
          <div className="search-row">
            <input
              id="query"
              name="query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="예: 서울, 도서관, 복지"
            />
            <button type="submit" disabled={isLoading}>
              <Search size={18} aria-hidden />
              <span>{isLoading ? "조회 중" : "조회"}</span>
            </button>
          </div>
        </form>

        <div className="summary-grid">
          <div>
            <strong>{items.length}</strong>
            <span>조회 결과</span>
          </div>
          <div>
            <strong>{mappableCount}</strong>
            <span>지도 표시 가능</span>
          </div>
          <div>
            <strong>{items.length - mappableCount}</strong>
            <span>좌표 없음</span>
          </div>
        </div>

        <p className="status-line">
          <ShieldCheck size={18} aria-hidden />
          {message}
        </p>

        <Link className="primary-link" href="/map">
          <MapPinned size={18} aria-hidden />
          지도에서 보기
        </Link>
      </section>

      <section className="results-list" aria-label="공공데이터 목록">
        {items.map((item) => (
          <article className="result-card" key={item.id}>
            <div>
              <h2>{item.title}</h2>
              <p>{item.address}</p>
            </div>
            <dl>
              <div>
                <dt>전화</dt>
                <dd>{item.phone || "정보 없음"}</dd>
              </div>
              <div>
                <dt>출처</dt>
                <dd>{item.source}</dd>
              </div>
              <div>
                <dt>지도</dt>
                <dd>{item.latitude && item.longitude ? "가능" : "좌표 없음"}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </div>
  );
}
