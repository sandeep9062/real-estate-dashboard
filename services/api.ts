import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store/store";

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

// Helper function to set cookie (for development/testing)
const setCookie = (name: string, value: string, days: number) => {
  if (typeof document === "undefined") return;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

// Create our baseQuery instance
const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL}`,
  prepareHeaders: (headers, { getState }) => {
    // By default, if we have a token in the store, let's use that for authenticated requests
    const token = (getState() as RootState).auth.token;
    const localStorageToken = localStorage.getItem("token");
    const cookieToken = getCookie("accessToken");

    console.log("BaseQuery - Store token:", token);
    console.log("BaseQuery - LocalStorage token:", localStorageToken);
    console.log("BaseQuery - Cookie token:", cookieToken);

    // Use token from store first, fallback to localStorage, then cookies
    const finalToken = token || localStorageToken || cookieToken;

    if (finalToken) {
      headers.set("authorization", `Bearer ${finalToken}`);
      console.log("BaseQuery - Setting authorization header");
    } else {
      console.log(
        "BaseQuery - No token found, request will be unauthenticated",
      );
    }

    return headers;
  },
});

// Enhanced base query that also handles token storage from responses
export const baseQueryWithAuth = async (
  args: any,
  api: any,
  extraOptions: any,
) => {
  // First, check if we have a token from cookies and store it in localStorage for consistency
  const cookieToken = getCookie("accessToken");
  if (cookieToken && !localStorage.getItem("token")) {
    localStorage.setItem("token", cookieToken);
    console.log("BaseQueryWithAuth - Stored cookie token in localStorage");
  }

  const result = await baseQuery(args, api, extraOptions);

  // If this is a login/register response and we have a user, store the user data
  // Note: The backend sets tokens as cookies, not in the response body
  const data = result.data as any;
  if (data && data.user && !data.token) {
    // Store user data in localStorage for development/testing
    localStorage.setItem("user", JSON.stringify(data.user));

    // Try to get token from cookies and store it in localStorage for consistency
    const cookieToken = getCookie("accessToken");
    if (cookieToken) {
      localStorage.setItem("token", cookieToken);
      console.log("BaseQueryWithAuth - Stored login token in localStorage");
    }
  }

  // Handle token expiration - if we get a 401, try to refresh the token
  if (result.error && result.error.status === 401) {
    console.log("BaseQueryWithAuth - Token expired, attempting refresh");

    // Try to refresh the token
    const refreshResult = await baseQuery(
      { url: "auth/refresh", method: "POST" },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      // Token refresh successful, retry the original request
      console.log(
        "BaseQueryWithAuth - Token refreshed, retrying original request",
      );

      // Store the new token
      const newCookieToken = getCookie("accessToken");
      if (newCookieToken) {
        localStorage.setItem("token", newCookieToken);
      }

      // Retry the original request with the new token
      return baseQuery(args, api, extraOptions);
    } else {
      console.log(
        "BaseQueryWithAuth - Token refresh failed, redirecting to login",
      );
      // Token refresh failed, clear authentication state
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Clear cookies
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

      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
    }
  }

  return result;
};
