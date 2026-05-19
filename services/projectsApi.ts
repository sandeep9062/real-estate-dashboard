import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./api";
import { getApiUrl } from "./propertiesApi";

export async function getProjectBySlugServer(slug: string) {
  const apiUrl = getApiUrl();
  try {
    const response = await fetch(`${apiUrl}/v1/projects/slug/${slug}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (response.status === 404) return null;
    if (!response.ok) {
      console.error(`Project API Error [${response.status}]`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("getProjectBySlugServer error:", error);
    return null;
  }
}

/**
 * Build a FormData object from a plain project payload.
 * Nested objects are JSON-stringified so the backend can parse them.
 * File arrays are appended individually so multer picks them up.
 */
function buildProjectFormData(data: Record<string, any>): FormData {
  const fd = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (key === "images" && Array.isArray(value)) {
      // Append each File object for multer
      value.forEach((item) => {
        if (item instanceof File) {
          fd.append("images", item);
        }
        // URLs are handled via the media.images JSON field instead
      });
      return;
    }

    if (key === "media" && typeof value === "object" && value !== null) {
      // Extract File objects from media.images and append separately
      const fileUrls: string[] = [];
      if (Array.isArray(value.images)) {
        value.images.forEach((img: any) => {
          if (img instanceof File) {
            fd.append("images", img);
          } else if (typeof img === "string") {
            fileUrls.push(img);
          }
        });
      }
      // Send media with only URL-based images (files are sent separately)
      fd.append("media", JSON.stringify({ ...value, images: fileUrls }));
      return;
    }

    if (
      typeof value === "object" &&
      value !== null &&
      !(value instanceof File)
    ) {
      fd.append(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null) {
      fd.append(key, String(value));
    }
  });

  return fd;
}

export const projectsApi = createApi({
  reducerPath: "projectsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Project"],
  endpoints: (builder) => ({
    getProjects: builder.query({
      query: (params) => ({
        url: "/v1/projects",
        params, // Handles ?city=Mohali&status=Ready
      }),
      providesTags: ["Project"],
    }),
    getProjectById: builder.query({
      query: (id) => `/v1/projects/${id}`,
      providesTags: (result, error, id) => [{ type: "Project", id }],
    }),
    getProjectBySlug: builder.query({
      query: (slug) => {
        console.log("Fetching project with slug:", slug);
        return `/v1/projects/slug/${slug}`;
      },
      providesTags: (result, error, slug) => [{ type: "Project", slug }],
    }),
    createProject: builder.mutation({
      query: (projectData) => {
        const formData = buildProjectFormData(projectData);
        return {
          url: "/v1/projects",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Project"],
    }),
    updateProject: builder.mutation({
      query: ({ id, ...update }) => {
        const formData = buildProjectFormData(update);
        return {
          url: `/v1/projects/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Project", id },
        "Project",
      ],
    }),
    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/v1/projects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Project"],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useGetProjectBySlugQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectsApi;
