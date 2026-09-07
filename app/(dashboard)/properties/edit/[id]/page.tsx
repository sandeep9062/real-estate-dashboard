"use client";

import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import AdminPropertyForm from "@/components/AdminPropertyForm";
import { useGetPropertyQuery } from "@/services/propertiesApi";

/**
 * Admin: standalone "Edit Property" page.
 * Replaces the old EditPropertyModal — PUTs to /api/admin/properties/:id.
 */
export default function EditPropertyPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const { data, isLoading } = useGetPropertyQuery(id, { skip: !id });

  // Backend may return the document directly or wrapped in { data }
  const property = data?.data ?? data;

  if (!id || (!isLoading && !property)) {
    return (
      <div className="space-y-4 text-center py-16">
        <h1 className="text-2xl font-bold text-foreground">
          Property not found
        </h1>
        <Link
          href="/properties"
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to properties
        </Link>
      </div>
    );
  }

  if (isLoading || !property) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <Loader2 className="animate-spin mr-2" size={18} />
        Loading property…
      </div>
    );
  }

  return (
    <AdminPropertyForm mode="edit" propertyId={id} property={property} />
  );
}
