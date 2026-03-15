import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getToken = () => localStorage.getItem("token");

export const siteSettingsApi = createApi({
  reducerPath: "siteSettingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/site-settings`,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["SiteSettings"],
  endpoints: (builder) => ({
    getSiteSettings: builder.query<any, void>({
      query: () => `/`,
      providesTags: ["SiteSettings"],
    }),
    createSiteSettings: builder.mutation<any, any>({
      query: (data) => ({
        url: "/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SiteSettings"],
    }),
    updateSiteSettings: builder.mutation<any, any>({
      query: (data) => ({
        url: `/${data.id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["SiteSettings"],
    }),
    deleteSiteSettings: builder.mutation<any, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SiteSettings"],
    }),
  }),
});

export const {
  useGetSiteSettingsQuery,
  useCreateSiteSettingsMutation,
  useUpdateSiteSettingsMutation,
  useDeleteSiteSettingsMutation,
} = siteSettingsApi;
