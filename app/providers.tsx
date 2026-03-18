"use client";

import { StoreProvider } from "../store/StoreProvider";
import { MantineProvider } from "@mantine/core";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider>
      <StoreProvider>{children}</StoreProvider>
    </MantineProvider>
  );
}
