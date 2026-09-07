"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import {
  ArrowLeft,
  Building2,
  Eye,
  MapPin,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllPropertiesQuery } from "@/services/propertiesApi";
import { useGetUserByIdQuery } from "@/services/userApi";

/* ── Helpers ───────────────────────────────────────────────────────────── */
const formatDate = (date?: string | Date | null) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatPrice = (price?: number | null) => {
  if (price == null || Number.isNaN(Number(price))) return "N/A";
  return `₹${Number(price).toLocaleString("en-IN")}`;
};

interface PropertyRow {
  _id: string;
  title: string;
  type: string;
  category: string;
  propertyCategory?: string;
  price: number;
  listingAvailability: string;
  deal: string;
  isFeatured: boolean;
  isVerified: boolean;
  isActive: boolean;
  image: string[] | string;
  createdAt?: string;
  location?: {
    city?: string;
    state?: string;
    address?: string;
  };
  user?: { _id: string; name: string; email?: string; phone?: string } | null;
}

const LISTING_AVAILABILITY_STYLES: Record<string, string> = {
  Available: "bg-green-100 text-green-700",
  Fresh: "bg-blue-100 text-blue-700",
  "Under offer": "bg-amber-100 text-amber-700",
  Booked: "bg-orange-100 text-orange-700",
  Sold: "bg-red-100 text-red-700",
  Rented: "bg-red-100 text-red-700",
  "Review Required": "bg-yellow-100 text-yellow-700",
  "Non Available": "bg-gray-100 text-gray-600",
};

const getListingStyle = (status?: string) =>
  LISTING_AVAILABILITY_STYLES[status ?? ""] || "bg-yellow-100 text-yellow-700";

const getFirstImage = (image?: string[] | string): string | null => {
  if (!image) return null;
  if (typeof image === "string") return image.split(",")[0]?.trim() || null;
  return image[0] || null;
};

export default function UserPropertiesPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const router = useRouter();

  const { data: user } = useGetUserByIdQuery(id, { skip: !id });
  const {
    data: propertiesResponse,
    isLoading: propertiesLoading,
  } = useGetAllPropertiesQuery({ includeInactive: "true", limit: "500" });

  const allProperties = (propertiesResponse?.data ?? []) as PropertyRow[];

  // Client-side filter: properties whose populated `user._id` matches this user
  const properties = useMemo(() => {
    if (!id) return [];
    return allProperties.filter((p) => p.user?._id && String(p.user._id) === String(id));
  }, [allProperties, id]);
const columns: ColumnDef<PropertyRow>[] = [
    {
      accessorKey: "title",
      header: "Title",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Link
            href={`/properties/view/${row.original._id}`}
            className="h-10 w-14 rounded overflow-hidden flex-shrink-0 bg-muted hover:opacity-80 transition-opacity"
          >
            <img
              src={getFirstImage(row.original.image) || "/placeholder.png"}
              alt={row.original.title}
              className="h-full w-full object-cover"
            />
          </Link>
          <div className="min-w-0">
            <Link
              href={`/properties/view/${row.original._id}`}
              className="font-medium line-clamp-1 hover:text-blue-600 hover:underline"
            >
              {row.original.title}
            </Link>
            {row.original.location?.city && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {row.original.location.city}
                {row.original.location.state && `, ${row.original.location.state}`}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      enableSorting: true,
      cell: ({ row }) => (
        <Badge variant="outline" className="border-primary text-primary">
          {row.getValue("type")}
        </Badge>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="font-semibold whitespace-nowrap">
          {formatPrice(Number(row.getValue("price")))}
        </span>
      ),
    },
    {
      accessorKey: "listingAvailability",
      header: "Listing Status",
      enableSorting: true,
      cell: ({ row }) => {
        const status = row.getValue("listingAvailability") as string;
        return (
          <Badge className={`${getListingStyle(status)} border-0`}>
            {status || "—"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isVerified",
      header: "Verified",
      enableSorting: true,
      cell: ({ row }) => {
        const isVerified = Boolean(row.getValue("isVerified"));
        return isVerified ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
            <CheckCircle2 className="h-4 w-4" /> Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
            <XCircle className="h-4 w-4" /> Not verified
          </span>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) => {
        const isActive = Boolean(row.getValue("isActive"));
        return (
          <Badge
            className={`border-0 ${
              isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDate(row.getValue("createdAt"))}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Link href={`/properties/view/${row.original._id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back + header */}
      <div>
        <Button
          variant="ghost"
          className="mb-2 -ml-2 h-8 px-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          onClick={() => router.push("/users")}
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Users
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {user?.name ? `${user.name}'s Properties` : "User Properties"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              All properties listed by this user
              {propertiesLoading ? (
                <span className="text-muted-foreground/60">(loading…)</span>
              ) : (
                <span className="font-medium text-blue-600">({properties.length} total)</span>
              )}
            </p>
          </div>
          {user?.email && (
            <p className="text-sm text-muted-foreground break-all">{user.email}</p>
          )}
        </div>
      </div>

      {/* TABLE */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={properties}
            isLoading={propertiesLoading}
            loadingRows={8}
            pageSize={100}
            globalSearch
            searchPlaceholder="Search user's properties..."
          />
        </CardContent>
      </Card>
    </div>
  );
}