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
  slug: string;
  slugHistory?: string[];
  category: string;
  tags?: string[];
  excerpt?: string;
  content: string;
  faqs?: Array<{ question: string; answer: string }>;
  coverImage?: string;
  altText?: string;
  coverImageWidth?: number;
  coverImageHeight?: number;
  author?: {
    name: string;
    role?: string;
    avatar?: string;
  };
  targetCity?: string;
  targetSector?: string;
  series?: string;
  articleNumber?: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  noIndex?: boolean;
  relatedSlugs?: string[];
  readingTime?: number;
  wordCount?: number;
  status: "draft" | "published" | "archived";
  publishedAt?: string;
  lastReviewedAt?: string;
  views: number;
  isFeatured: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface JournalInput {
  title?: string;
  slug?: string;
  slugHistory?: string[];
  category?: string;
  tags?: string[];
  excerpt?: string;
  content?: string;
  coverImage?: string | File;
  removeCover?: boolean;
  altText?: string;
  author?:
    | {
        name?: string;
        role?: string;
        avatar?: string;
      }
    | string;
  targetCity?: string;
  targetSector?: string;
  series?: string;
  articleNumber?: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  noIndex?: boolean;
  relatedSlugs?: string[];
  status?: "draft" | "published" | "archived";
  isFeatured?: boolean;
  publishedAt?: string;
  lastReviewedAt?: string;
}

export interface PaginatedJournalsResponse {
  journals: Journal[];
  currentPage: number;
  totalPages: number;
  total: number;
  hasNextPage: boolean;
}

// Builds multipart FormData: File -> as-is, arrays/objects -> JSON,
// booleans/numbers -> strings. undefined/null are skipped.
function buildJournalFormData(input: JournalInput): FormData {
  const formData = new FormData();
  (Object.keys(input) as Array<keyof JournalInput>).forEach((key) => {
    const value = input[key] as unknown;
    if (value === undefined || value === null) return;

    if (value instanceof File) {
      formData.append(key, value);
    } else if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
}

export const journalApi = createApi({
  reducerPath: "journalApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Journal"],
  endpoints: (builder) => ({
    // All non-deleted journals (any status) — admin dashboard
    getJournals: builder.query<
      PaginatedJournalsResponse,
      Record<string, any> | undefined
    >({
      query: (params) => ({
        url: "/v1/journals/all",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.journals.map(({ _id }) => ({
                type: "Journal" as const,
                id: _id,
              })),
              { type: "Journal" as const, id: "LIST" },
            ]
          : [{ type: "Journal" as const, id: "LIST" }],
    }),

    // Admin-only: single journal by id (drafts included)
    getJournalById: builder.query<Journal, string>({
      query: (id) => `/v1/journals/${id}`,
      providesTags: (result, error, id) => [{ type: "Journal", id }],
    }),

    // Public: single journal by slug
    getJournalBySlug: builder.query<Journal, string>({
      query: (slug) => `/v1/journals/slug/${slug}`,
      providesTags: (result, error, slug) => [
        { type: "Journal", id: `slug:${slug}` },
      ],
    }),

    createJournal: builder.mutation<Journal, JournalInput>({
      query: (journalData) => ({
        url: "/v1/journals",
        method: "POST",
        body: buildJournalFormData(journalData),
      }),
      invalidatesTags: [{ type: "Journal", id: "LIST" }],
    }),

    updateJournal: builder.mutation<
      Journal,
      { id: string; update: JournalInput }
    >({
      query: ({ id, update }) => ({
        url: `/v1/journals/${id}`,
        method: "PUT",
        body: buildJournalFormData(update),
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Journal", id },
        { type: "Journal", id: "LIST" },
        ...(result?.slug
          ? [{ type: "Journal" as const, id: `slug:${result.slug}` }]
          : []),
      ],
    }),

    deleteJournal: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/v1/journals/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Journal", id },
        { type: "Journal", id: "LIST" },
      ],
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
