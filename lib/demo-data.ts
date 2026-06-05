import type { PublicItem, SubscriptionPlan, UserProfile } from "./types";

export const demoUser: UserProfile = {
  naverId: "demo-naver-user",
  name: "홍길동",
  email: "demo@example.com",
  profileImage: ""
};

export const demoPublicItems: PublicItem[] = [
  {
    id: "demo-1",
    title: "서울시 공공도서관",
    address: "서울특별시 중구 세종대로 110",
    latitude: 37.5665,
    longitude: 126.978,
    phone: "02-120",
    source: "데모 공공데이터"
  },
  {
    id: "demo-2",
    title: "종로구 생활문화센터",
    address: "서울특별시 종로구 삼일대로 401",
    latitude: 37.5729,
    longitude: 126.9895,
    phone: "02-2148-1114",
    source: "데모 공공데이터"
  },
  {
    id: "demo-3",
    title: "좌표 없는 복지 안내 데이터",
    address: "서울특별시",
    phone: "02-0000-0000",
    source: "데모 공공데이터"
  }
];

export const subscriptionPlan: SubscriptionPlan = {
  name: "관심 지역 알림 구독",
  price: 9900,
  features: ["관심 지역 데이터 모아보기", "신규 공공정보 알림", "즐겨찾기 저장", "상세 검색 기능"]
};
