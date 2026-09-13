"use client";

import { useState, useMemo, type ReactNode } from "react";
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
import { Users, Home, Key, Clock, Building2, Eye, Share2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetAllEnquiriesQuery,
  useUpdateEnquiryStatusMutation,
  type AdminEnquiry,
} from "@/services/enquiryApi";
import { Skeleton } from "@/components/ui/skeleton";

const DEAL_BADGE_STYLES: Record<string, string> = {
  Rent: "bg-blue-500/20 text-blue-600 border-blue-400/30",
  Sale: "bg-green-500/20 text-green-600 border-green-400/30",
};

const TYPE_BADGE_STYLES: Record<string, string> = {
  Residential: "bg-purple-500/20 text-purple-600 border-purple-400/30",
  Commercial: "bg-orange-500/20 text-orange-600 border-orange-400/30",
  Industrial: "bg-yellow-500/20 text-yellow-600 border-yellow-400/30",
  Agricultural: "bg-emerald-500/20 text-emerald-600 border-emerald-400/30",
};

const AVAILABILITY_BADGE_STYLES: Record<string, string> = {
  "Ready to Move": "bg-green-500/20 text-green-600 border-green-400/30",
  "Under Construction": "bg-amber-500/20 text-amber-600 border-amber-400/30",
};

const STATUS_BADGE_STYLES: Record<string, string> = {
  New: "bg-blue-500/20 text-blue-600 border-blue-400/30",
  "In Progress": "bg-amber-500/20 text-amber-600 border-amber-400/30",
  Closed: "bg-green-500/20 text-green-600 border-green-400/30",
};

const getDealBadgeStyle = (deal: string) =>
  DEAL_BADGE_STYLES[deal] ?? "bg-gray-500/20 text-gray-500 border-gray-400/30";

const getTypeBadgeStyle = (type: string) =>
  TYPE_BADGE_STYLES[type] ?? "bg-gray-500/20 text-gray-500 border-gray-400/30";

const getAvailabilityBadgeStyle = (availability: string) =>
  AVAILABILITY_BADGE_STYLES[availability] ??
  "bg-gray-500/20 text-gray-500 border-gray-400/30";

const getStatusBadgeStyle = (status: string) =>
  STATUS_BADGE_STYLES[status] ?? "bg-gray-500/20 text-gray-500 border-gray-400/30";

const formatRelative = (dateStr?: string) => {
  if (!dateStr) return "N/A";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return minutes + " min ago";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + " hour" + (hours > 1 ? "s" : "") + " ago";
  const days = Math.floor(hours / 24);
  if (days < 30) return days + " day" + (days > 1 ? "s" : "") + " ago";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const summarizeFacilities = (facilities: AdminEnquiry["facilities"]) => {
  if (!facilities) return "—";
  const parts: string[] = [];
  if (facilities.bedrooms != null) parts.push(facilities.bedrooms + " BHK");
  if (facilities.bathrooms != null) parts.push(facilities.bathrooms + " Bath");
  if (facilities.parkings != null) parts.push(facilities.parkings + " Park");
  return parts.length ? parts.join(" · ") : "—";
};

/** Build a WhatsApp-friendly summary of an enquiry to share with agents/builders. */
const buildShareText = (e: AdminEnquiry): string => {
  const lines = [
    "🏠 *Property Requirement — PropertyBulbul*",
    `👤 *Name:* ${e.fullName || "—"}`,
    `📞 *Phone:* ${e.phone || "—"}`,
    `✉️ *Email:* ${e.email || "—"}`,
    `💼 *Deal:* ${e.deal || "—"}`,
    `🏷️ *Type:* ${e.type || "—"}`,
    e.propertyCategory ? `📂 *Category:* ${e.propertyCategory}` : "",
    `📍 *Location:* ${e.location || "—"}`,
    e.budget ? `💰 *Budget:* ${e.budget}` : "",
    e.timeline ? `⏱️ *Timeline:* ${e.timeline}` : "",
    e.availability ? `🏗️ *Availability:* ${e.availability}` : "",
    e.furnishing ? `🛋️ *Furnishing:* ${e.furnishing}` : "",
  ].filter(Boolean);
  return lines.join("\n");
};

/** Open WhatsApp with the enquiry summary pre-filled. */
const shareOnWhatsApp = (e: AdminEnquiry) => {
  window.open(
    `https://wa.me/?text=${encodeURIComponent(buildShareText(e))}`,
    "_blank",
    "noopener",
  );
};

function DetailRow({ label, value }: { label: string; value?: ReactNode }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium break-words">{value}</span>
    </div>
  );
}

function listOf(value?: string | string[]): string {
  if (!value) return "";
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return value;
}

function EnquiryDetailsDialog({
  enquiry,
  onClose,
}: {
  enquiry: AdminEnquiry | null;
  onClose: () => void;
}) {
  const [updateStatus, { isLoading: updating }] = useUpdateEnquiryStatusMutation();

  return (
    <Dialog open={!!enquiry} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        {enquiry && (
          <>
            <DialogHeader>
              <DialogTitle className="flex flex-wrap items-center gap-2">
                {enquiry.fullName || "Enquiry"}
                {enquiry.status && (
                  <Badge
                    variant="outline"
                    className={getStatusBadgeStyle(enquiry.status)}
                  >
                    {enquiry.status}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                {[enquiry.deal, enquiry.type, enquiry.location]
                  .filter(Boolean)
                  .join(" · ") || "Property requirement"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <section className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Status
                </h4>
                <div className="flex items-center gap-2">
                  <Select
                    value={enquiry.status || "New"}
                    onValueChange={(status) =>
                      updateStatus({
                        id: enquiry._id,
                        status: status as "New" | "In Progress" | "Closed",
                      })
                    }
                  >
                    <SelectTrigger className="w-[180px]" disabled={updating}>
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareOnWhatsApp(enquiry)}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </section>

              <section className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Personal
                </h4>
                <DetailRow label="Name" value={enquiry.fullName} />
                <DetailRow label="Phone" value={enquiry.phone} />
                <DetailRow label="Email" value={enquiry.email} />
                <DetailRow label="Location" value={enquiry.location} />
              </section>

              <section className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Property Preferences
                </h4>
                <DetailRow label="Deal" value={enquiry.deal} />
                <DetailRow label="Type" value={enquiry.type} />
                <DetailRow label="Category" value={enquiry.propertyCategory} />
                <DetailRow label="Availability" value={enquiry.availability} />
                <DetailRow label="Furnishing" value={enquiry.furnishing} />
                <DetailRow label="Ownership" value={enquiry.ownershipType} />
                <DetailRow label="Budget" value={enquiry.budget} />
                <DetailRow
                  label="Carpet Area"
                  value={
                    enquiry.carpetAreaMin || enquiry.carpetAreaMax
                      ? `${enquiry.carpetAreaMin || "?"} – ${enquiry.carpetAreaMax || "?"} sq.ft`
                      : undefined
                  }
                />
                <DetailRow label="Amenities" value={listOf(enquiry.amenities)} />
                <DetailRow label="Pets Allowed" value={enquiry.petsAllowed ? "Yes" : "No"} />
                <DetailRow label="RERA Only" value={enquiry.reraOnly ? "Yes" : "No"} />
              </section>

              <section className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  House Rules
                </h4>
                <DetailRow
                  label="Owner on premises"
                  value={enquiry.houseRules?.ownerLivesOnPremises ? "Yes" : "No"}
                />
                <DetailRow
                  label="Curfew"
                  value={
                    enquiry.houseRules?.curfew?.hasCurfew
                      ? enquiry.houseRules.curfew.time || "Yes"
                      : "No"
                  }
                />
                <DetailRow
                  label="Opposite gender guests"
                  value={enquiry.houseRules?.oppositeGenderGuestsAllowed}
                />
                <DetailRow
                  label="Overnight guests"
                  value={enquiry.houseRules?.overnightGuestsAllowed}
                />
                <DetailRow
                  label="Smoking allowed"
                  value={enquiry.houseRules?.smokingAllowedOnPremises ? "Yes" : "No"}
                />
                <DetailRow
                  label="Drinking allowed"
                  value={enquiry.houseRules?.drinkingAllowedOnPremises ? "Yes" : "No"}
                />
              </section>

              <section className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Facilities
                </h4>
                <DetailRow label="Bedrooms" value={enquiry.facilities?.bedrooms} />
                <DetailRow label="Bathrooms" value={enquiry.facilities?.bathrooms} />
                <DetailRow label="Parkings" value={enquiry.facilities?.parkings} />
                <DetailRow label="Servant rooms" value={enquiry.facilities?.servantRooms} />
                <DetailRow label="Balconies" value={enquiry.facilities?.balconies} />
                <DetailRow label="Parking type" value={enquiry.facilities?.parkingType} />
                <DetailRow label="Security" value={listOf(enquiry.facilities?.securityFeatures)} />
                <DetailRow label="Water supply" value={enquiry.facilities?.waterSupply} />
                <DetailRow
                  label="Power backup"
                  value={enquiry.facilities?.powerBackup ? "Yes" : "No"}
                />
                <DetailRow label="Total floors" value={enquiry.facilities?.totalFloors} />
              </section>

              <section className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Nearby Places
                </h4>
                <DetailRow label="Schools" value={listOf(enquiry.nearbyPlaces?.schools)} />
                <DetailRow label="Hospitals" value={listOf(enquiry.nearbyPlaces?.hospitals)} />
                <DetailRow
                  label="Metro stations"
                  value={listOf(enquiry.nearbyPlaces?.metroStations)}
                />
                <DetailRow label="Malls" value={listOf(enquiry.nearbyPlaces?.malls)} />
              </section>

              <section className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Financial &amp; Intent
                </h4>
                <DetailRow label="Income" value={enquiry.income} />
                <DetailRow label="Pre-approved loan" value={enquiry.preApprovedLoan} />
                <DetailRow
                  label="Loan assistance"
                  value={enquiry.needLoanAssistance ? "Yes" : "No"}
                />
                <DetailRow label="Purchase purpose" value={enquiry.purchasePurpose} />
                <DetailRow label="Timeline" value={enquiry.timeline} />
              </section>

              <section className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Communication
                </h4>
                <DetailRow label="Callback time" value={enquiry.callbackTime} />
                <DetailRow label="Source" value={enquiry.source} />
                <DetailRow label="Message" value={enquiry.message} />
                <DetailRow label="Consent" value={enquiry.consentGiven ? "Yes" : "No"} />
                <DetailRow label="Submitted" value={formatRelative(enquiry.createdAt)} />
              </section>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
export default function Enquiries() {
  const [dealFilter, setDealFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEnquiry, setSelectedEnquiry] = useState<AdminEnquiry | null>(
    null,
  );

  const filters = useMemo(() => {
    const f: Record<string, string> = {};
    if (dealFilter !== "all") f.deal = dealFilter;
    if (typeFilter !== "all") f.type = typeFilter;
    if (availabilityFilter !== "all") f.availability = availabilityFilter;
    if (statusFilter !== "all") f.status = statusFilter;
    return f;
  }, [dealFilter, typeFilter, availabilityFilter, statusFilter]);

  const { data: enquiries = [], isLoading, refetch } = useGetAllEnquiriesQuery(filters);
  const [updateStatus] = useUpdateEnquiryStatusMutation();

  const stats = useMemo(() => {
    const total = enquiries.length;
    const rent = enquiries.filter((e) => e.deal === "Rent").length;
    const sale = enquiries.filter((e) => e.deal === "Sale").length;
    const residential = enquiries.filter((e) => e.type === "Residential").length;
    return { total, rent, sale, residential };
  }, [enquiries]);

  const columns = useMemo<ColumnDef<AdminEnquiry>[]>(() => [
    {
      accessorKey: "fullName",
      header: "Requester",
      cell: ({ row }) => {
        const e = row.original;
        return (
          <div className="min-w-[140px]">
            <p className="font-medium">{e.fullName || "—"}</p>
            <p className="text-xs text-muted-foreground">{e.email || "—"}</p>
            <p className="text-xs text-muted-foreground">{e.phone || "—"}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "deal",
      header: "Deal",
      cell: ({ row }) => {
        const deal = row.original.deal;
        return deal ? (
          <Badge variant="outline" className={getDealBadgeStyle(deal)}>
            {deal}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.type;
        return type ? (
          <Badge variant="outline" className={getTypeBadgeStyle(type)}>
            {type}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "propertyCategory",
      header: "Category",
      cell: ({ row }) => {
        const cat = row.original.propertyCategory;
        return cat ? (
          <span className="text-sm">{cat}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "availability",
      header: "Availability",
      cell: ({ row }) => {
        const availability = row.original.availability;
        return availability ? (
          <Badge variant="outline" className={getAvailabilityBadgeStyle(availability)}>
            {availability}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const e = row.original;
        const status = e.status || "New";
        return (
          <Select
            value={status}
            onValueChange={(value) =>
              updateStatus({
                id: e._id,
                status: value as "New" | "In Progress" | "Closed",
              })
            }
          >
            <SelectTrigger
              className={`h-7 w-[138px] rounded-full border text-xs font-semibold ${getStatusBadgeStyle(status)}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => {
        const e = row.original;
        return <span className="text-sm">{e.location || "—"}</span>;
      },
    },
    {
      accessorKey: "budget",
      header: "Budget",
      cell: ({ row }) => {
        const budget = row.original.budget;
        return budget ? (
          <span className="text-sm font-medium">{budget}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "facilities",
      header: "Facilities",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {summarizeFacilities(row.original.facilities)}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Submitted",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatRelative(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const e = row.original;
        return (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedEnquiry(e)}
            >
              <Eye className="mr-1 h-4 w-4" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareOnWhatsApp(e)}
            >
              <Share2 className="mr-1 h-4 w-4" />
              Share
            </Button>
          </div>
        );
      },
    },
  ], [updateStatus, setSelectedEnquiry]);

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={dealFilter} onValueChange={setDealFilter}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Deal Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Deals</SelectItem>
          <SelectItem value="Rent">Rent</SelectItem>
          <SelectItem value="Sale">Sale</SelectItem>
        </SelectContent>
      </Select>

      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Property Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="Residential">Residential</SelectItem>
          <SelectItem value="Commercial">Commercial</SelectItem>
          <SelectItem value="Industrial">Industrial</SelectItem>
          <SelectItem value="Agricultural">Agricultural</SelectItem>
        </SelectContent>
      </Select>

      <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Availability" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Availability</SelectItem>
          <SelectItem value="Ready to Move">Ready to Move</SelectItem>
          <SelectItem value="Under Construction">Under Construction</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="New">New</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Closed">Closed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-8 p-4 md:p-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Requirements</h1>
        <p className="text-muted-foreground">
          Property requirements submitted via the Post Requirement form —
          buyers and renters looking for specific properties
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Requirements" value={stats.total} icon={Users} />
          <StatCard title="Rent Requests" value={stats.rent} icon={Key} />
          <StatCard title="Sale Requests" value={stats.sale} icon={Home} />
          <StatCard title="Residential" value={stats.residential} icon={Building2} />
        </div>
      )}

      <Card className="border border-border/50 bg-card shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Requirement List</CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <Clock className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={enquiries}
            isLoading={isLoading}
            loadingRows={6}
            globalSearch
            searchPlaceholder="Search by name, email, phone, city, category..."
            toolbar={toolbar}
            pageSize={10}
            emptyMessage="No requirements yet. Requirements appear here when users submit the Post Requirement form."
          />
        </CardContent>
      </Card>

      <EnquiryDetailsDialog
        enquiry={selectedEnquiry}
        onClose={() => setSelectedEnquiry(null)}
      />
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string; value: number; icon: LucideIcon }) {
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

