"use client";

import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, Users, MessageCircle, FileText, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  useGetAllLeadsQuery,
  type AdminLead,
  type LeadPropertyLocation,
} from "@/services/leadsApi";
import { Skeleton } from "@/components/ui/skeleton";
import { selectIsAuthenticated, selectUser } from "@/store/authSlice";

const STATUS_BADGE_STYLES: Record<string, string> = {
  // CRM (WhatsApp-click) statuses
  new: "bg-blue-500/20 text-blue-600 border-blue-400/30",
  contacted: "bg-yellow-500/20 text-yellow-600 border-yellow-400/30",
  negotiating: "bg-purple-500/20 text-purple-600 border-purple-400/30",
  closed: "bg-green-500/20 text-green-600 border-green-400/30",
  // Shared
  lost: "bg-red-500/20 text-red-600 border-red-400/30",
  // Legacy brochure-request statuses
  pending: "bg-yellow-500/20 text-yellow-600 border-yellow-400/30",
  converted: "bg-green-500/20 text-green-600 border-green-400/30",
};

/**
 * Safely format a property location for display.
 * `location` can be an embedded object (`{ address, city, state, ... }`)
 * or a legacy plain string. Rendering the object directly in JSX causes
 * "Minified React error #31" (objects are not valid as a React child),
 * so always pass it through this helper.
 */
const formatLocation = (
  location: string | LeadPropertyLocation | null | undefined,
): string => {
  if (!location) return "";
  if (typeof location === "string") return location;

  return [location.address, location.city, location.state, location.country]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
};

const getStatusBadgeStyle = (status: string) =>
  STATUS_BADGE_STYLES[status?.toLowerCase()] ??
  "bg-gray-500/20 text-gray-500 border-gray-400/30";

const SOURCE_LABELS: Record<string, string> = {
  whatsapp_click: "WhatsApp Click",
  WHATSAPP: "WhatsApp",
  WEBSITE: "Website",
  OTHER: "Other",
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatRelative = (dateStr?: string) => {
  if (!dateStr) return "N/A";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return formatDate(dateStr);
};

export default function Leads() {
  const router = useRouter();

  // Admin-only view
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUser)?.role;

  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const {
    data: leads = [],
    isLoading,
    refetch,
  } = useGetAllLeadsQuery(undefined, {
    skip: !isAuthenticated || userRole !== "admin",
  });

  // Redirect if not authenticated
  if (typeof window !== "undefined" && !isAuthenticated) {
    window.location.href = "/auth";
    return null;
  }

  const filteredLeads = useMemo(() => {
    return (leads as AdminLead[]).filter((lead) => {
      const statusMatch =
        statusFilter === "all" ||
        lead.status?.toLowerCase() === statusFilter.toLowerCase();
      const sourceMatch =
        sourceFilter === "all" || lead.source === sourceFilter;
      return statusMatch && sourceMatch;
    });
  }, [leads, statusFilter, sourceFilter]);

  const stats = useMemo(() => {
    const all = leads as AdminLead[];
    return {
      total: all.length,
      whatsappClicks: all.filter((l) => l.source === "whatsapp_click").length,
      brochure: all.filter((l) => l.source !== "whatsapp_click").length,
    };
  }, [leads]);

  const columns: ColumnDef<AdminLead, unknown>[] = [
    {
      accessorKey: "property",
      header: "Property",
      cell: ({ row }) => {
        const property = row.original.property;
        return (
          <div className="max-w-[220px]">
            <p className="font-medium truncate">
              {property?.title || "Deleted property"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {formatLocation(property?.location) ||
                property?.deal ||
                "—"}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "agent",
      header: "Agent",
      cell: ({ row }) => {
        const agent = row.original.agent;
        return (
          <div className="max-w-[180px]">
            <p className="font-medium truncate">{agent?.name || "Unassigned"}</p>
            <p className="text-xs text-muted-foreground truncate">
              {agent?.email || "—"}
            </p>
          </div>
        );
      },
    },
    {
      id: "buyer",
      header: "Buyer",
      cell: ({ row }) => {
        const buyer = row.original.buyer;
        return (
          <div className="max-w-[180px]">
            <p className="font-medium truncate">{buyer?.name || "Anonymous"}</p>
            <p className="text-xs text-muted-foreground truncate">
              {buyer?.phone || "No phone captured"}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => (
        <Badge variant="outline" className="whitespace-nowrap">
          {SOURCE_LABELS[row.original.source] || row.original.source}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={getStatusBadgeStyle(row.original.status)}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "lastActivityAt",
      header: "Last Activity",
      cell: ({ row }) => (
        <div className="text-sm whitespace-nowrap">
          <p>{formatRelative(row.original.lastActivityAt)}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => (
        <p className="max-w-[240px] text-sm text-muted-foreground truncate">
          {row.original.notes || "—"}
        </p>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const slug = row.original.property?.slug;
        if (!slug) return null;
        return (
          <Button
            variant="ghost"
            size="icon"
            title="View listing on propertybulbul.com"
            onClick={() =>
              window.open(
                `https://www.propertybulbul.com/property/${slug}`,
                "_blank",
                "noopener",
              )
            }
          >
            <Eye className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  const statusToolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="contacted">Contacted</SelectItem>
          <SelectItem value="negotiating">Negotiating</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
          <SelectItem value="pending">Pending (legacy)</SelectItem>
          <SelectItem value="converted">Converted (legacy)</SelectItem>
          <SelectItem value="lost">Lost</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sourceFilter} onValueChange={setSourceFilter}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          <SelectItem value="whatsapp_click">WhatsApp Click</SelectItem>
          <SelectItem value="WHATSAPP">WhatsApp (brochure)</SelectItem>
          <SelectItem value="WEBSITE">Website</SelectItem>
          <SelectItem value="OTHER">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-8 p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground">
          All buyer leads generated across the platform — WhatsApp clicks and
          brochure requests
        </p>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="border border-border/40 bg-card/70 p-6 shadow-lg"
            >
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Total Leads" value={stats.total} icon={Users} />
          <StatCard
            title="WhatsApp Clicks"
            value={stats.whatsappClicks}
            icon={MessageCircle}
          />
          <StatCard
            title="Brochure Requests"
            value={stats.brochure}
            icon={FileText}
          />
        </div>
      )}

      {/* Table */}
      <Card className="border border-border/50 backdrop-blur-xl bg-card/60 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lead List</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <Clock className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={filteredLeads}
            isLoading={isLoading}
            loadingRows={6}
            globalSearch
            searchPlaceholder="Search by agent, buyer or property..."
            toolbar={statusToolbar}
            pageSize={10}
            emptyMessage="No leads yet. Leads appear here when buyers click WhatsApp Connect on a listing or request a brochure."
          />
        </CardContent>
      </Card>
    </div>
  );
}

/* Small reusable card */
function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <Card className="border border-border/40 bg-card/70 p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h2 className="text-3xl font-bold">{value}</h2>
        </div>
        <Icon className="h-8 w-8 text-primary" />
      </div>
    </Card>
  );
}
