export type UserProfile = {
  id?: string;
  naverId?: string;
  name: string;
  email?: string;
  profileImage?: string;
};

export type PublicItem = {
  id: string;
  title: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  source: string;
  rawData?: unknown;
};

export type PublicDataResponse = {
  items: PublicItem[];
  isDemo: boolean;
  message?: string;
};

export type SubscriptionPlan = {
  name: string;
  price: number;
  features: string[];
};

export type PaymentResult = {
  paymentKey?: string;
  orderId: string;
  orderName: string;
  amount: number;
  status: "success" | "fail" | "demo";
};
