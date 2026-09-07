"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import {
  Edit,
  Trash2,
  Search,
  X,
  CheckCircle,
  Star,
  Shield,
  Tag,
  MapPin,
  Home,
  Building2,
  Warehouse,
  Filter,
  RotateCcw,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetAllPropertiesQuery,
  useDeletePropertyMutation,
  useUpdatePropertyMutation,
} from "@/services/propertiesApi";
import Swal from "sweetalert2";
import { toast } from "sonner";

/* ── Constants ─────────────────────────────────────────────────────────── */
const LISTING_AVAILABILITY = [
  "Available",
  "Fresh",
  "Under offer",
  "Booked",
  "Sold",
  "Rented",
  "Review Required",
  "Non Available",
];

interface PropertyRow {
  _id: string;
  title: string;
  type: string;
  category: string;
  propertyCategory?: string;
  price: number;
  listingAvailability: string;
  deal: string;
  furnishing: string;
  postedBy: string;
  isFeatured: boolean;
  isVerified: boolean;
  isActive: boolean;
  image: string[];
  description: string;
  location: {
    city: string;
    state: string;
    address: string;
  };
}

// Debounce hook for search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Filter chip component
function FilterChip({
  label,
  value,
  onRemove,
  icon: Icon,
}: {
  label: string;
  value: string;
  onRemove: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Badge
      variant="secondary"
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
      <button
        onClick={onRemove}
        className="ml-1 rounded-full hover:bg-blue-200 p-0.5 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}

export default function Properties() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [showListingAvailability, setShowListingAvailability] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    listingAvailability: "",
    deal: "",
    furnishing: "",
    postedBy: "",
    isVerified: "",
    isActive: "",
  });

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const {
    data: propertiesResponse,
    error,
    isLoading,
  } = useGetAllPropertiesQuery({
    includeInactive: "true",
    limit: "500",
  });
  const properties = (propertiesResponse?.data ?? []) as PropertyRow[];
  const [deleteProperty] = useDeletePropertyMutation();
  const [updateProperty, { isLoading: togglingActive }] =
    useUpdatePropertyMutation();

  // ACTIVE FILTERS COUNT - memoized for performance
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (debouncedSearchQuery) count++;
    Object.values(filters).forEach((value) => {
      if (value && value !== "any") count++;
    });
    return count;
  }, [debouncedSearchQuery, filters]);

  // HELPER: Get unique values for filter dropdowns from properties
  const filterOptions = useMemo(() => {
    const emptyResult: {
      types: string[];
      categories: string[];
      availabilities: string[];
      furnishingOptions: string[];
      postedByOptions: string[];
    } = {
      types: [],
      categories: [],
      availabilities: [],
      furnishingOptions: [],
      postedByOptions: [],
    };

    if (!properties.length) return emptyResult;

    const types = [
      ...new Set(properties.map((p) => p.type).filter((t): t is string => !!t)),
    ];
    const categories = [
      ...new Set(
        properties
          .map((p) => p.category || p.propertyCategory)
          .filter((c): c is string => !!c),
      ),
    ];
    const availabilities = [
      ...new Set(
        properties
          .map((p) => p.listingAvailability)
          .filter((a): a is string => !!a),
      ),
    ];
    const furnishingOptions = [
      ...new Set(
        properties.map((p) => p.furnishing).filter((f): f is string => !!f),
      ),
    ];
    const postedByOptions = [
      ...new Set(
        properties.map((p) => p.postedBy).filter((p): p is string => !!p),
      ),
    ];

    return {
      types: types.sort(),
      categories: categories.sort(),
      availabilities: availabilities.sort(),
      furnishingOptions: furnishingOptions.sort(),
      postedByOptions: postedByOptions.sort(),
    };
  }, [properties]);

  // FILTERED PROPERTIES
  const filteredProperties = useMemo(() => {
    if (!properties) return [];

    return properties.filter((property: PropertyRow) => {
      // Search filter (debounced)
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        const matchesSearch =
          property.title?.toLowerCase().includes(query) ||
          property.description?.toLowerCase().includes(query) ||
          property.location?.city?.toLowerCase().includes(query) ||
          property.location?.state?.toLowerCase().includes(query) ||
          property.location?.address?.toLowerCase().includes(query) ||
          property.type?.toLowerCase().includes(query) ||
          property.category?.toLowerCase().includes(query) ||
          property.propertyCategory?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (
        filters.type &&
        filters.type !== "any" &&
        property.type !== filters.type
      )
        return false;

      // Category filter
      if (filters.category && filters.category !== "any") {
        const propertyCategory = property.category || property.propertyCategory;
        if (propertyCategory !== filters.category) return false;
      }

      // Listing Availability filter
      if (
        filters.listingAvailability &&
        filters.listingAvailability !== "any" &&
        property.listingAvailability !== filters.listingAvailability
      )
        return false;

      // Deal filter (Featured/Not Featured)
      if (filters.deal && filters.deal !== "any") {
        if (filters.deal === "featured" && property.deal !== "Featured")
          return false;
        if (filters.deal === "not-featured" && property.deal === "Featured")
          return false;
      }

      // Furnishing filter
      if (
        filters.furnishing &&
        filters.furnishing !== "any" &&
        property.furnishing !== filters.furnishing
      )
        return false;

      // PostedBy filter
      if (
        filters.postedBy &&
        filters.postedBy !== "any" &&
        property.postedBy !== filters.postedBy
      )
        return false;

      // Verified filter
      if (filters.isVerified && filters.isVerified !== "any") {
        const isVerifiedFilter = filters.isVerified === "verified";
        if (isVerifiedFilter !== property.isVerified) return false;
      }

      // Active status filter
      if (filters.isActive && filters.isActive !== "any") {
        if (filters.isActive === "active" && !property.isActive) return false;
        if (filters.isActive === "inactive" && property.isActive) return false;
      }

      return true;
    });
  }, [properties, debouncedSearchQuery, filters]);

  // RESET PAGE WHEN FILTERS CHANGE (DataTable handles pagination internally)

  // DELETE PROPERTY
  const handleDelete = async (id: string, title: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${title}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteProperty(id).unwrap();
      toast.success(`"${title}" has been removed`);
    } catch (err) {
      toast.error("Failed to delete property");
    }
  };

  // EDIT PROPERTY - navigates to the edit page using AdminPropertyForm
  const handleEdit = (id: string) => {
    router.push(`/properties/edit/${id}`);
  };

  // TOGGLE ACTIVE STATUS
  const handleToggleActive = async (property: PropertyRow) => {
    const newStatus = !property.isActive;
    try {
      await updateProperty({
        id: property._id,
        isActive: newStatus,
        title: property.title,
        type: property.type,
        price: property.price,
        description: property.description,
        location: property.location,
        category: property.category,
        listingAvailability: property.listingAvailability,
        deal: property.deal,
        furnishing: property.furnishing,
        postedBy: property.postedBy,
        image: property.image || [],
      }).unwrap();
      toast.success(
        `Property ${newStatus ? "activated" : "deactivated"} successfully`,
      );
    } catch (err) {
      toast.error("Failed to toggle property status");
    }
  };

  // UPDATE LISTING AVAILABILITY
  const handleListingAvailabilityChange = async (
    property: PropertyRow,
    newAvailability: string
  ) => {
    try {
      await updateProperty({
        id: property._id,
        listingAvailability: newAvailability,
        title: property.title,
        type: property.type,
        price: property.price,
        description: property.description,
        location: property.location,
        category: property.category,
        deal: property.deal,
        furnishing: property.furnishing,
        postedBy: property.postedBy,
        image: property.image || [],
      }).unwrap();
      toast.success(`Listing status updated to "${newAvailability}"`);
    } catch (err) {
      toast.error("Failed to update listing status");
    }
  };

  // TOGGLE FEATURED STATUS
  const handleToggleFeatured = async (property: PropertyRow) => {
    const newStatus = !property.isFeatured;
    try {
      await updateProperty({
        id: property._id,
        isFeatured: newStatus,
        title: property.title,
        type: property.type,
        price: property.price,
        description: property.description,
        location: property.location,
        category: property.category,
        listingAvailability: property.listingAvailability,
        deal: property.deal,
        furnishing: property.furnishing,
        postedBy: property.postedBy,
        image: property.image || [],
      }).unwrap();
      toast.success(
        `Property ${newStatus ? "featured" : "unfeatured"} successfully`
      );
    } catch (err) {
      toast.error("Failed to update featured status");
    }
  };

  // TOGGLE VERIFIED STATUS
  const handleToggleVerified = async (property: PropertyRow) => {
    const newStatus = !property.isVerified;
    try {
      await updateProperty({
        id: property._id,
        isVerified: newStatus,
        title: property.title,
        type: property.type,
        price: property.price,
        description: property.description,
        location: property.location,
        category: property.category,
        listingAvailability: property.listingAvailability,
        deal: property.deal,
        furnishing: property.furnishing,
        postedBy: property.postedBy,
        image: property.image || [],
      }).unwrap();
      toast.success(
        `Property ${newStatus ? "verified" : "unverified"} successfully`
      );
    } catch (err) {
      toast.error("Failed to update verified status");
    }
  };

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
              src={row.original.image?.[0] || "/placeholder.png"}
              alt={row.original.title}
              className="h-full w-full object-cover"
            />
          </Link>
          <div>
            <p className="font-medium line-clamp-1">{row.original.title}</p>
            {row.original.location?.city && (
              <p className="text-xs text-muted-foreground">
                {row.original.location.city}
                {row.original.location.state &&
                  `, ${row.original.location.state}`}
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
      accessorKey: "deal",
      header: "Featured",
      enableSorting: true,
      cell: ({ row }) => {
        const property = row.original;
        const isFeatured = property.isFeatured;
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFeatured(property);
            }}
            disabled={togglingActive}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
              isFeatured ? "bg-yellow-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                isFeatured ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="font-semibold">
          ₹{Number(row.getValue("price")).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      accessorKey: "listingAvailability",
      header: "Listing Status",
      enableSorting: true,
      cell: ({ row }) => {
        const property = row.original;
        const listingAvailability = row.getValue(
          "listingAvailability",
        ) as string;
        return (
          <select
            value={listingAvailability || ""}
            onChange={(e) =>
              handleListingAvailabilityChange(property, e.target.value)
            }
            className={`px-2 py-1 rounded-md text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              listingAvailability === "Available"
                ? "bg-green-100 text-green-700"
                : listingAvailability === "Fresh"
                ? "bg-blue-100 text-blue-700"
                : listingAvailability === "Booked"
                ? "bg-orange-100 text-orange-700"
                : listingAvailability === "Sold" || listingAvailability === "Rented"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {LISTING_AVAILABILITY.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      accessorKey: "isVerified",
      header: "Verified",
      enableSorting: true,
      cell: ({ row }) => {
        const property = row.original;
        const isVerified = row.getValue("isVerified") as boolean;
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleVerified(property);
            }}
            disabled={togglingActive}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
              isVerified ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                isVerified ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) => {
        const property = row.original;
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(property);
            }}
            disabled={togglingActive}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              property.isActive ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                property.isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const property = row.original;
        return (
          <div className="flex gap-1">
            <Link href={`/properties/edit/${property._id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => handleDelete(property._id, property.title)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  // CLEAR FILTERS
  const clearFilters = () => {
    setFilters({
      type: "",
      category: "",
      listingAvailability: "",
      deal: "",
      furnishing: "",
      postedBy: "",
      isVerified: "",
      isActive: "",
    });
    setSearchQuery("");
  };

  // HELPER: Get filter display value
  const getFilterDisplayValue = (key: string, value: string): string => {
    const displayMap: Record<string, Record<string, string>> = {
      isVerified: { verified: "Verified", unverified: "Unverified" },
      isActive: { active: "Active", inactive: "Inactive" },
      deal: { featured: "Featured", "not-featured": "Not Featured" },
    };
    return displayMap[key]?.[value] || value;
  };

  // HELPER: Get filter icon
  const getFilterIcon = (key: string) => {
    const iconMap: Record<
      string,
      React.ComponentType<{ className?: string }>
    > = {
      type: Home,
      category: Building2,
      listingAvailability: MapPin,
      deal: Star,
      furnishing: Warehouse,
      postedBy: Tag,
      isVerified: Shield,
      isActive: CheckCircle,
    };
    return iconMap[key];
  };

  // QUICK FILTERS - Preset filter buttons
  const quickFilters = [
    { key: "isActive", value: "active", label: "Active", icon: CheckCircle },
    { key: "isActive", value: "inactive", label: "Inactive", icon: X },
    { key: "isVerified", value: "verified", label: "Verified", icon: Shield },
    { key: "deal", value: "featured", label: "Featured", icon: Star },
  ];

  const handleQuickFilter = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key as keyof typeof prev] === value ? "" : value,
    }));
  };

  // ACTIVE FILTER CHIPS - Show active filters as removable chips
  const activeFilterChips = useMemo(() => {
    const chips: {
      key: string;
      label: string;
      value: string;
      displayValue: string;
    }[] = [];

    if (debouncedSearchQuery) {
      chips.push({
        key: "search",
        label: "Search",
        value: debouncedSearchQuery,
        displayValue: debouncedSearchQuery,
      });
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "any") {
        chips.push({
          key,
          label:
            key.charAt(0).toUpperCase() +
            key.slice(1).replace(/([A-Z])/g, " $1"),
          value,
          displayValue: getFilterDisplayValue(key, value),
        });
      }
    });

    return chips;
  }, [debouncedSearchQuery, filters]);

  const removeFilterChip = (key: string) => {
    if (key === "search") {
      setSearchQuery("");
    } else {
      setFilters((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const filterPanel = showFilters ? (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-6">
        {/* Quick Filters */}
        <div className="mb-6">
          <label className="text-sm font-medium text-slate-700 mb-3 block">
            Quick Filters
          </label>
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((qf) => {
              const isActive =
                filters[qf.key as keyof typeof filters] === qf.value;
              return (
                <Button
                  key={`${qf.key}-${qf.value}`}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickFilter(qf.key, qf.value)}
                  className={`flex items-center gap-1.5 ${
                    isActive
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <qf.icon className="h-3.5 w-3.5" />
                  {qf.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 my-6" />

        {/* Advanced Filters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5 text-slate-500" />
              Property Type
            </label>
            <Select
              value={filters.type || "any"}
              onValueChange={(value) =>
                setFilters({ ...filters, type: value === "any" ? "" : value })
              }
            >
              <SelectTrigger className="bg-white border-slate-300">
                <SelectValue placeholder="Any Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Type</SelectItem>
                {filterOptions.types?.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-slate-500" />
              Category
            </label>
            <Select
              value={filters.category || "any"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  category: value === "any" ? "" : value,
                })
              }
            >
              <SelectTrigger className="bg-white border-slate-300">
                <SelectValue placeholder="Any Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Category</SelectItem>
                {filterOptions.categories?.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Listing Availability with Roll Down Button */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-500" />
              Listing Availability
            </label>
            <button
              type="button"
              onClick={() => setShowListingAvailability(!showListingAvailability)}
              className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-300 rounded-md text-sm hover:bg-slate-50 transition-colors"
            >
              <span className={filters.listingAvailability ? "text-slate-900" : "text-slate-500"}>
                {filters.listingAvailability || "Any Status"}
              </span>
              {showListingAvailability ? (
                <ChevronUp className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              )}
            </button>
            {showListingAvailability && (
              <div className="mt-2 p-3 bg-white border border-slate-200 rounded-md shadow-sm space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setFilters({ ...filters, listingAvailability: "" });
                    setShowListingAvailability(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    !filters.listingAvailability
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  Any Status
                </button>
                {filterOptions.availabilities?.map((avail) => (
                  <button
                    key={avail}
                    type="button"
                    onClick={() => {
                      setFilters({ ...filters, listingAvailability: avail });
                      setShowListingAvailability(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      filters.listingAvailability === avail
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {avail}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-slate-500" />
              Deal Type
            </label>
            <Select
              value={filters.deal || "any"}
              onValueChange={(value) =>
                setFilters({ ...filters, deal: value === "any" ? "" : value })
              }
            >
              <SelectTrigger className="bg-white border-slate-300">
                <SelectValue placeholder="Any Deal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Deal</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="not-featured">Not Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Warehouse className="h-3.5 w-3.5 text-slate-500" />
              Furnishing
            </label>
            <Select
              value={filters.furnishing || "any"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  furnishing: value === "any" ? "" : value,
                })
              }
            >
              <SelectTrigger className="bg-white border-slate-300">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                {filterOptions.furnishingOptions?.map((fur) => (
                  <SelectItem key={fur} value={fur}>
                    {fur}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-slate-500" />
              Posted By
            </label>
            <Select
              value={filters.postedBy || "any"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  postedBy: value === "any" ? "" : value,
                })
              }
            >
              <SelectTrigger className="bg-white border-slate-300">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                {filterOptions.postedByOptions?.map((posted) => (
                  <SelectItem key={posted} value={posted}>
                    {posted}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-slate-500" />
              Verification
            </label>
            <Select
              value={filters.isVerified || "any"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  isVerified: value === "any" ? "" : value,
                })
              }
            >
              <SelectTrigger className="bg-white border-slate-300">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-slate-500" />
              Status
            </label>
            <Select
              value={filters.isActive || "any"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  isActive: value === "any" ? "" : value,
                })
              }
            >
              <SelectTrigger className="bg-white border-slate-300">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {activeFiltersCount > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
            <Button onClick={clearFilters} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Clear All Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  ) : null;

  if (error) return <div>Error loading properties.</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Properties Management
          </h1>
          <p className="text-muted-foreground">
            Manage all properties in the system
          </p>
        </div>

        <Link
          href="/properties/new"
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-white hover:text-primary transition border border-primary"
        >
          <Plus className="h-4 w-4" />
          Add Property
        </Link>
      </div>

      {/* ACTIVE FILTER CHIPS */}
      {activeFilterChips.length > 0 && (
        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-700">
                Active Filters:
              </span>
              {activeFilterChips.map((chip) => (
                <FilterChip
                  key={chip.key}
                  label={chip.label}
                  value={chip.displayValue}
                  onRemove={() => removeFilterChip(chip.key)}
                  icon={
                    chip.key === "search" ? Search : getFilterIcon(chip.key)
                  }
                />
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto text-slate-600 hover:text-slate-900"
              >
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEARCH + FILTER TOGGLE */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by title, description, city, address, type, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-slate-300 focus:border-blue-500"
                />
              </div>

              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 ${showFilters ? "bg-blue-600 text-white" : ""}`}
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 bg-blue-500 text-white"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>
                Showing <strong>{filteredProperties.length}</strong> of{" "}
                <strong>{properties.length}</strong> properties
              </span>
              {activeFiltersCount > 0 && (
                <span className="text-blue-600">
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""}{" "}
                  active
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {filterPanel}

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={filteredProperties}
        isLoading={isLoading}
        loadingRows={10}
        pageSize={200}
      />
    </div>
  );
}
