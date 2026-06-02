"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Edit, Eye, Trash2, Search, Filter, X } from "lucide-react";
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
import AddPropertyModal from "../../../components/AddPropertyModal";
import EditPropertyModal from "../../../components/EditPropertyModal";

interface PropertyRow {
  _id: string;
  title: string;
  type: string;
  category: string;
  propertyCategory?: string;
  price: number;
  availability: string;
  deal: string;
  furnishing: string;
  postedBy: string;
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

export default function Properties() {
  const router = useRouter();
  const [modalOpened, setModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    availability: "",
    deal: "",
    furnishing: "",
    postedBy: "",
    isVerified: "",
  });

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

  // FILTERED PROPERTIES
  const filteredProperties = useMemo(() => {
    if (!properties) return [];

    return properties.filter((property: PropertyRow) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          property.title?.toLowerCase().includes(query) ||
          property.description?.toLowerCase().includes(query) ||
          property.location?.city?.toLowerCase().includes(query) ||
          property.location?.state?.toLowerCase().includes(query) ||
          property.location?.address?.toLowerCase().includes(query);
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

      // Availability filter
      if (
        filters.availability &&
        filters.availability !== "any" &&
        property.availability !== filters.availability
      )
        return false;

      // Deal filter
      if (
        filters.deal &&
        filters.deal !== "any" &&
        property.deal !== filters.deal
      )
        return false;

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

      return true;
    });
  }, [properties, searchQuery, filters]);

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

  // EDIT PROPERTY
  const handleEdit = (id: string) => {
    const propertyToEdit = properties?.find(
      (property: PropertyRow) => property._id === id,
    );
    if (propertyToEdit) {
      setSelectedProperty(propertyToEdit);
      setEditModalOpened(true);
    }
  };

  // VIEW PROPERTY DETAILS
  const handleView = (id: string) => {
    router.push(`/properties/view/${id}`);
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
        availability: property.availability,
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

  const columns: ColumnDef<PropertyRow>[] = [
    {
      accessorKey: "title",
      header: "Title",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-14 rounded overflow-hidden flex-shrink-0 bg-muted">
            <img
              src={row.original.image?.[0] || "/placeholder.png"}
              alt={row.original.title}
              className="h-full w-full object-cover"
            />
          </div>
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
      header: "Deal",
      enableSorting: true,
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
      accessorKey: "availability",
      header: "Availability",
      enableSorting: true,
      cell: ({ row }) => {
        const availability = row.getValue("availability") as string;
        return (
          <Badge
            className={
              availability === "Ready to Move"
                ? "bg-green-500"
                : "bg-yellow-500"
            }
          >
            {availability}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isVerified",
      header: "Verified",
      enableSorting: true,
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("isVerified") ? "default" : "secondary"}
          className={
            row.getValue("isVerified")
              ? "bg-green-500/20 text-green-600"
              : "bg-gray-500/20 text-gray-500"
          }
        >
          {row.getValue("isVerified") ? "Verified" : "Unverified"}
        </Badge>
      ),
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
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all border-2 ${
              property.isActive === false
                ? "bg-red-100 text-red-700 border-red-400 hover:bg-red-200"
                : "bg-green-100 text-green-700 border-green-400 hover:bg-green-200"
            }`}
          >
            {property.isActive === false ? "Inactive" : "Active"}
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleView(property._id)}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleEdit(property._id)}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
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

  // ACTIVE FILTERS COUNT
  const activeFiltersCount = useMemo(() => {
    return (
      Object.values(filters).filter(Boolean).length + (searchQuery ? 1 : 0)
    );
  }, [filters, searchQuery]);

  // CLEAR FILTERS
  const clearFilters = () => {
    setFilters({
      type: "",
      category: "",
      availability: "",
      deal: "",
      furnishing: "",
      postedBy: "",
      isVerified: "",
    });
    setSearchQuery("");
  };

  const filterPanel = showFilters ? (
    <Card className="border-slate-200">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Property Type
            </label>
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Any Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Type</SelectItem>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Category
            </label>
            <Select
              value={filters.category}
              onValueChange={(value) =>
                setFilters({ ...filters, category: value })
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Any Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Category</SelectItem>
                <SelectItem value="Apartment/Flat">Apartment/Flat</SelectItem>
                <SelectItem value="House/Villa">House/Villa</SelectItem>
                <SelectItem value="Land/Plot">Land/Plot</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
                <SelectItem value="Office">Office</SelectItem>
                <SelectItem value="Industrial">Industrial</SelectItem>
                <SelectItem value="Warehouse">Warehouse</SelectItem>
                <SelectItem value="Shop/Showroom">Shop/Showroom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Availability
            </label>
            <Select
              value={filters.availability}
              onValueChange={(value) =>
                setFilters({ ...filters, availability: value })
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Any Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Status</SelectItem>
                <SelectItem value="Ready to Move">Ready to Move</SelectItem>
                <SelectItem value="Under Construction">
                  Under Construction
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Deal Type
            </label>
            <Select
              value={filters.deal}
              onValueChange={(value) => setFilters({ ...filters, deal: value })}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Any Deal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Deal</SelectItem>
                <SelectItem value="Rent">Rent</SelectItem>
                <SelectItem value="Sale">Sale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Furnishing
            </label>
            <Select
              value={filters.furnishing}
              onValueChange={(value) =>
                setFilters({ ...filters, furnishing: value })
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="Furnished">Furnished</SelectItem>
                <SelectItem value="Semi Furnished">Semi Furnished</SelectItem>
                <SelectItem value="Un-Furnished">Un-Furnished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Posted By
            </label>
            <Select
              value={filters.postedBy}
              onValueChange={(value) =>
                setFilters({ ...filters, postedBy: value })
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="Owner">Owner</SelectItem>
                <SelectItem value="Agent">Agent</SelectItem>
                <SelectItem value="Builder">Builder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Verification
            </label>
            <Select
              value={filters.isVerified}
              onValueChange={(value) =>
                setFilters({ ...filters, isVerified: value })
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={clearFilters} variant="outline" className="w-full">
              Clear Filters
            </Button>
          </div>
        </div>
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

        <button
          onClick={() => setModalOpened(true)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-white hover:text-primary transition border border-primary"
        >
          Add Property
        </button>
      </div>

      {/* MODALS */}
      <AddPropertyModal opened={modalOpened} setOpened={setModalOpened} />

      {selectedProperty && (
        <EditPropertyModal
          key={selectedProperty._id}
          opened={editModalOpened}
          setOpened={setEditModalOpened}
          propertyData={selectedProperty}
          onSuccess={() => {
            setSelectedProperty(null);
          }}
        />
      )}

      {/* SEARCH + FILTER TOGGLE */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by title, description, city, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-slate-300 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
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

              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-slate-600 hover:text-slate-900"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear all
                </Button>
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
        pageSize={50}
      />
    </div>
  );
}
