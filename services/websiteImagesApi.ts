// src/redux/services/websiteImagesApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Helper to get token from localStorage
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

// The base URL for the API endpoint
const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/website-images`;

// Prepare headers with the Authorization token
const prepareHeaders = (headers: Headers) => {
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
};

// Interface for the image data structure
interface WebsiteImage {
  _id: string;
  publicId: string;
  url: string;
  altText?: string;
  context?: string;
  filename?: string;
  belongsTo?: {
    resourceType: string;
    resourceId: string;
  };
  pageUrl?: string;
  width?: number;
  height?: number;
  order?: number;
  active?: boolean;
  createdAt: string;
  updatedAt: string;
}

// The core API slice using RTK Query
export const websiteImagesApi = createApi({
  reducerPath: "websiteImagesApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders,
  }),
  tagTypes: ["WebsiteImages"],
  endpoints: (builder) => ({
    // ✅ GET all website images
    getWebsiteImages: builder.query<WebsiteImage[], void>({
      query: () => `/`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "WebsiteImages" as const,
                id: _id,
              })),
              { type: "WebsiteImages", id: "LIST" },
            ]
          : [{ type: "WebsiteImages", id: "LIST" }],
      transformResponse: (response: { data: WebsiteImage[] }) => response.data,
    }),

    // ✅ GET single website image by ID
    getWebsiteImageById: builder.query<WebsiteImage, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "WebsiteImages", id }],
      transformResponse: (response: { data: WebsiteImage }) => response.data,
    }),

    // ✅ POST new website image
    addWebsiteImage: builder.mutation<WebsiteImage, FormData>({
      query: (formData) => ({
        url: "/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "WebsiteImages", id: "LIST" }],
      transformResponse: (response: { data: WebsiteImage }) => response.data,
    }),

    // ✅ UPDATE website image
    updateWebsiteImage: builder.mutation<
      WebsiteImage,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "WebsiteImages", id },
      ],
      transformResponse: (response: { data: WebsiteImage }) => response.data,
    }),

    // ✅ DELETE website image
    deleteWebsiteImage: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "WebsiteImages", id },
        { type: "WebsiteImages", id: "LIST" },
      ],
    }),
  }),
});

// ✅ Export hooks
export const {
  useGetWebsiteImagesQuery,
  useGetWebsiteImageByIdQuery,
  useAddWebsiteImageMutation,
  useUpdateWebsiteImageMutation,
  useDeleteWebsiteImageMutation,
} = websiteImagesApi;
