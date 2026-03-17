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
        credentials: "include", // Include cookies in the request
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

            // Try multiple methods to get the token
            let token = null;

            // Method 1: Get from cookies (primary method)
            token = getCookie("accessToken");

            // Method 2: If no cookie, use token from response (fallback)
            if (!token && data.token) {
              token = data.token;
              console.log(
                "⚠️  Using token from response - cookies may not be set yet",
              );
            }

            // Method 3: Check localStorage as last resort
            if (!token) {
              token = localStorage.getItem("token");
              if (token) {
                console.log("⚠️  Using token from localStorage");
              }
            }

            if (token) {
              dispatch(setUser({ user: data.user, token }));
              // Also store in localStorage for consistency
              localStorage.setItem("token", token);
              localStorage.setItem("user", JSON.stringify(data.user));
              console.log(
                "✅ Login successful - token stored:",
                token.substring(0, 20) + "...",
              );
            } else {
              console.error(
                "❌ Login failed - no token found in cookies, response, or localStorage",
              );
              throw new Error("Authentication failed - no token received");
            }
          } else {
            console.error("❌ Login failed - no user data in response");
            throw new Error("Authentication failed - invalid response");
          }
        } catch (error) {
          console.error("Login failed:", error);
          throw error;
        }
      },
    }),
    register: builder.mutation({
      query: (userInfo) => ({
        url: "auth/register",
        method: "POST",
        body: userInfo,
        credentials: "include", // Include cookies in the request
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

            // Try multiple methods to get the token
            let token = null;

            // Method 1: Get from cookies
            token = getCookie("accessToken");

            // Method 2: If no cookie, check if token is in response (fallback)
            if (!token && data.token) {
              token = data.token;
            }

            // Method 3: Check localStorage as last resort
            if (!token) {
              token = localStorage.getItem("token");
            }

            if (token) {
              dispatch(setUser({ user: data.user, token }));
              // Also store in localStorage for consistency
              localStorage.setItem("token", token);
              localStorage.setItem("user", JSON.stringify(data.user));
              console.log(
                "✅ Registration successful - token stored:",
                token.substring(0, 20) + "...",
              );
            } else {
              console.error(
                "❌ Registration failed - no token found in cookies, response, or localStorage",
              );
              throw new Error("Registration failed - no token received");
            }
          } else {
            console.error("❌ Registration failed - no user data in response");
            throw new Error("Registration failed - invalid response");
          }
        } catch (error) {
          console.error("Registration failed:", error);
          throw error;
        }
      },
    }),
    getCurrentUser: builder.query({
      query: () => ({
        url: "auth/me",
        credentials: "include", // Include cookies in the request
      }),
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

            // Try multiple methods to get the token
            let token = null;

            // Method 1: Get from cookies
            token = getCookie("accessToken");

            // Method 2: Check localStorage as fallback
            if (!token) {
              token = localStorage.getItem("token");
            }

            if (token) {
              dispatch(setUser({ user: data.user, token }));
              console.log(
                "✅ User data refreshed - token found:",
                token.substring(0, 20) + "...",
              );
            } else {
              console.warn(
                "⚠️  User data fetched but no token found - user may need to login again",
              );
            }
          }
        } catch (error) {
          console.error("Failed to fetch current user:", error);
          throw error;
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
        credentials: "include", // Include cookies in the request
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
