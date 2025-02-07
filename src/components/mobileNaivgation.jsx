import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Calendar,
  Bell,
  BookOpen,
  Headphones,
  Megaphone,
} from "lucide-react";

const navItems = [
  { name: "게시판", icon: LayoutDashboard, href: "/admin/dashboard" },
  { name: "회원관리", icon: Users, href: "/admin/member-management" },
  { name: "쇼핑 옵션", icon: ShoppingCart, href: "/admin/shopping" },
  { name: "이벤트", icon: Calendar, href: "/admin/events" },
  { name: "공지사항", icon: Bell, href: "/admin/notice" },
  { name: "사용자 가이드", icon: BookOpen, href: "/admin/user-guide" },
  { name: "고객센터", icon: Headphones, href: "/admin/customer-center" },
  { name: "광고", icon: Megaphone, href: "/admin/advertisement " },
];

const MobileNavigation = () => {
  return (
    <nav className="z-50">
      <ul className="flex flex-col">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link
              to={item.href}
              className="flex items-center p-4 hover:bg-gray-50"
            >
              <item.icon className="h-6 w-6 text-gray-500 mr-3" />
              <span className="text-sm font-medium text-gray-900">
                {item.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MobileNavigation;
