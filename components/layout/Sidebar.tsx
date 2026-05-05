"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { logoutSuccess } from "@/store/authSlice";
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  CreditCard,
  Star,
  Settings,
  Bell,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { title: "Journals", icon: Star, path: "/journals" },
  { title: "Notifications", icon: Bell, path: "/notifications" },
  { title: "Users", icon: Users, path: "/users" },
  { title: "Properties", icon: Building2, path: "/properties" },
  { title: "Bookings", icon: Calendar, path: "/bookings" },
  { title: "Payments", icon: CreditCard, path: "/payments" },
  { title: "Reviews", icon: Star, path: "/reviews" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logoutSuccess());
    router.push("/auth");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0  h-screen border-r border-border bg-card transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex mt-5 mb-5 h-16 items-center justify-between border-b border-border px-4">
          <Image
            src="/bulbul-icon.png"
            alt="Property bulbul logo"
            width={60}
            height={60}
            priority
            className="transition-transform duration-300 group-hover:scale-[1.03]"
          />

          {!isCollapsed && (
            <h1 className="text-lg font-bold text-primary">PropertyBulbul</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="ml-auto hover:bg-secondary"
          >
            <ChevronLeft
              className={cn(
                "h-5 w-5 transition-transform duration-300",
                isCollapsed && "rotate-180",
              )}
            />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="mt-auto border-t border-border p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 gap-3 text-muted-foreground hover:bg-secondary hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 text-red-500 " />
            {!isCollapsed && (
              <span className="text-red-500 font-bold">Logout</span>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
