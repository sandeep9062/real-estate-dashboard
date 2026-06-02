"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, CalendarDays, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  useGetAllBookingsQuery,
  useAdminDeleteBookingMutation,
  useAdminUpdateBookingStatusMutation,
} from "@/services/bookingApi";
import { Skeleton } from "@/components/ui/skeleton";

interface BookingRow {
  id: string;
  userName: string;
  userEmail: string;
  propertyTitle: string;
  date: string;
  status: string;
}

const getStatusBadgeStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "bg-green-500/20 text-green-600 border-green-400/30";
    case "pending":
      return "bg-yellow-500/20 text-yellow-600 border-yellow-400/30";
    case "cancelled":
      return "bg-red-500/20 text-red-600 border-red-400/30";
    case "success":
      return "bg-blue-500/20 text-blue-600 border-blue-400/30";
    default:
      return "bg-gray-500/20 text-gray-500 border-gray-400/30";
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function Bookings() {
  const router = useRouter();

  const { data: bookings = [], isLoading, refetch } = useGetAllBookingsQuery();

  const [adminDeleteBooking] = useAdminDeleteBookingMutation();
  const [adminUpdateBookingStatus] = useAdminUpdateBookingStatusMutation();

  const [statusFilter, setStatusFilter] = useState("all");
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const allBookings: BookingRow[] = useMemo(() => {
    if (!bookings) return [];
    return bookings.map((booking: any) => ({
      id: booking._id,
      userName: booking.user?.name || "N/A",
      userEmail: booking.user?.email || "N/A",
      propertyTitle: booking.property?.title || "N/A",
      date: booking.date,
      status: booking.status,
    }));
  }, [bookings]);

  const stats = useMemo(() => {
    return {
      total: allBookings.length,
      confirmed: allBookings.filter((b) => b.status === "confirmed").length,
      pending: allBookings.filter((b) => b.status === "pending").length,
    };
  }, [allBookings]);

  const filteredBookings = useMemo(() => {
    if (statusFilter === "all") return allBookings;
    return allBookings.filter((b) => b.status.toLowerCase() === statusFilter);
  }, [allBookings, statusFilter]);

  const handleView = (id: string) => {
    router.push(`/bookings/details/${id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) return;
    try {
      await adminDeleteBooking(bookingToDelete).unwrap();
      toast.success("Booking cancelled successfully");
      refetch();
      setBookingToDelete(null);
    } catch {
      toast.error("Failed to cancel booking");
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await adminUpdateBookingStatus({ id, status }).unwrap();
      toast.success("Status updated");
      refetch();
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const columns: ColumnDef<BookingRow>[] = [
    {
      accessorKey: "userName",
      header: "User",
      enableSorting: true,
      cell: ({ row }) => (
        <div>
          <p className="font-semibold">{row.original.userName}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.userEmail}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "propertyTitle",
      header: "Property",
      enableSorting: true,
    },
    {
      accessorKey: "date",
      header: "Date",
      enableSorting: true,
      cell: ({ row }) => formatDate(row.getValue("date")),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) => {
        const booking = row.original;
        return (
          <Select
            value={booking.status}
            onValueChange={(v) => handleStatusChange(booking.id, v)}
          >
            <SelectTrigger
              className={`w-36 border ${getStatusBadgeStyle(booking.status)}`}
              disabled={updatingId === booking.id}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const booking = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleView(booking.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="destructive"
              onClick={() => setBookingToDelete(booking.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const toolbar = (
    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        <SelectItem value="confirmed">Confirmed</SelectItem>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="success">Success</SelectItem>
        <SelectItem value="cancelled">Cancelled</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-8 p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground">
          Manage and track all property bookings
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
          <StatCard
            title="Total Bookings"
            value={stats.total}
            icon={CalendarDays}
          />
          <StatCard
            title="Confirmed"
            value={stats.confirmed}
            icon={CheckCircle}
          />
          <StatCard title="Pending" value={stats.pending} icon={Clock} />
        </div>
      )}

      {/* Table */}
      <Card className="border border-border/50 backdrop-blur-xl bg-card/60 shadow-xl">
        <CardHeader>
          <CardTitle>Booking List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={filteredBookings}
            isLoading={isLoading}
            loadingRows={6}
            globalSearch
            searchPlaceholder="Search by name or property..."
            toolbar={toolbar}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog
        open={!!bookingToDelete}
        onOpenChange={() => setBookingToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This action can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
  icon: React.ElementType;
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
