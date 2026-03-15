"use client";

import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NotificationData } from "@/schemas/notification";
import { useGetNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation, useDeleteNotificationMutation } from "@/services/notificationApi";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import { useSearchParams } from "next/navigation";

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
}: {
  notification: NotificationData;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <Card className={`mb-3 transition-all ${!notification.isRead ? 'border-accent bg-accent/5' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getNotificationIcon(notification.type)}</span>
              <Badge variant={notification.priority === 'high' ? 'destructive' : 'secondary'}>
                {notification.category}
              </Badge>
              {notification.priority === 'high' && (
                <Badge variant="destructive" className="text-xs">High Priority</Badge>
              )}
            </div>
            <h4 className={`font-semibold mb-1 ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
              {notification.title}
            </h4>
            <p className={`text-sm mb-2 ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
              {notification.message}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {format(new Date(notification.createdAt), 'MMM dd, yyyy \'at\' hh:mm a')}
                {' • '}
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-accent rounded-full"></div>
              )}
            </div>
            {notification.metadata && Object.keys(notification.metadata).length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                <details>
                  <summary className="cursor-pointer hover:text-foreground">View details</summary>
                  <pre className="mt-1 bg-secondary p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(notification.metadata, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!notification.isRead && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMarkAsRead(notification.id)}
                className="h-8"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark Read
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(notification.id)}
              className="h-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function NotificationsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));

  const { data, isLoading, refetch } = useGetNotificationsQuery({
    page: currentPage,
    limit: 20
  });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const handleMarkAsRead = async (notificationId: string) => {
    if (!notificationId || notificationId === 'undefined') {
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
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!notificationId || notificationId === 'undefined') {
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
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Update URL params
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    window.history.pushState({}, '', url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Bell className="h-8 w-8 animate-pulse mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  const notifications = data?.notifications || [];
  const pagination = data?.pagination;
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your latest activities and messages
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              {unreadCount} unread
            </Badge>
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
            <p className="text-muted-foreground text-center">
              You'll see your latest activities and messages here when they arrive.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDeleteNotification}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} notifications
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
