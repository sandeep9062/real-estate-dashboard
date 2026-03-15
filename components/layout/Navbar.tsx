"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSelector } from "react-redux";
import { selectUser, selectIsAuthenticated } from "@/store/authSlice";
import ProfileMenu from "@/components/ProfileMenu";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useGetUnreadCountQuery } from "@/services/notificationApi";

export default function Navbar() {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data: unreadCountData, isLoading: unreadCountLoading } =
    useGetUnreadCountQuery(undefined, {
      skip: !isAuthenticated,
    });
  const unreadCount = unreadCountData?.count || 0;

  return (
    <header className="sticky z-0 top-0 flex h-16 items-center gap-4 border-b border-border bg-card px-6">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search properties, users, bookings..."
          className="pl-9 bg-secondary border-border"
        />
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {/* Notifications - only show if authenticated */}
        {isAuthenticated && <NotificationDropdown unreadCount={unreadCount} />}

        {/* Profile Menu */}
        <ProfileMenu user={user} />
      </div>
    </header>
  );
}
