import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./api";
import { setUser } from "../store/authSlice";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(credentials, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // The backend sets cookies and returns user data
          if (data && data.user) {
            // Get token from cookies (backend sets it)
            const getCookie = (name: string): string | null => {
              if (typeof document === "undefined") return null;
              const value = `; ${document.cookie}`;
              const parts = value.split(`; ${name}=`);
              if (parts.length === 2) {
                return parts.pop()?.split(";").shift() || null;
              }
              return null;
            };

            const token = getCookie("accessToken");
            if (token) {
              dispatch(setUser({ user: data.user, token }));
            } else {
              // Fallback: try to get token from localStorage if cookies aren't available
              const localStorageToken = localStorage.getItem("token");
              if (localStorageToken) {
                dispatch(
                  setUser({ user: data.user, token: localStorageToken }),
                );
              }
            }
          }
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
    }),
    register: builder.mutation({
      query: (userInfo) => ({
        url: "auth/register",
        method: "POST",
        body: userInfo,
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(userInfo, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // The backend sets cookies and returns user data
          if (data && data.user) {
            // Get token from cookies (backend sets it)
            const getCookie = (name: string): string | null => {
              if (typeof document === "undefined") return null;
              const value = `; ${document.cookie}`;
              const parts = value.split(`; ${name}=`);
              if (parts.length === 2) {
                return parts.pop()?.split(";").shift() || null;
              }
              return null;
            };

            const token = getCookie("accessToken");
            if (token) {
              dispatch(setUser({ user: data.user, token }));
            } else {
              // Fallback: try to get token from localStorage if cookies aren't available
              const localStorageToken = localStorage.getItem("token");
              if (localStorageToken) {
                dispatch(
                  setUser({ user: data.user, token: localStorageToken }),
                );
              }
            }
          }
        } catch (error) {
          console.error("Registration failed:", error);
        }
      },
    }),
    getCurrentUser: builder.query({
      query: () => "auth/me",
      providesTags: ["User"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data && data.user) {
            // Get token from cookies (backend sets it)
            const getCookie = (name: string): string | null => {
              if (typeof document === "undefined") return null;
              const value = `; ${document.cookie}`;
              const parts = value.split(`; ${name}=`);
              if (parts.length === 2) {
                return parts.pop()?.split(";").shift() || null;
              }
              return null;
            };

            const token = getCookie("accessToken");
            if (token) {
              dispatch(setUser({ user: data.user, token }));
            } else {
              // Fallback: try to get token from localStorage if cookies aren't available
              const localStorageToken = localStorage.getItem("token");
              if (localStorageToken) {
                dispatch(
                  setUser({ user: data.user, token: localStorageToken }),
                );
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch current user:", error);
        }
      },
    }),
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: "auth/change-password",
        method: "POST",
        body: passwordData,
      }),
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Clear cookies manually
          if (typeof document !== "undefined") {
            document.cookie =
              "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=propertybulbul.com";
            document.cookie =
              "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=propertybulbul.com";
            // Also clear without domain for localhost development
            document.cookie =
              "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
            document.cookie =
              "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
          }
          // Use logoutSuccess instead of setUser for logout
          const { logoutSuccess } = await import("../store/authSlice");
          dispatch(logoutSuccess());
        } catch (error) {
          console.error("Logout failed:", error);
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useChangePasswordMutation,
  useLogoutMutation,
} = authApi;
