"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Activity,
  BadgeCheck,
  Bookmark,
  Building2,
  CalendarDays,
  IdCard,
  Mail,
  Phone,
  ShieldCheck,
  User as UserIcon,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUserByIdQuery } from "@/services/userApi";

/* ── Small helpers ─────────────────────────────────────────────────────── */
const formatDate = (date?: string | Date | null) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700 border-purple-200",
  agent: "bg-blue-100 text-blue-700 border-blue-200",
  landlord: "bg-amber-100 text-amber-700 border-amber-200",
  builder: "bg-indigo-100 text-indigo-700 border-indigo-200",
  user: "bg-slate-100 text-slate-700 border-slate-200",
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-medium text-slate-900">{value ?? "N/A"}</span>
  </div>
);

const IconWithLabel = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-center gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
      <Icon size={18} />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="truncate font-medium text-slate-900">{value ?? "N/A"}</p>
    </div>
  </div>
);

export default function UserDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const router = useRouter();

  const { data: user, error, isLoading } = useGetUserByIdQuery(id, {
    skip: !id,
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fade-in">
        <Skeleton className="h-4 w-32" />
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

  if (!user) {
    return (
      <div className="text-center pt-20 text-gray-500">
        {error ? "Unable to load user details" : "User not found"}
      </div>
    );
  }

  const role = user.role?.toLowerCase();
  const roleLabel = user.role ?? "User";

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          className="mb-4 -ml-2 h-8 px-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          onClick={() => router.push("/users")}
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Users
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">User Details</h1>
            <p className="text-sm text-gray-500 mt-1">View full user information and activity</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={`px-3 py-1 text-sm capitalize border ${
                ROLE_STYLES[role] || "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {roleLabel}
            </Badge>
            <Badge
              className={`px-3 py-1 text-sm border ${
                user.isActive
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-red-100 text-red-700 border-red-200"
              }`}
            >
              {user.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      {/* PROFILE CARD */}
      <Card className="border border-gray-200 shadow-lg rounded-2xl">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name}
                className="h-24 w-24 shrink-0 rounded-full object-cover ring-4 ring-blue-50"
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-muted ring-4 ring-blue-50">
                <UserIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500 break-all">{user.email}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Badge variant="secondary" className="gap-1">
                  <BadgeCheck size={12} /> {user.googleId ? "Google account" : "Registered"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
{/* DETAILS + STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact details */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b bg-gray-50 rounded-t-2xl p-5">
            <CardTitle className="flex items-center gap-2 text-base">
              <IdCard size={18} /> Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            <IconWithLabel icon={Mail} label="Email" value={user.email || "N/A"} />
            <IconWithLabel icon={Phone} label="Phone" value={user.phone || "N/A"} />
            <IconWithLabel icon={Users} label="Role" value={roleLabel} />
            <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <DetailRow label="User ID" value={<span className="break-all">{user._id}</span>} />
              <DetailRow label="Google ID" value={user.googleId || "—"} />
              <DetailRow label="Created" value={formatDate(user.createdAt)} />
              <DetailRow label="Updated" value={formatDate(user.updatedAt)} />
            </div>
          </CardContent>
        </Card>
{/* Stats */}
        <Card>
          <CardHeader className="border-b bg-gray-50 rounded-t-2xl p-5">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity size={18} /> Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
                <Building2 className="h-5 w-5 text-blue-600" />
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {user.propertyCount ?? user.ownedProperties?.length ?? 0}
                </p>
                <p className="text-xs text-slate-500">Properties</p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
                <Bookmark className="h-5 w-5 text-violet-600" />
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {user.favProperties?.length ?? 0}
                </p>
                <p className="text-xs text-slate-500">Favourites</p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
                <CalendarDays className="h-5 w-5 text-emerald-600" />
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {user.bookedVisits?.length ?? user.bookings?.length ?? 0}
                </p>
                <p className="text-xs text-slate-500">Visits</p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
                <ShieldCheck className="h-5 w-5 text-amber-600" />
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {user.isActive ? "On" : "Off"}
                </p>
                <p className="text-xs text-slate-500">Status</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <DetailRow
                label="Last updated"
                value={formatDate(user.updatedAt)}
              />
              <DetailRow
                label="Joined"
                value={formatDate(user.createdAt)}
              />
              <DetailRow
                label="Account type"
                value={user.googleId ? "Google" : "Email/Phone"}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}