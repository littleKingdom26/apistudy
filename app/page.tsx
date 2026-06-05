import { ArrowRight, DatabaseZap, MapPinned, WalletCards } from "lucide-react";
import { NaverLoginButton } from "@/components/NaverLoginButton";

const flow = [
  { title: "로그인", text: "네이버 계정으로 사용자를 확인합니다.", icon: ArrowRight },
  { title: "데이터", text: "공공 API에서 외부 데이터를 가져옵니다.", icon: DatabaseZap },
  { title: "지도", text: "위치 정보가 있는 항목을 지도에 표시합니다.", icon: MapPinned },
  { title: "결제", text: "구독 테스트 결제로 서비스 흐름을 닫습니다.", icon: WalletCards }
];

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">API Learning MVP</p>
          <h1>API 학습용 서비스</h1>
          <p>네이버로 로그인하고, 공공데이터를 지도에서 확인해보세요.</p>
          <div className="hero-actions">
            <NaverLoginButton />
          </div>
        </div>
        <div className="hero-board" aria-label="서비스 흐름">
          {flow.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title}>
                <Icon size={22} aria-hidden />
                <div>
                  <h2>{item.title}</h2>
                  <p>{item.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
