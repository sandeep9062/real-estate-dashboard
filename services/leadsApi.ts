import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./api";

// Lead as returned by GET /api/leads/admin/all (normalized server-side:
// `agent` = agentId || legacy brokerId, `property` = populated property,
// `buyer` = { name, phone } from whichever lead kind applies).
export interface AdminLead {
  _id: string;
  id: string;
  property: {
    _id: string;
    title: string;
    slug?: string;
    image?: string;
    deal?: string;
    price?: number;
    location?: string;
    status?: string;
  } | null;
  agent: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    role?: string;
  } | null;
  buyer: {
    name: string | null;
    phone: string | null;
  };
  type?: string;
  status: string;
  source: string;
  notes?: string;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLeadFilters {
  status?: string;
  source?: string;
  type?: string;
  agentId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const leadsApi = createApi({
  reducerPath: "leadsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["AdminLeads"],
  endpoints: (builder) => ({
    // ✅ Get ALL leads across the platform (Admin)
    getAllLeads: builder.query<AdminLead[], AdminLeadFilters | void>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters || {}).forEach(([key, value]) => {
          if (value) params.set(key, String(value));
        });
        const qs = params.toString();
        return `/leads/admin/all${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["AdminLeads"],
      transformResponse: (response: { success: boolean; count: number; data: AdminLead[] }) =>
        response?.data ?? [],
    }),
  }),
});

// ✅ Export hooks
export const { useGetAllLeadsQuery } = leadsApi;
