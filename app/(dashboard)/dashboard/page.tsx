"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  Users,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
  Eye,
  Settings,
  CreditCard,
  Filter,
  Newspaper,
  Edit,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useGetDashboardStatsQuery } from "@/services/dashboardApi";
import { useGetAllPropertiesQuery } from "@/services/propertiesApi";
import { DataTable } from "@/components/ui/data-table";

export default function Dashboard() {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState("30days");

  const { data: analyticsData, error, isLoading } = useGetDashboardStatsQuery();

  // Fetch all properties for the table section
  const { data: propertiesResponse, isLoading: propertiesLoading } =
    useGetAllPropertiesQuery({ includeInactive: "true", limit: "500" });
  const properties = (propertiesResponse?.data ?? []) as any[];

  // FILTER PERIODS
  const periodOptions = [
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "90days", label: "Last 3 Months" },
    { value: "1year", label: "Last Year" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            Unable to load dashboard data
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            No data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Monitor key performance metrics and business insights.
        </p>
      </div>

      {/* DASHBOARD FILTERS */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>

              {dateFilter !== "30days" && (
                <Badge variant="secondary" className="bg-blue-500 text-white">
                  {periodOptions.find((p) => p.value === dateFilter)?.label}
                </Badge>
              )}
            </div>

            <div className="text-sm text-slate-600">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Time Period
                </label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periodOptions.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Data Type
                </label>
                <Select defaultValue="all">
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select data type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Data</SelectItem>
                    <SelectItem value="bookings">Bookings Only</SelectItem>
                    <SelectItem value="revenue">Revenue Only</SelectItem>
                    <SelectItem value="users">Users Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.totalUsers.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Properties
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.totalProperties.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +8.2% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.totalBookings.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +15.3% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Journals
            </CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.totalJournals.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              Published articles
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(analyticsData.totalRevenue / 1000000).toFixed(2)}M
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +23.1% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Bookings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.todayBookings.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +5.2% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(analyticsData.monthlyRevenue / 1000).toFixed(0)}K
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
              -2.4% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Bookings Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              Monthly Bookings
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Booking volume and trends over time
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={analyticsData.bookingsPerMonth}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="month"
                  fontSize={12}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  fontSize={12}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              Monthly Revenue
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Revenue performance and financial trends
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={analyticsData.revenuePerMonth}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="month"
                  fontSize={12}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  fontSize={12}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                  formatter={(value) => [
                    `₹${value?.toLocaleString() || "0"}`,
                    "Revenue",
                  ]}
                />
                <Bar
                  dataKey="revenue"
                  fill="hsl(var(--primary))"
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Properties Listed Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              Properties Listed Trend
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              New property listings over time
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={analyticsData.propertiesListedPerMonth}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="month"
                  fontSize={12}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  fontSize={12}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                  formatter={(value) => [`${value || "0"}`, "Properties"]}
                />
                <Line
                  type="monotone"
                  dataKey="properties"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* All Properties */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              All Properties
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Complete list of all properties in the system
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/properties")}
          >
            <Eye className="h-4 w-4 mr-1" />
            Manage Properties
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={[
              {
                accessorKey: "title",
                header: "Title",
                enableSorting: true,
                cell: ({ row }) => (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-14 rounded overflow-hidden flex-shrink-0 bg-muted">
                      <img
                        src={row.original.image?.[0] || "/placeholder.png"}
                        alt={row.original.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium line-clamp-1">
                        {row.original.title}
                      </p>
                      {row.original.location?.city && (
                        <p className="text-xs text-muted-foreground">
                          {row.original.location.city}
                          {row.original.location.state &&
                            `, ${row.original.location.state}`}
                        </p>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                accessorKey: "type",
                header: "Type",
                enableSorting: true,
                cell: ({ row }) => (
                  <Badge
                    variant="outline"
                    className="border-primary text-primary"
                  >
                    {row.getValue("type")}
                  </Badge>
                ),
              },
              {
                accessorKey: "deal",
                header: "Deal",
                enableSorting: true,
                cell: ({ row }) => (
                  <Badge variant="secondary">{row.getValue("deal")}</Badge>
                ),
              },
              {
                accessorKey: "price",
                header: "Price",
                enableSorting: true,
                cell: ({ row }) => (
                  <span className="font-semibold">
                    ₹{Number(row.getValue("price")).toLocaleString("en-IN")}
                  </span>
                ),
              },
              {
                accessorKey: "availability",
                header: "Avail.",
                enableSorting: true,
                cell: ({ row }) => {
                  const availability = row.getValue("availability") as string;
                  return (
                    <Badge
                      className={
                        availability === "Ready to Move"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }
                    >
                      {availability}
                    </Badge>
                  );
                },
              },
              {
                accessorKey: "isActive",
                header: "Status",
                enableSorting: true,
                cell: ({ row }) => (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase border-2 ${
                      row.original.isActive === false
                        ? "bg-red-100 text-red-700 border-red-400"
                        : "bg-green-100 text-green-700 border-green-400"
                    }`}
                  >
                    {row.original.isActive === false ? "Inactive" : "Active"}
                  </span>
                ),
              },
              {
                id: "actions",
                header: "Actions",
                enableSorting: false,
                cell: ({ row }) => (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        router.push(`/properties/view/${row.original._id}`)
                      }
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => router.push(`/properties`)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ),
              },
            ]}
            data={properties}
            isLoading={propertiesLoading}
            loadingRows={10}
            pageSize={10}
            globalSearch
            searchPlaceholder="Search properties..."
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Access frequently used features and management tools.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => router.push("/properties")}
            >
              <Building2 className="h-6 w-6" />
              <span className="text-xs">View Properties</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => router.push("/bookings")}
            >
              <Calendar className="h-6 w-6" />
              <span className="text-xs">Manage Bookings</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => router.push("/users")}
            >
              <Users className="h-6 w-6" />
              <span className="text-xs">Users</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => router.push("/payments")}
            >
              <CreditCard className="h-6 w-6" />
              <span className="text-xs">Payments</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
