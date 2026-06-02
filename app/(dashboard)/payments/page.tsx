"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { payments } from "@/lib/mockData";

interface Payment {
  id: string;
  amount: string;
  method: string;
  date: string;
  property: string;
  user: string;
  status: string;
}

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "amount",
    header: "Amount",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="font-bold text-accent">{row.getValue("amount")}</span>
    ),
  },
  {
    accessorKey: "method",
    header: "Method",
    enableSorting: true,
    cell: ({ row }) => (
      <Badge variant="outline" className="border-primary text-primary">
        {row.getValue("method")}
      </Badge>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    enableSorting: true,
  },
  {
    accessorKey: "property",
    header: "Property",
    enableSorting: true,
  },
  {
    accessorKey: "user",
    header: "User",
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={status === "Success" ? "default" : "destructive"}
          className={
            status === "Success"
              ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
              : ""
          }
        >
          {status}
        </Badge>
      );
    },
  },
];

export default function PaymentsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payments</h1>
        <p className="text-muted-foreground">View all payment transactions</p>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        globalSearch
        searchPlaceholder="Search payments..."
        pageSize={10}
      />
    </div>
  );
}
