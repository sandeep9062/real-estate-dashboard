"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setUser } from "@/store/authSlice";

/**
 * Hook that proactively refreshes the authentication token before it expires.
 *
 * Access tokens expire after 15 minutes. This hook:
 * 1. Refreshes the token every 12 minutes (before the 15-minute expiry)
 * 2. Refreshes immediately when the page becomes visible again (after sleep/tab switch)
 * 3. Updates the Redux store and localStorage with new token values
 * 4. Cleans up when the component unmounts
 */
export function useTokenRefresh() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(0);

  const refreshToken = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000/api";
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.warn("Proactive token refresh failed:", response.status);
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Extract new token from cookies (backend sets httpOnly cookies)
        const getCookie = (name: string): string | null => {
          if (typeof document === "undefined") return null;
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) {
            return parts.pop()?.split(";").shift() || null;
          }
          return null;
        };

        const newToken = getCookie("accessToken") || data.token || token;

        if (data.user) {
          dispatch(setUser({ user: data.user, token: newToken }));
          localStorage.setItem("token", newToken);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else if (user) {
          // Keep existing user, just update token
          localStorage.setItem("token", newToken);
          dispatch(setUser({ user, token: newToken }));
        }

        lastRefreshRef.current = Date.now();
        console.log("Proactive token refresh successful");
      }
    } catch (error) {
      console.warn("Proactive token refresh error:", error);
    }
  }, [isAuthenticated, token, user, dispatch]);

  useEffect(() => {
    // Only run refresh loop when authenticated
    if (!isAuthenticated || !token) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }

    // Refresh token every 12 minutes (before 15-minute expiry)
    // Also run immediately on mount to establish the initial fresh state
    refreshToken();
    refreshIntervalRef.current = setInterval(refreshToken, 12 * 60 * 1000);

    // Handle visibility change (e.g., when user returns after computer sleep)
    // If more than 10 minutes have passed since last refresh, refresh immediately
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const elapsedSinceLastRefresh = Date.now() - lastRefreshRef.current;
        // If more than 10 minutes since last refresh, refresh the token
        // This handles cases like computer sleep where intervals don't fire
        if (elapsedSinceLastRefresh > 10 * 60 * 1000) {
          console.log(
            "Page became visible after long absence, refreshing token",
          );
          refreshToken();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, token, refreshToken]);
}
