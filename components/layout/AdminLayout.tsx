"use client";

import { ReactNode, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "./Navbar";
import { cn } from "@/lib/utils";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { useGetCurrentUserQuery } from "@/services/authApi";
import { setUser } from "@/store/authSlice";

// ✅ Make Sidebar client-only
const Sidebar = dynamic(() => import("./Sidebar"), { ssr: false });

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);

  const router = useRouter();
  const dispatch = useDispatch();

  // Fetch current user if we have a token but no user data
  const {
    data: currentUserData,
    isLoading: isUserLoading,
    error,
  } = useGetCurrentUserQuery(undefined, {
    skip: !token || (isAuthenticated && !!user),
    pollingInterval: 300000, // Poll every 5 minutes to keep user data fresh
  });

  // ✅ Ensure client-only render
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Auth redirect AFTER mount
  useEffect(() => {
    if (mounted && !isAuthenticated && !isUserLoading) {
      router.replace("/auth");
    }
  }, [mounted, isAuthenticated, router, isUserLoading]);

  // ✅ Handle user data updates from API
  useEffect(() => {
    if (currentUserData?.user && !user) {
      // If we got user data from API but don't have it in state, update state
      dispatch(setUser({ user: currentUserData.user, token: token || "" }));
    }
  }, [currentUserData, user, token, dispatch]);

  // ✅ Handle authentication errors
  useEffect(() => {
    if (error) {
      console.error("Authentication error:", error);
      // Clear auth state and redirect to login
      dispatch({ type: "auth/clearAuthState" });
      router.replace("/auth");
    }
  }, [error, dispatch, router]);

  // ✅ Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      <div
        className={cn(
          "flex-1 transition-all duration-300",
          isSidebarCollapsed ? "ml-20" : "ml-64",
        )}
      >
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
