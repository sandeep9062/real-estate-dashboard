"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Edit, Eye, Trash2, Search, Filter, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useGetAllPropertiesQuery,
  useDeletePropertyMutation,
} from "@/services/propertiesApi";
import { Skeleton } from "@/components/ui/skeleton";
import Swal from "sweetalert2";
import AddPropertyModal from "../../../components/AddPropertyModal";
import EditPropertyModal from "../../../components/EditPropertyModal";

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

  const { data: properties, error, isLoading } = useGetAllPropertiesQuery({});
  const [deleteProperty] = useDeletePropertyMutation();

  // FILTERED PROPERTIES
  const filteredProperties = useMemo(() => {
    if (!properties) return [];

    return properties.filter((property: any) => {
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
      if (filters.type && filters.type !== "any" && property.type !== filters.type) return false;

      // Category filter
      if (filters.category && filters.category !== "any") {
        const propertyCategory = property.category || property.propertyCategory;
        if (propertyCategory !== filters.category) return false;
      }

      // Availability filter
      if (filters.availability && filters.availability !== "any" && property.availability !== filters.availability) return false;

      // Deal filter
      if (filters.deal && filters.deal !== "any" && property.deal !== filters.deal) return false;

      // Furnishing filter
      if (filters.furnishing && filters.furnishing !== "any" && property.furnishing !== filters.furnishing) return false;

      // PostedBy filter
      if (filters.postedBy && filters.postedBy !== "any" && property.postedBy !== filters.postedBy) return false;

      // Verified filter
      if (filters.isVerified && filters.isVerified !== "any") {
        const isVerifiedFilter = filters.isVerified === "verified";
        if (isVerifiedFilter !== property.isVerified) return false;
      }

      return true;
    });
  }, [properties, searchQuery, filters]);

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

  // COUNT ACTIVE FILTERS
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(Boolean).length + (searchQuery ? 1 : 0);
  }, [filters, searchQuery]);

  // OPEN ADD PROPERTY MODAL
  const handleAddPropertyClick = () => {
    console.log("Add Property clicked, setting modal to true");
    setModalOpened(true);
  };

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
      Swal.fire("Deleted!", `${title} has been removed.`, "success");
    } catch (err) {
      Swal.fire("Error!", "Failed to delete property", "error");
    }
  };

  // EDIT PROPERTY
  const handleEdit = (id: string) => {
    const propertyToEdit = properties?.find((property: any) => property._id === id);
    if (propertyToEdit) {
      setSelectedProperty(propertyToEdit);
      setEditModalOpened(true);
    }
  };

  // VIEW PROPERTY DETAILS
  const handleView = (id: string) => {
    router.push(`/properties/view/${id}`);
  };

  // LOADING UI
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-5 w-1/4" />
                </div>
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) return <div>Error loading properties.</div>;

  // MAIN PAGE
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
          onClick={handleAddPropertyClick}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-white hover:text-primary transition border border-primary"
        >
          Add Property
        </button>
      </div>

      {/* MODALS */}
      <AddPropertyModal opened={modalOpened} setOpened={setModalOpened} />

      {selectedProperty && (
        <EditPropertyModal
          key={selectedProperty._id} // Force re-mount when different property is selected
          opened={editModalOpened}
          setOpened={setEditModalOpened}
          propertyData={selectedProperty}
          onSuccess={() => {
            // Refresh the properties list after successful edit
            // This will be handled by RTK Query invalidation
            setSelectedProperty(null);
          }}
        />
      )}

      {/* SEARCH AND FILTERS */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* SEARCH BAR */}
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

            {/* FILTER TOGGLE */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-blue-500 text-white">
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

            {/* FILTER OPTIONS */}
            {showFilters && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Property Type</label>
                  <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
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
                  <label className="text-sm font-medium text-slate-700">Category</label>
                  <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
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
                  <label className="text-sm font-medium text-slate-700">Availability</label>
                  <Select value={filters.availability} onValueChange={(value) => setFilters({ ...filters, availability: value })}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Any Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Status</SelectItem>
                      <SelectItem value="Ready to Move">Ready to Move</SelectItem>
                      <SelectItem value="Under Construction">Under Construction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Deal Type</label>
                  <Select value={filters.deal} onValueChange={(value) => setFilters({ ...filters, deal: value })}>
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
                  <label className="text-sm font-medium text-slate-700">Furnishing</label>
                  <Select value={filters.furnishing} onValueChange={(value) => setFilters({ ...filters, furnishing: value })}>
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
                  <label className="text-sm font-medium text-slate-700">Posted By</label>
                  <Select value={filters.postedBy} onValueChange={(value) => setFilters({ ...filters, postedBy: value })}>
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
                  <label className="text-sm font-medium text-slate-700">Verification</label>
                  <Select value={filters.isVerified} onValueChange={(value) => setFilters({ ...filters, isVerified: value })}>
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* RESULTS COUNT */}
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>
          Showing {filteredProperties.length} of {properties?.length || 0} properties
        </span>
        <span className="hidden sm:inline">
          {activeFiltersCount > 0 && `${activeFiltersCount} filters applied`}
        </span>
      </div>

      {/* PROPERTIES GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProperties.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-slate-400 mb-4">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No properties found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        ) : (
          filteredProperties.map((property: any) => (
            <Card
              key={property._id}
              className="group overflow-hidden border border-border bg-card hover:shadow-lg transition-all"
            >
              {/* IMAGE */}
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img
                  src={property.image?.[0] || "/placeholder.png"}
                  alt={property.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />

                <Badge
                  className={`absolute right-2 top-2 ${
                    property.availability === "Ready to Move"
                      ? "bg-green-500"
                      : "bg-yellow-500"
                  }`}
                >
                  {property.availability}
                </Badge>
              </div>

              {/* DETAILS */}
              <CardContent className="p-4">
                <h3 className="mb-2 font-semibold text-foreground line-clamp-1">
                  {property.title}
                </h3>

                <div className="mb-3 flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="border-primary text-primary"
                  >
                    {property.type}
                  </Badge>

                  <span className="text-lg font-bold text-black">
                    ₹{property.price}
                  </span>
                </div>

                {/* BUTTONS */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleView(property._id)}
                  >
                    <Eye className="mr-1 h-3 w-3" /> View
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(property._id)}
                  >
                    <Edit className="mr-1 h-3 w-3" /> Edit
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-white"
                    onClick={() => handleDelete(property._id, property.title)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
