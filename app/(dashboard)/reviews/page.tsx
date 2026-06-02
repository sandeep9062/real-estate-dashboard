"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Star } from "lucide-react";
import { reviews } from "@/lib/mockData";

interface Review {
  id: string;
  user: string;
  property: string;
  rating: number;
  comment: string;
  date: string;
}

const columns: ColumnDef<Review>[] = [
  {
    accessorKey: "user",
    header: "User",
    enableSorting: true,
  },
  {
    accessorKey: "property",
    header: "Property",
    enableSorting: true,
  },
  {
    accessorKey: "rating",
    header: "Rating",
    enableSorting: true,
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number;
      return (
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating
                  ? "fill-yellow-500 text-yellow-500"
                  : "fill-muted text-muted"
              }`}
            />
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "comment",
    header: "Comment",
    enableSorting: false,
    cell: ({ row }) => {
      const comment = row.getValue("comment") as string;
      return (
        <p className="max-w-md line-clamp-2 text-muted-foreground">{comment}</p>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    enableSorting: true,
  },
];

export default function ReviewsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reviews</h1>
        <p className="text-muted-foreground">Customer reviews and ratings</p>
      </div>

      <DataTable
        columns={columns}
        data={reviews}
        globalSearch
        searchPlaceholder="Search reviews..."
        pageSize={10}
      />
    </div>
  );
}
