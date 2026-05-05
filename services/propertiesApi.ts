import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./api";

// Dynamic API URL detection for production vs development
export const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (
      hostname === "www.propertybulbul.com" ||
      hostname === "propertybulbul.com"
    ) {
      return "https://api.propertybulbul.com/api";
    }
  }

  return "http://localhost:9000/api";
};

export async function getPropertyServer(id: string) {
  const apiUrl = getApiUrl();

  try {
    const response = await fetch(`${apiUrl}/properties/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (response.status === 404) return null;

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(`API Error [${response.status}]: ${errorText}`);
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("getPropertyServer error:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Unable to connect to API at ${apiUrl}. Please ensure the backend server is running.`,
      );
    }
    throw error;
  }
}

export const propertiesApi = createApi({
  reducerPath: "propertiesApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Property", "VisitReviews"],
  endpoints: (builder) => ({
    getAllProperties: builder.query<any, any>({
      query: (params) => ({
        url: "/properties",
        params,
      }),
      providesTags: ["Property"],
    }),
    getProperty: builder.query<any, string>({
      query: (id) => `/properties/${id}`,
      providesTags: (result, error, id) => [{ type: "Property", id }],
    }),
    getOwnedProperties: builder.query<any[], void>({
      query: () => `/properties/owned`,
      providesTags: ["Property"],
    }),
    createProperty: builder.mutation<any, any>({
      query: (property) => {
        const formData = new FormData();
        Object.keys(property).forEach((key) => {
          if (key === "image") {
            property[key].forEach((file: File) => {
              formData.append(key, file);
            });
          } else if (key === "floorPlanFiles") {
            (property.floorPlanFiles || []).forEach((file: File) => {
              formData.append("floorPlan", file);
            });
          } else if (
            typeof property[key] === "object" &&
            property[key] !== null
          ) {
            formData.append(key, JSON.stringify(property[key]));
          } else {
            formData.append(key, property[key]);
          }
        });
        return {
          url: "/properties",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Property"],
    }),
    updateProperty: builder.mutation<any, { id: string; [key: string]: any }>({
      query: ({ id, ...property }) => {
        const formData = new FormData();
        const existingImages = (property.image || []).filter(
          (img: File | string) => typeof img === "string",
        );
        const newImages = (property.image || []).filter(
          (img: File | string) => img instanceof File,
        );
        formData.append("existingImages", JSON.stringify(existingImages));
        newImages.forEach((file: File) => {
          formData.append("image", file);
        });
        (property.floorPlanFiles || []).forEach((file: File) => {
          if (file instanceof File) formData.append("floorPlan", file);
        });
        Object.keys(property).forEach((key) => {
          if (key === "image") {
            // Handled above
          } else if (key === "floorPlanFiles") {
            // Handled above
          } else if (
            typeof property[key] === "object" &&
            property[key] !== null
          ) {
            formData.append(key, JSON.stringify(property[key]));
          } else {
            formData.append(key, property[key]);
          }
        });
        return {
          url: `/properties/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Property", id },
        "Property",
      ],
    }),
    deleteProperty: builder.mutation<void, string>({
      query: (id) => ({
        url: `/properties/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Property"],
    }),
    getPropertyBrochure: builder.query<Blob, string>({
      query: (id) => ({
        url: `/properties/${id}/download-brochure`,
        // Fix: Explicitly type response as Response
        responseHandler: (response: Response) => response.blob(),
      }),
    }),
    getCompareProperties: builder.query<any[], string>({
      query: (idsCsv) => ({
        url: "/properties/compare",
        params: { ids: idsCsv },
      }),
    }),
    getSimilarProperties: builder.query<
      any[],
      { propertyId: string; limit?: number }
    >({
      query: ({ propertyId, limit = 8 }) => ({
        url: "/properties/similar",
        params: { propertyId, limit },
      }),
    }),
    recordPropertyView: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/properties/${id}/view`,
        method: "POST",
      }),
    }),
    getPropertyVisitReviewSummary: builder.query<
      {
        count: number;
        avgAgentHelpfulness: number | null;
        avgListingAccuracy: number | null;
      },
      string
    >({
      query: (propertyId) => `/properties/${propertyId}/visit-reviews/summary`,
      providesTags: (result, error, propertyId) => [
        { type: "VisitReviews", id: propertyId },
      ],
    }),
    getPropertyVisitReviews: builder.query<
      any[],
      { propertyId: string; limit?: number }
    >({
      query: ({ propertyId, limit = 10 }) => ({
        url: `/properties/${propertyId}/visit-reviews`,
        params: { limit },
      }),
      providesTags: (result, error, { propertyId }) => [
        { type: "VisitReviews", id: propertyId },
      ],
    }),
    getBookingReviewStatus: builder.query<
      { reviewed: boolean; eligible: boolean },
      string
    >({
      query: (bookingId) => `/visit-reviews/booking/${bookingId}/status`,
    }),
    submitVisitReview: builder.mutation<
      unknown,
      {
        bookingId: string;
        agentHelpfulness: number;
        listingAccuracy: number;
        comment?: string;
        propertyId: string;
      }
    >({
      query: ({ bookingId, agentHelpfulness, listingAccuracy, comment }) => ({
        url: "/visit-reviews",
        method: "POST",
        body: {
          bookingId,
          agentHelpfulness,
          listingAccuracy,
          comment,
        },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "VisitReviews", id: arg.propertyId },
        { type: "Property", id: arg.propertyId },
      ],
    }),
    createWhatsAppLead: builder.mutation<
      any,
      { id: string; [key: string]: any }
    >({
      query: ({ id, ...body }) => ({
        url: `/properties/${id}/whatsapp-lead`,
        method: "POST",
        body,
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
  useGetPropertyBrochureQuery,
  useCreateWhatsAppLeadMutation,
  useGetComparePropertiesQuery,
  useLazyGetComparePropertiesQuery,
  useGetSimilarPropertiesQuery,
  useRecordPropertyViewMutation,
  useGetPropertyVisitReviewSummaryQuery,
  useGetPropertyVisitReviewsQuery,
  useGetBookingReviewStatusQuery,
  useSubmitVisitReviewMutation,
} = propertiesApi;
