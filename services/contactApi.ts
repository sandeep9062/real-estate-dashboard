import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ✅ Helper to get token (only client-side)
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/v1/contacts`;

const prepareHeaders = (headers: Headers) => {
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers; // Don't force Content-Type (important for FormData)
};

export const contactApi = createApi({
  reducerPath: "contactApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders,
  }),
  tagTypes: ["Contacts"],
  endpoints: (builder) => ({
    // ✅ GET all contacts
    getContacts: builder.query<any, void>({
      query: () => ``,
      providesTags: ["Contacts"],
    }),

    // ✅ GET single contact by ID
    getContactById: builder.query<any, string>({
      query: (id) => `/${id}`,
      providesTags: ["Contacts"],
    }),

    // ✅ POST new contact (JSON payload)
    addContact: builder.mutation<any, any>({
      query: (body) => ({
        url: ``,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Contacts"],
    }),

    // ✅ UPDATE contact (JSON payload)
    updateContact: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Contacts"],
    }),

    // ✅ DELETE contact
    deleteContact: builder.mutation<any, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Contacts"],
    }),
  }),
});

// ✅ Export hooks
export const {
  useGetContactsQuery,
  useGetContactByIdQuery,
  useAddContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
} = contactApi;
