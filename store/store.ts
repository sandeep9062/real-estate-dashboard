// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import { authApi } from "@/services/authApi";
import { propertiesApi } from "@/services/propertiesApi";
import { userApi } from "@/services/userApi";
import { contactApi } from "@/services/contactApi";
import { bookingApi } from "@/services/bookingApi";
import { journalApi } from "@/services/journalApi";
import { dashboardApi } from "@/services/dashboardApi";
import { notificationApi } from "@/services/notificationApi";
import { projectsApi } from "@/services/projectsApi";
import { leadsApi } from "@/services/leadsApi";
import { enquiryApi } from "@/services/enquiryApi";

const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [journalApi.reducerPath]: journalApi.reducer,
    [propertiesApi.reducerPath]: propertiesApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [leadsApi.reducerPath]: leadsApi.reducer,
    [enquiryApi.reducerPath]: enquiryApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      contactApi.middleware,
      propertiesApi.middleware,
      userApi.middleware,
      bookingApi.middleware,
      journalApi.middleware,
      dashboardApi.middleware,
      notificationApi.middleware,
      projectsApi.middleware,
      leadsApi.middleware,
      enquiryApi.middleware,
    ),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
