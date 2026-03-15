import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './api';
import { NotificationData } from '@/schemas/notification';

export interface NotificationsResponse {
  notifications: NotificationData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
}

export interface UnreadCountResponse {
  count: number;
}

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Notifications', 'NotificationCount'],
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, { page?: number; limit?: number }>({
      query: (params = {}) => ({
        url: 'notifications',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
        },
      }),
      providesTags: ['Notifications'],
    }),

    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => 'notifications/unread-count',
      providesTags: ['NotificationCount'],
    }),

    markAsRead: builder.mutation<NotificationData, string>({
      query: (notificationId) => ({
        url: `notifications/${notificationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications', 'NotificationCount'],
    }),

    markAllAsRead: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: 'notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications', 'NotificationCount'],
    }),

    deleteNotification: builder.mutation<{ message: string }, string>({
      query: (notificationId) => ({
        url: `notifications/${notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications', 'NotificationCount'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;
