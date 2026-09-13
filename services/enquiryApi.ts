import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./api";

/**
 * Enquiry as returned by GET /api/v1/enquiry (the backend returns a raw array,
 * NOT wrapped in { success, count, data } like the leads endpoint).
 */
export interface AdminEnquiry {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  deal?: "Rent" | "Sale";
  type?: "Residential" | "Commercial" | "Industrial" | "Agricultural";
  propertyCategory?: string;
  availability?: "Ready to Move" | "Under Construction";
  furnishing?: string;
  ownershipType?: string;
  city?: string;
  location?: string;
  budget?: string;
  carpetAreaMin?: string;
  carpetAreaMax?: string;
  message?: string;
  purchasePurpose?: string;
  preApprovedLoan?: string;
  needLoanAssistance?: string;
  timeline?: string;
  contactMethod?: string;
  consent?: boolean;
  petsAllowed?: boolean;
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
  createdAt: string;
  updatedAt: string;
}

export interface AdminEnquiryFilters {
  deal?: string;
  type?: string;
  availability?: string;
  furnishing?: string;
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
        return `/enquiry${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["AdminEnquiries"],
      // NOTE: GET /api/v1/enquiry returns a raw array — no transformResponse needed.
    }),
  }),
});

export const { useGetAllEnquiriesQuery } = enquiryApi;
