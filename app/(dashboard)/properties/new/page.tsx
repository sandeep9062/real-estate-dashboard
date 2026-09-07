"use client";

import AdminPropertyForm from "@/components/AdminPropertyForm";

/**
 * Admin: standalone "Add Property" page.
 * Replaces the old AddPropertyModal — posts to /api/admin/properties.
 */
export default function AddPropertyPage() {
  return <AdminPropertyForm mode="create" />;
}
