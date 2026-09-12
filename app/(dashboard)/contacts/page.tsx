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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  MailOpen,
  Inbox,
  Archive,
  Clock,
  Mail,
  Phone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useGetContactsQuery } from "@/services/contactApi";
import { selectIsAuthenticated, selectUser } from "@/store/authSlice";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status?: "new" | "read" | "archived";
  createdAt?: string;
  updatedAt?: string;
}

const STATUS_BADGE_STYLES: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-600 border-blue-400/30",
  read: "bg-green-500/20 text-green-600 border-green-400/30",
  archived: "bg-gray-500/20 text-gray-500 border-gray-400/30",
};

const getStatusBadgeStyle = (status?: string) =>
  STATUS_BADGE_STYLES[status?.toLowerCase() ?? ""] ??
  "bg-gray-500/20 text-gray-500 border-gray-400/30";

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateStr?: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
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

export default function ContactMessages() {
  // Admin-only view
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUser)?.role;

  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContact, setSelectedContact] =
    useState<ContactMessage | null>(null);

  const {
    data: contacts = [],
    isLoading,
    error,
    refetch,
  } = useGetContactsQuery(undefined, {
    skip: !isAuthenticated || userRole !== "admin",
  });

  // Redirect if not authenticated
  if (typeof window !== "undefined" && !isAuthenticated) {
    window.location.href = "/auth";
    return null;
  }

  const contactList = (contacts ?? []) as ContactMessage[];

  const filteredContacts = useMemo(() => {
    return contactList
      .filter((contact) => {
        const statusMatch =
          statusFilter === "all" ||
          (contact.status ?? "new").toLowerCase() ===
            statusFilter.toLowerCase();
        return statusMatch;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime(),
      );
  }, [contactList, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: contactList.length,
      new: contactList.filter((c) => (c.status ?? "new") === "new").length,
      read: contactList.filter((c) => c.status === "read").length,
      archived: contactList.filter((c) => c.status === "archived").length,
    };
  }, [contactList]);

  const columns: ColumnDef<ContactMessage, unknown>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="max-w-[180px]">
          <p className="font-medium truncate">{row.original.name || "—"}</p>
          <p className="text-xs text-muted-foreground truncate">
            {row.original.email || "—"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <p className="text-sm whitespace-nowrap">
          {row.original.phone || "—"}
        </p>
      ),
    },
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }) => (
        <p className="max-w-[200px] text-sm font-medium truncate">
          {row.original.subject || "No subject"}
        </p>
      ),
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => (
        <p className="max-w-[260px] text-sm text-muted-foreground truncate">
          {row.original.message || "—"}
        </p>
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
          {row.original.status ?? "new"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Received",
      cell: ({ row }) => (
        <div className="text-sm whitespace-nowrap">
          <p>{formatRelative(row.original.createdAt)}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(row.original.createdAt)}{" "}
            {formatTime(row.original.createdAt)}
          </p>
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          title="View full message"
          onClick={() => setSelectedContact(row.original)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
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
          <SelectItem value="read">Read</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-8 p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Contact Messages</h1>
        <p className="text-muted-foreground">
          All messages submitted through the contact form on the website
        </p>
      </div>

      {/* Error state */}
      {error ? (
        <Card className="border border-red-400/40 bg-red-500/5 p-6">
          <p className="text-sm text-red-600">
            Failed to load contact messages. Please make sure the API server is
            running and you are logged in as an admin.
          </p>
        </Card>
      ) : null}

      {/* Stats */}
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
          <StatCard title="Total Messages" value={stats.total} icon={Inbox} />
          <StatCard title="New" value={stats.new} icon={Mail} />
          <StatCard title="Read" value={stats.read} icon={MailOpen} />
          <StatCard title="Archived" value={stats.archived} icon={Archive} />
        </div>
      )}

      {/* Table */}
      <Card className="border border-border/50 bg-card shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Messages</CardTitle>
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
            data={filteredContacts}
            isLoading={isLoading}
            loadingRows={6}
            globalSearch
            searchPlaceholder="Search by name, email, subject..."
            toolbar={statusToolbar}
            pageSize={10}
            emptyMessage="No contact messages yet. Messages submitted through the website contact form will appear here."
          />
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog
        open={!!selectedContact}
        onOpenChange={(open) => !open && setSelectedContact(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="pr-6">
              {selectedContact?.subject || "No subject"}
            </DialogTitle>
            <DialogDescription>
              Received {formatDate(selectedContact?.createdAt)} at{" "}
              {formatTime(selectedContact?.createdAt)} (
              {formatRelative(selectedContact?.createdAt)})
            </DialogDescription>
          </DialogHeader>

          {selectedContact ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    From
                  </p>
                  <p className="text-sm font-medium">
                    {selectedContact.name || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Status
                  </p>
                  <Badge
                    variant="outline"
                    className={getStatusBadgeStyle(selectedContact.status)}
                  >
                    {selectedContact.status ?? "new"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Email
                  </p>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {selectedContact.email || "—"}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Phone
                  </p>
                  {selectedContact.phone ? (
                    <a
                      href={`tel:${selectedContact.phone}`}
                      className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      {selectedContact.phone}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">—</p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Message
                </p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {selectedContact.message || "—"}
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
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

