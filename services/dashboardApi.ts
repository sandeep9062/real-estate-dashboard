import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './api';

export interface DashboardStats {
  totalProperties: number;
  totalUsers: number;
  totalBookings: number;
  todayBookings: number;
  
  totalRevenue: number;
  monthlyRevenue: number;
  bookingsPerMonth: { month: string; bookings: number }[];
  revenuePerMonth: { month: string; revenue: number }[];
}

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['DashboardStats'],
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => 'dashboard/stats',
      providesTags: ['DashboardStats'],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
