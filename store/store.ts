
// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import { authApi } from "@/services/authApi";
import { propertiesApi } from "@/services/propertiesApi";
import { userApi } from "@/services/userApi";
import { contactApi } from "@/services/contactApi";
import { bookingApi } from "@/services/bookingApi";
import { dashboardApi } from "@/services/dashboardApi";
import { notificationApi } from "@/services/notificationApi";
const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [propertiesApi.reducerPath]: propertiesApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      contactApi.middleware,
      propertiesApi.middleware,
      userApi.middleware,
      bookingApi.middleware,
      dashboardApi.middleware,
      notificationApi.middleware
    ),
  devTools: process.env.NODE_ENV !== "production", // ✅ enable Redux DevTools in development
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
