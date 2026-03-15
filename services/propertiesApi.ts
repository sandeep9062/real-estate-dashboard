import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./api";

export const propertiesApi = createApi({
  reducerPath: "propertiesApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Property"],
  endpoints: (builder) => ({
    getAllProperties: builder.query({
      query: (params) => ({
        url: "/properties",
        params,
      }),
      providesTags: ["Property"],
    }),
    getProperty: builder.query({
      query: (id) => `/properties/${id}`,
      providesTags: (result, error, id) => [{ type: "Property", id }],
    }),
    getOwnedProperties: builder.query({
      query: () => `/properties/owned`,
      providesTags: ["Property"],
    }),
    createProperty: builder.mutation({
      query: (payload) => {
        // Supports both:
        // 1) Plain object payload from the stepper modal (we'll convert to FormData)
        // 2) Pre-built FormData payload (used by PropertyForm)
        let body: FormData;

        if (payload instanceof FormData) {
          body = payload;
        } else {
          body = new FormData();
          const { token: _token, ...propertyData } = payload || {};

          Object.keys(propertyData).forEach((key) => {
            const value = (propertyData as any)[key];

            if (key === "image") {
              (value || []).forEach((file: File) => body.append("image", file));
              return;
            }

            if (value === undefined || value === null) return;

            if (typeof value === "object") {
              body.append(key, JSON.stringify(value));
            } else {
              body.append(key, String(value));
            }
          });
        }

        return {
          url: "/properties",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Property"],
    }),
    updateProperty: builder.mutation({
      query: ({ id, ...payload }) => {
        // Supports both:
        // 1) { id, ...plainObject } => converted to FormData
        // 2) { id, data: FormData } => passed through
        let body: FormData;

        if ((payload as any)?.data instanceof FormData) {
          body = (payload as any).data;
        } else {
          body = new FormData();
          Object.keys(payload).forEach((key) => {
            const value = (payload as any)[key];

            if (key === "image") {
              (value || []).forEach((file: File | string) => {
                if (file instanceof File) body.append("image", file);
              });
              return;
            }

            if (value === undefined || value === null) return;

            if (typeof value === "object") {
              body.append(key, JSON.stringify(value));
            } else {
              body.append(key, String(value));
            }
          });
        }

        return {
          url: `/properties/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: "Property", id }, "Property"],
    }),


    
    deleteProperty: builder.mutation({
      query: (id) => ({
        url: `/properties/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Property"],
    }),
  }),
});

export const {
  useGetAllPropertiesQuery,
  useGetPropertyQuery,
  useGetOwnedPropertiesQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
} = propertiesApi;
