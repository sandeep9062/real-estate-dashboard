"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Edit, Trash2, Search, Filter, X, Plus, Eye } from "lucide-react";
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
  useGetProjectsQuery,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
} from "@/services/projectsApi";
import Swal from "sweetalert2";
import { toast } from "sonner";
import Link from "next/link";

interface ProjectRow {
  _id: string;
  name: string;
  slug: string;
  description: string;
  projectType: string;
  constructionStatus: string;
  reraNumber?: string;
  isActive: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  location?: {
    city?: string;
    sector?: string;
    address?: string;
  };
  developer?: {
    name?: string;
  };
  pricing?: {
    from?: number;
    to?: number;
  };
  media?: {
    images?: string[];
  };
}

export default function ProjectsList() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    projectType: "",
    constructionStatus: "",
    city: "",
    isActive: "",
    isFeatured: "",
    isVerified: "",
  });

  const { data: projectsResponse, error, isLoading } = useGetProjectsQuery({});
  const projects: ProjectRow[] = Array.isArray(projectsResponse)
    ? (projectsResponse as ProjectRow[])
    : ((projectsResponse as any)?.data ?? []);
  const [deleteProject] = useDeleteProjectMutation();
  const [updateProject, { isLoading: togglingActive }] =
    useUpdateProjectMutation();

  // FILTERED PROJECTS
  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    return projects.filter((project: ProjectRow) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          project.name?.toLowerCase().includes(query) ||
          project.description?.toLowerCase().includes(query) ||
          project.location?.city?.toLowerCase().includes(query) ||
          project.location?.address?.toLowerCase().includes(query) ||
          project.reraNumber?.toLowerCase().includes(query) ||
          project.developer?.name?.toLowerCase().includes(query);

        if (!matchesSearch) return false;
      }

      // Project Type filter
      if (
        filters.projectType &&
        filters.projectType !== "any" &&
        project.projectType !== filters.projectType
      )
        return false;

      // Construction Status filter
      if (
        filters.constructionStatus &&
        filters.constructionStatus !== "any" &&
        project.constructionStatus !== filters.constructionStatus
      )
        return false;

      // City filter
      if (
        filters.city &&
        filters.city !== "any" &&
        project.location?.city !== filters.city
      )
        return false;

      // Active filter
      if (filters.isActive && filters.isActive !== "any") {
        const isActiveFilter = filters.isActive === "active";
        if (isActiveFilter !== project.isActive) return false;
      }

      // Featured filter
      if (filters.isFeatured && filters.isFeatured !== "any") {
        const isFeaturedFilter = filters.isFeatured === "featured";
        if (isFeaturedFilter !== project.isFeatured) return false;
      }

      // Verified filter
      if (filters.isVerified && filters.isVerified !== "any") {
        const isVerifiedFilter = filters.isVerified === "verified";
        if (isVerifiedFilter !== project.isVerified) return false;
      }

      return true;
    });
  }, [projects, searchQuery, filters]);

  // CLEAR FILTERS
  const clearFilters = () => {
    setFilters({
      projectType: "",
      constructionStatus: "",
      city: "",
      isActive: "",
      isFeatured: "",
      isVerified: "",
    });
    setSearchQuery("");
  };

  // COUNT ACTIVE FILTERS
  const activeFiltersCount = useMemo(() => {
    return (
      Object.values(filters).filter(Boolean).length + (searchQuery ? 1 : 0)
    );
  }, [filters, searchQuery]);

  // DELETE PROJECT
  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteProject(id).unwrap();
      toast.success(`"${name}" has been removed`);
    } catch (err) {
      toast.error("Failed to delete project");
    }
  };

  // TOGGLE ACTIVE STATUS
  const handleToggleActive = async (project: ProjectRow) => {
    const newStatus = !project.isActive;
    try {
      await updateProject({
        id: project._id,
        isActive: newStatus,
      }).unwrap();
      toast.success(
        `Project ${newStatus ? "activated" : "deactivated"} successfully`,
      );
    } catch (err) {
      toast.error("Failed to toggle project status");
    }
  };

  const columns: ColumnDef<ProjectRow>[] = [
    {
      accessorKey: "name",
      header: "Name",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-14 rounded overflow-hidden flex-shrink-0 bg-muted">
            <img
              src={row.original.media?.images?.[0] || "/placeholder.png"}
              alt={row.original.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="font-medium line-clamp-1">{row.original.name}</p>
            {row.original.developer?.name && (
              <p className="text-xs text-muted-foreground">
                {row.original.developer.name}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "projectType",
      header: "Type",
      enableSorting: true,
      cell: ({ row }) => (
        <Badge variant="outline" className="border-primary text-primary">
          {row.getValue("projectType")}
        </Badge>
      ),
    },
    {
      id: "location",
      header: "Location",
      enableSorting: false,
      cell: ({ row }) => {
        const loc = row.original.location;
        if (!loc?.city) return "—";
        return (
          <span className="text-muted-foreground">
            {loc.city}
            {loc.sector && ` - ${loc.sector}`}
          </span>
        );
      },
    },
    {
      accessorKey: "constructionStatus",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) => {
        const status = row.getValue("constructionStatus") as string;
        const colorMap: Record<string, string> = {
          "Ready to Move": "bg-green-500",
          "Under Construction": "bg-yellow-500",
          "Newly Launched": "bg-blue-500",
          Upcoming: "bg-purple-500",
        };
        return (
          <Badge className={colorMap[status] || "bg-gray-500"}>{status}</Badge>
        );
      },
    },
    {
      id: "pricing",
      header: "Price Range",
      enableSorting: false,
      cell: ({ row }) => {
        const pricing = row.original.pricing;
        if (!pricing?.from) return "—";
        const from = (pricing.from / 10000000).toFixed(2);
        const to = pricing.to ? (pricing.to / 10000000).toFixed(2) : null;
        return (
          <span className="font-semibold">
            ₹{from} Cr{to ? ` - ₹${to} Cr` : ""}
          </span>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Active",
      enableSorting: true,
      cell: ({ row }) => {
        const project = row.original;
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(project);
            }}
            disabled={togglingActive}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all border-2 ${
              project.isActive === false
                ? "bg-red-100 text-red-700 border-red-400 hover:bg-red-200"
                : "bg-green-100 text-green-700 border-green-400 hover:bg-green-200"
            }`}
          >
            {project.isActive === false ? "Inactive" : "Active"}
          </button>
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
          {row.getValue("isVerified") ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                router.push(`/projects/edit-project/${project.slug}`)
              }
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => handleDelete(project._id, project.name)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  const filterPanel = showFilters ? (
    <Card className="border-slate-200">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Project Type
            </label>
            <Select
              value={filters.projectType}
              onValueChange={(value) =>
                setFilters({ ...filters, projectType: value })
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Any Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Type</SelectItem>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Mixed-Use">Mixed-Use</SelectItem>
                <SelectItem value="Industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Construction Status
            </label>
            <Select
              value={filters.constructionStatus}
              onValueChange={(value) =>
                setFilters({ ...filters, constructionStatus: value })
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
                <SelectItem value="Newly Launched">Newly Launched</SelectItem>
                <SelectItem value="Upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">City</label>
            <Select
              value={filters.city}
              onValueChange={(value) => setFilters({ ...filters, city: value })}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Any City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any City</SelectItem>
                <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                <SelectItem value="Mohali">Mohali</SelectItem>
                <SelectItem value="Panchkula">Panchkula</SelectItem>
                <SelectItem value="Zirakpur">Zirakpur</SelectItem>
                <SelectItem value="New Chandigarh">New Chandigarh</SelectItem>
                <SelectItem value="Kharar">Kharar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <Select
              value={filters.isActive}
              onValueChange={(value) =>
                setFilters({ ...filters, isActive: value })
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Featured
            </label>
            <Select
              value={filters.isFeatured}
              onValueChange={(value) =>
                setFilters({ ...filters, isFeatured: value })
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="not-featured">Not Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Verified
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

  if (error) return <div>Error loading projects.</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Projects Management
          </h1>
          <p className="text-muted-foreground">
            Manage all real estate projects in the system
          </p>
        </div>

        <Link href="/projects/add-project">
          <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-white hover:text-primary transition border border-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Project
          </button>
        </Link>
      </div>

      {/* SEARCH AND FILTERS */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* SEARCH BAR */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by name, description, city, developer, or RERA number..."
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

      {/* RESULTS COUNT */}
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>
          Showing {filteredProjects.length} of {projects?.length || 0} projects
        </span>
        <span className="hidden sm:inline">
          {activeFiltersCount > 0 && `${activeFiltersCount} filters applied`}
        </span>
      </div>

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={filteredProjects}
        isLoading={isLoading}
        loadingRows={10}
        hidePagination
        pageSize={filteredProjects.length || 10}
      />
    </div>
  );
}
