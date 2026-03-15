import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./api";

// Booking Interface
export interface Booking {
  _id: string;
  date: string;
  property: {
    _id: string;
    title: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface BookingDetails extends Booking {
  userName: string;
  userEmail: string;
  propertyTitle: string;
  status: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  
  bookedVisits: string[];
}

export const bookingApi = createApi({
  reducerPath: "bookingApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Bookings"],

  endpoints: (builder) => ({
    // ✅ 1. Get ALL bookings (Admin)
    getAllBookings: builder.query<User[], void>({
      query: () => `/bookings`,
      providesTags: ["Bookings"],
    }),

    // ✅ Get booking by ID
    getBookingById: builder.query<BookingDetails, string>({
      query: (id) => `/bookings/${id}`,
      providesTags: (result, error, id) => [{ type: "Bookings", id }],
    }),

    // ✅ 2. Get bookings by USER
    getBookingsByUser: builder.query<Booking[], string>({
      query: (userId) => `/bookings/user/${userId}`,
      providesTags: (result, error, userId) => [
        "Bookings",
        { type: "Bookings", userId },
      ],
    }),

    // ✅ 3. Get bookings by PROPERTY
    getBookingsByProperty: builder.query<Booking[], string>({
      query: (propertyId) => `/bookings/property/${propertyId}`,
      providesTags: (result, error, propertyId) => [
        "Bookings",
        { type: "Bookings", propertyId },
      ],
    }),

    // ✅ 4. Cancel booking (user)
    cancelBookingById: builder.mutation<{ success: boolean }, string>({
      query: (bookingId) => ({
        url: `/bookings/${bookingId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Bookings"],
    }),

    // ✅ 5. Admin: Delete any booking
    adminDeleteBooking: builder.mutation<{ success: boolean }, string>({
      query: (bookingId) => ({
        url: `/bookings/${bookingId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Bookings"],
    }),

    // ✅ 6. Admin: Update booking status
    adminUpdateBookingStatus: builder.mutation<
      { success: boolean },
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/bookings/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Bookings"],
    }),
  }),
});

// Export Hooks
export const {
  useGetAllBookingsQuery,
  useGetBookingByIdQuery,
  useGetBookingsByUserQuery,
  useGetBookingsByPropertyQuery,
  useCancelBookingByIdMutation,
  useAdminDeleteBookingMutation,
  useAdminUpdateBookingStatusMutation,
} = bookingApi;
