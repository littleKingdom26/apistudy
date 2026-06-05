import Link from "next/link";
import { Database, MapPinned, CreditCard, Home } from "lucide-react";

const navItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/dashboard", label: "대시보드", icon: Database },
  { href: "/map", label: "지도", icon: MapPinned },
  { href: "/subscribe", label: "구독", icon: CreditCard }
];

export function AppHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        API 학습용 서비스
      </Link>
      <nav className="nav-links" aria-label="주요 화면">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Icon size={17} aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
