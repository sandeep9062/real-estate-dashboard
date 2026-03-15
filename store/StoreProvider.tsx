"use client";
import { useEffect } from "react";
import { Provider } from "react-redux";
import store from "./store";
import { setUser } from "./authSlice";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (user && token) {
      store.dispatch(setUser({ user: JSON.parse(user), token }));
    }
  }, []);
  return <Provider store={store}>{children}</Provider>;
}
