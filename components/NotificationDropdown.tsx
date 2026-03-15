"use client";

import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationData } from "@/schemas/notification";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from "@/services/notificationApi";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

interface NotificationDropdownProps {
  unreadCount: number;
  className?: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "success":
      return "✅";
    case "warning":
      return "⚠️";
    case "error":
      return "❌";
    default:
      return "📢";
  }
};

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  isCompact = false,
}: {
  notification: NotificationData;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isCompact?: boolean;
}) => {
  return (
    <div
      className={`p-3 border-b border-border last:border-b-0 ${!notification.isRead ? "bg-secondary/50" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">
              {getNotificationIcon(notification.type)}
            </span>
            <Badge
              variant={
                notification.priority === "high" ? "destructive" : "secondary"
              }
              className="text-xs"
            >
              {notification.category}
            </Badge>
          </div>
          <h4
            className={`font-medium text-sm ${!notification.isRead ? "text-foreground" : "text-muted-foreground"} ${isCompact ? "line-clamp-1" : ""}`}
          >
            {notification.title}
          </h4>
          <p
            className={`text-xs text-muted-foreground mt-1 ${isCompact ? "line-clamp-2" : ""}`}
          >
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onMarkAsRead(notification.id)}
              title="Mark as read"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(notification.id)}
            title="Delete notification"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {!notification.isRead && (
        <div className="w-2 h-2 bg-accent rounded-full mt-2 float-right clear-both"></div>
      )}
    </div>
  );
};

export default function NotificationDropdown({
  unreadCount,
  className,
}: NotificationDropdownProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { data, isLoading, refetch } = useGetNotificationsQuery({
    page: 1,
    limit: 10,
  });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!notificationId || notificationId === "undefined") {
      toast({
        title: "Error",
        description: "Invalid notification ID",
        variant: "destructive",
      });
      return;
    }

    try {
      await markAsRead(notificationId).unwrap();
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!notificationId || notificationId === "undefined") {
      toast({
        title: "Error",
        description: "Invalid notification ID",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteNotification(notificationId).unwrap();
      toast({
        title: "Success",
        description: "Notification deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    router.push("/notifications");
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${className}`}
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs font-medium flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {(data?.notifications?.length || 0) > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading notifications...
          </div>
        ) : !data?.notifications || data.notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <>
            <div className="max-h-60 overflow-y-auto">
              {data.notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDeleteNotification}
                  isCompact
                />
              ))}
            </div>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="outline"
                onClick={handleViewAll}
                className="w-full"
              >
                View All Notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
