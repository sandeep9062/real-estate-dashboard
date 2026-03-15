// src/redux/services/testimonialsApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ✅ Helper to get token (only client-side)
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/testimonials`;

const prepareHeaders = (headers: Headers) => {
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers; // ⚡ Do not force Content-Type, allows FormData for image upload
};

export const testimonialsApi = createApi({
  reducerPath: "testimonialsApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders,
  }),
  tagTypes: ["Testimonials"],
  endpoints: (builder) => ({
    // ✅ GET all testimonials
    getTestimonials: builder.query<any, void>({
      query: () => `/`,
      providesTags: ["Testimonials"],
    }),

    // ✅ GET single testimonial by ID
    getTestimonialById: builder.query<any, string>({
      query: (id) => `/${id}`,
      providesTags: ["Testimonials"],
    }),

    // ✅ CREATE testimonial (with image upload via FormData)
    addTestimonial: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: `/`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Testimonials"],
    }),

    // ✅ UPDATE testimonial (with/without new image)
    updateTestimonial: builder.mutation<any, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Testimonials"],
    }),

    // ✅ DELETE testimonial
    deleteTestimonial: builder.mutation<any, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Testimonials"],
    }),
  }),
});

// ✅ Export hooks
export const {
  useGetTestimonialsQuery,
  useGetTestimonialByIdQuery,
  useAddTestimonialMutation,
  useUpdateTestimonialMutation,
  useDeleteTestimonialMutation,
} = testimonialsApi;
