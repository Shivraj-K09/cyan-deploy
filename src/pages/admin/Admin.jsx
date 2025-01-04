import { Card, CardContent } from "../../components/ui/card";
import {
  Fish,
  Users,
  Calendar,
  ShoppingBag,
  Megaphone,
  Clipboard,
  BarChart2,
} from "lucide-react";

const adminPages = [
  { title: "Status Record", href: "/admin/status-record", icon: Clipboard },
  { title: "Fish Record", href: "/admin/fish-record", icon: Fish },
  { title: "Member Management", href: "/admin/member-management", icon: Users },
  { title: "Monthly Carps", href: "/admin/monthly-carps", icon: Calendar },
  { title: "Product Review", href: "/admin/product-review", icon: ShoppingBag },
  { title: "Events", href: "/admin/events", icon: Megaphone },
  { title: "Notices", href: "/admin/notices", icon: BarChart2 },
];

export default function Admin() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-6 ">Administrator Panel</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adminPages.map((page) => (
          <a key={page.href} href={page.href}>
            <Card className="hover:bg-gray-100 shadow-none transition-colors duration-200 ease-in-out">
              <CardContent className="flex items-center p-4">
                <page.icon className="w-5 h-5 text-muted-foreground mr-3" />
                <span className="text-sm font-medium text-gray-700">
                  {page.title}
                </span>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
