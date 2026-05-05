import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

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

interface AuthState {
  isAuthenticated: boolean;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    image?: string;
    role: string;
    favProperties: any[];
    bookings: any[];
    ownedProperties: any[];
    /** From API: false when account uses OAuth only and has no password yet */
    passwordIsSet?: boolean;
  } | null;
  token: string | null;
}

const initialState: AuthState = (() => {
  if (typeof window === "undefined") {
    return {
      isAuthenticated: false,
      user: null,
      token: null,
    };
  }
  try {
    // Check localStorage first
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");
    if (token && userString) {
      const user = JSON.parse(userString);
      return {
        isAuthenticated: true,
        user,
        token,
      };
    }

    // Fallback to cookies (only check for token, user will be fetched from API)
    const cookieToken = getCookie("accessToken");
    if (cookieToken) {
      // Store cookie token in localStorage for consistency
      localStorage.setItem("token", cookieToken);
      return {
        isAuthenticated: true,
        user: null, // User will be fetched from API when needed
        token: cookieToken,
      };
    }
  } catch (error) {
    console.error("Failed to parse user from localStorage or cookies", error);
  }
  return {
    isAuthenticated: false,
    user: null,
    token: null,
  };
})();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(
      state,
      action: PayloadAction<{
        user: {
          _id: string;
          name: string;
          email: string;
          phone: string;
          image?: string;
          role: string;
          favProperties: any[];
          bookings: any[];
          ownedProperties: any[];
          passwordIsSet?: boolean;
        };
        token: string;
      }>,
    ) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
    },
    logoutSuccess(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    setUser(
      state,
      action: PayloadAction<{
        user: {
          _id: string;
          name: string;
          email: string;
          phone: string;
          image?: string;
          role: string;
          favProperties: any[];
          bookings: any[];
          ownedProperties: any[];
          passwordIsSet?: boolean;
        };
        token: string;
      }>,
    ) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      try {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("token", action.payload.token);
      } catch (e) {
        // ignore storage errors
      }
    },
    clearAuthState(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      try {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } catch (e) {
        // ignore storage errors
      }
    },
  },
});

export const { loginSuccess, logoutSuccess, setUser } = authSlice.actions;

export default authSlice.reducer;

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
