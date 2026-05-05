import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./api";
import { getApiUrl } from "./propertiesApi";

export async function getJournalBySlugServer(slug: string) {
  const apiUrl = getApiUrl();
  try {
    const response = await fetch(`${apiUrl}/v1/journals/slug/${slug}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (response.status === 404) return null;
    if (!response.ok) {
      console.error(`Journal API Error [${response.status}]`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("getJournalBySlugServer error:", error);
    return null;
  }
}

export interface Journal {
  _id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category: string;
  targetSector: string;
  location?: string;
  coverImage: string;
  slug: string;
  createdAt: string;
}

export interface JournalInput {
  title?: string;
  content?: string;
  author?: string;
  category?: string;
  targetSector?: string;
  location?: string;
  coverImage?: string | File;
  excerpt?: string;
}

export const journalApi = createApi({
  reducerPath: "journalApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Journal"],
  endpoints: (builder) => ({
    // Fetch all journals with optional filtering (category, sector, etc.)
    getJournals: builder.query<Journal[], Record<string, any> | undefined>({
      query: (params) => ({
        url: "/v1/journals",
        params, // Handles ?category=Locality Guide&sector=Sector 115
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }: { _id: string }) => ({
                type: "Journal" as const,
                id: _id,
              })),
              { type: "Journal", id: "LIST" },
            ]
          : [{ type: "Journal", id: "LIST" }],
    }),

    // Fetch single journal by ID
    getJournalById: builder.query<Journal, string>({
      query: (id) => `/v1/journals/${id}`,
      providesTags: (result, error, id) => [{ type: "Journal", id }],
    }),

    // Fetch single journal by Slug (Crucial for SEO-friendly URLs)
    getJournalBySlug: builder.query<Journal, string>({
      query: (slug) => `/v1/journals/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: "Journal", slug }],
    }),

    // Create a new journal post
    createJournal: builder.mutation<Journal, JournalInput>({
      query: (journalData) => {
        const formData = new FormData();
        Object.keys(journalData).forEach((key) => {
          const value = journalData[key as keyof typeof journalData];
          if (key === "coverImage" && value && (value as any) instanceof File) {
            formData.append("coverImage", value);
          } else if (typeof value === "object" && value !== null) {
            formData.append(key, JSON.stringify(value));
          } else if (value !== undefined && value !== null) {
            formData.append(key, value as string | Blob);
          }
        });

        return {
          url: "/v1/journals",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: [{ type: "Journal", id: "LIST" }],
    }),

    // Update an existing journal
    updateJournal: builder.mutation<
      Journal,
      { id: string; update: JournalInput }
    >({
      query: ({ id, update }) => {
        const formData = new FormData();
        Object.keys(update).forEach((key) => {
          const value = update[key as keyof typeof update];
          if (key === "coverImage" && value && (value as any) instanceof File) {
            formData.append("coverImage", value);
          } else if (typeof value === "object" && value !== null) {
            formData.append(key, JSON.stringify(value));
          } else if (value !== undefined && value !== null) {
            formData.append(key, value as string | Blob);
          }
        });

        return {
          url: `/v1/journals/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Journal", id },
        { type: "Journal", id: "LIST" },
      ],
    }),

    // Delete a journal post
    deleteJournal: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/journals/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Journal", id: "LIST" }],
    }),
  }),
});

export const {
  useGetJournalsQuery,
  useGetJournalByIdQuery,
  useGetJournalBySlugQuery,
  useCreateJournalMutation,
  useUpdateJournalMutation,
  useDeleteJournalMutation,
} = journalApi;
