import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./api";

/**
 * Enquiry as returned by GET /api/v1/enquiry (the backend returns a raw array,
 * NOT wrapped in { success, count, data } like the leads endpoint).
 */
export interface AdminEnquiry {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  deal?: "Rent" | "Sale";
  type?: "Residential" | "Commercial" | "Industrial" | "Agricultural";
  propertyType?: string;
  propertyCategory?: string;
  availability?: "Ready to Move" | "Under Construction";
  furnishing?: string;
  ownershipType?: string;
  location?: string;
  budget?: string;
  carpetAreaMin?: number;
  carpetAreaMax?: number;
  message?: string;
  purchasePurpose?: string;
  income?: string;
  preApprovedLoan?: string;
  needLoanAssistance?: boolean;
  timeline?: string;
  callbackTime?: string;
  source?: string;
  consentGiven?: boolean;
  reraOnly?: boolean;
  petsAllowed?: boolean;
  amenities?: string[];
  houseRules?: {
    ownerLivesOnPremises?: boolean;
    curfew?: { hasCurfew?: boolean; time?: string };
    oppositeGenderGuestsAllowed?: string;
    overnightGuestsAllowed?: string;
    smokingAllowedOnPremises?: boolean;
    drinkingAllowedOnPremises?: boolean;
  };
  facilities?: {
    bedrooms?: number;
    servantRooms?: number;
    bathrooms?: number;
    parkings?: number;
    balconies?: number;
    parkingType?: string;
    securityFeatures?: string[];
    waterSupply?: string;
    powerBackup?: boolean;
    totalFloors?: number;
  };
  nearbyPlaces?: {
    schools?: string[];
    hospitals?: string[];
    metroStations?: string[];
    malls?: string[];
  };
  status?: "New" | "In Progress" | "Closed";
  createdAt: string;
  updatedAt: string;
}

export interface AdminEnquiryFilters {
  deal?: string;
  type?: string;
  availability?: string;
  furnishing?: string;
  status?: string;
}

export const enquiryApi = createApi({
  reducerPath: "enquiryApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["AdminEnquiries"],
  endpoints: (builder) => ({
    getAllEnquiries: builder.query<AdminEnquiry[], AdminEnquiryFilters | void>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters || {}).forEach(([key, value]) => {
          if (value) params.set(key, String(value));
        });
        const qs = params.toString();
        // Backend mounts the enquiry router at /api/v1/enquiry (backend/app.js).
        return `/v1/enquiry${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["AdminEnquiries"],
      // NOTE: GET /api/v1/enquiry returns a raw array — no transformResponse needed.
    }),
    updateEnquiryStatus: builder.mutation<
      AdminEnquiry,
      { id: string; status: "New" | "In Progress" | "Closed" }
    >({
      query: ({ id, status }) => ({
        url: `/v1/enquiry/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["AdminEnquiries"],
    }),
  }),
});

export const { useGetAllEnquiriesQuery, useUpdateEnquiryStatusMutation } =
  enquiryApi;
