import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryApi, BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store/store";
import { setUser } from "../store/authSlice";

// Helper function to get cookie value
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
};

// Token refresh mutex to prevent concurrent refresh attempts
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Create our baseQuery instance
const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL}`,
  credentials: "include", // Always include cookies in requests
  prepareHeaders: (headers, { getState }) => {
    // By default, if we have a token in the store, let's use that for authenticated requests
    const token = (getState() as RootState).auth.token;
    const localStorageToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const cookieToken = getCookie("accessToken");

    // Use token from store first, fallback to localStorage, then cookies
    const finalToken = token || localStorageToken || cookieToken;

    if (finalToken) {
      headers.set("authorization", `Bearer ${finalToken}`);
    }

    return headers;
  },
});

/**
 * Store tokens from login/refresh responses in both localStorage and Redux
 */
const storeAuthResult = async (
  api: BaseQueryApi,
  data: { user?: any; token?: string } | undefined,
) => {
  if (!data || !data.user) return null;

  const cookieToken = getCookie("accessToken");
  const responseToken = data.token;
  const newToken = cookieToken || responseToken;

  if (newToken) {
    // Update localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    // Update Redux store
    api.dispatch(setUser({ user: data.user, token: newToken }));

    return newToken;
  }

  return null;
};

// Enhanced base query that also handles token storage from responses
export const baseQueryWithAuth: BaseQueryFn = async (
  args: any,
  api: BaseQueryApi,
  extraOptions: any,
) => {
  // Sync cookie token to localStorage if needed
  const cookieToken = getCookie("accessToken");
  if (
    cookieToken &&
    typeof window !== "undefined" &&
    !localStorage.getItem("token")
  ) {
    localStorage.setItem("token", cookieToken);
  }

  const result = await baseQuery(args, api, extraOptions);

  // If this is a login/register/refresh response with user data, store it
  const data = result.data as any;
  if (data && data.user) {
    await storeAuthResult(api, data);
  }

  // Handle token expiration - if we get a 401, try to refresh the token
  if (result.error && result.error.status === 401) {
    console.log("BaseQueryWithAuth - Token expired, attempting refresh");

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        // Try to refresh the token
        const refreshResult = await baseQuery(
          { url: "auth/refresh", method: "POST" },
          api,
          extraOptions,
        );

        const refreshData = refreshResult.data as any;

        if (refreshData && refreshData.success !== false) {
          // Token refresh successful
          const newCookieToken = getCookie("accessToken");
          const newToken = newCookieToken || refreshData.token;

          if (newToken) {
            // Store in localStorage
            if (typeof window !== "undefined") {
              localStorage.setItem("token", newToken);
              if (refreshData.user) {
                localStorage.setItem("user", JSON.stringify(refreshData.user));
                api.dispatch(
                  setUser({ user: refreshData.user, token: newToken }),
                );
              }
            }

            // Notify all queued requests that refresh completed
            onRefreshed(newToken);

            // Retry the original request with the new token
            isRefreshing = false;
            return baseQuery(args, api, extraOptions);
          }
        }

        // Token refresh failed
        isRefreshing = false;
        refreshSubscribers = [];
        console.log(
          "BaseQueryWithAuth - Token refresh failed, redirecting to login",
        );

        // Clear authentication state
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }

        // Clear cookies
        if (typeof document !== "undefined") {
          document.cookie =
            "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=propertybulbul.com";
          document.cookie =
            "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=propertybulbul.com";
          document.cookie =
            "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
          document.cookie =
            "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        }

        // Redirect to login page
        if (typeof window !== "undefined") {
          window.location.href = "/auth";
        }
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];
        console.error("BaseQueryWithAuth - Refresh error:", refreshError);
      }
    } else {
      // Another refresh is already in progress, queue this request
      console.log("BaseQueryWithAuth - Refresh in progress, queuing request");
      return new Promise((resolve) => {
        addRefreshSubscriber((newToken: string) => {
          // Retry the original request with the new token
          resolve(baseQuery(args, api, extraOptions));
        });
      });
    }
  }

  return result;
};
