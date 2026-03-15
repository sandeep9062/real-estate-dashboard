"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  useGetAllBookingsQuery,
  useAdminDeleteBookingMutation,
  useAdminUpdateBookingStatusMutation,
} from "@/services/bookingApi";
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
import {
  Eye,
  Trash2,
  CalendarDays,
  Users,
  CheckCircle,
  Clock,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const ITEMS_PER_PAGE = 10;

export default function Bookings() {
  const router = useRouter();

  const { data: bookings = [], isLoading, refetch } = useGetAllBookingsQuery();

  const [adminDeleteBooking] = useAdminDeleteBookingMutation();
  const [adminUpdateBookingStatus] = useAdminUpdateBookingStatusMutation();

  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const allBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.map((booking: any) => ({
      id: booking._id,
      userName: booking.user.name,
      userEmail: booking.user.email,
      propertyTitle: booking.property.title,
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
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

  const filteredBookings = useMemo(() => {
    let list = [...allBookings];

    if (statusFilter !== "all") {
      list = list.filter((b) => b.status.toLowerCase() === statusFilter);
    }

    if (search.trim() !== "") {
      list = list.filter(
        (b) =>
          b.userName.toLowerCase().includes(search.toLowerCase()) ||
          b.propertyTitle.toLowerCase().includes(search.toLowerCase())
      );
    }

    return list;
  }, [allBookings, statusFilter, search]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentBookings = filteredBookings.slice(start, start + ITEMS_PER_PAGE);

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
    try {
      await adminUpdateBookingStatus({ id, status }).unwrap();
      toast.success("Status updated");
      refetch();
    } catch {
      toast.error("Update failed");
    }
  };

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

      {/* Filters + Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

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
      </div>

      {/* Table */}
      <Card className="border border-border/50 backdrop-blur-xl bg-card/60 shadow-xl">
        <CardHeader>
          <CardTitle>Booking List</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-16 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : currentBookings.length > 0 ? (
                currentBookings.map((booking: any) => (
                  <TableRow key={booking.id} className="hover:bg-muted/40">
                    <TableCell>
                      <p className="font-semibold">{booking.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.userEmail}
                      </p>
                    </TableCell>

                    <TableCell className="font-medium">
                      {booking.propertyTitle}
                    </TableCell>

                    <TableCell>{formatDate(booking.date)}</TableCell>

                    <TableCell>
                      <Select
                        value={booking.status}
                        onValueChange={(v) => handleStatusChange(booking.id, v)}
                      >
                        <SelectTrigger
                          className={`w-36 border ${getStatusBadge(
                            booking.status
                          )}`}
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
                    </TableCell>

                    <TableCell className="text-right space-x-2">
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
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-muted-foreground"
                  >
                    No bookings found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Delete Dialog */}
      <AlertDialog
        open={!!bookingToDelete}
        onOpenChange={() => setBookingToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This action can’t be undone.
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
function StatCard({ title, value, icon: Icon }: any) {
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
