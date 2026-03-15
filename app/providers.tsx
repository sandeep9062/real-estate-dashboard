"use client";

import { StoreProvider } from "../store/StoreProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>{children}</StoreProvider>
  );
}
