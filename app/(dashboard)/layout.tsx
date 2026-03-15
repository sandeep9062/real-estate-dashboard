import AdminLayout from "@/components/layout/AdminLayout";
import { StoreProvider } from "@/store/StoreProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <AdminLayout>{children}</AdminLayout>
    </StoreProvider>
  );
}
