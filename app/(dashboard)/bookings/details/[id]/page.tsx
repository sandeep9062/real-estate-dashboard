"use client";

import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useGetBookingByIdQuery } from "@/services/bookingApi";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  CalendarDays,
  Home,
  Mail,
  Hash,
} from "lucide-react";

export default function BookingDetailsPage() {
  const { id } = useParams();
  const { data: booking, isLoading } = useGetBookingByIdQuery(id as string, {
    skip: !id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto p-6">
        <Skeleton className="h-8 w-1/3" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center pt-20 text-gray-500">
        Booking not found
      </div>
    );
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "N/A";
    const [day, month, year] = dateStr.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-700 border border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fade-in">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Booking Details
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View full booking information
          </p>
        </div>

        <Badge className={`px-4 py-1 text-sm ${getStatusStyle(booking.status)}`}>
          {booking.status}
        </Badge>
      </div>

      {/* MAIN CARD */}
      <Card className="border border-gray-200 shadow-lg rounded-2xl">
        <CardHeader className="border-b bg-gray-50 rounded-t-2xl p-6">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Hash size={18} /> Booking ID
          </CardTitle>
          <CardDescription className="break-all">
            {booking._id}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* User Info */}
          <div className="flex gap-4 items-start">
            <User className="text-blue-600 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Customer Name</p>
              <p className="font-semibold">{booking.userName}</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <Mail className="text-blue-600 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold">{booking.userEmail}</p>
            </div>
          </div>

          {/* Property Info */}
          <div className="flex gap-4 items-start">
            <Home className="text-purple-600 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Property Title</p>
              <p className="font-semibold">{booking.property.title}</p>
            </div>
          </div>

          {/* Date Info */}
          <div className="flex gap-4 items-start">
            <CalendarDays className="text-green-600 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Visit Date</p>
              <p className="font-semibold">
                {formatDate(booking.date)}
              </p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
