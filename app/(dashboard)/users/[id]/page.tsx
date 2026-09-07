"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  BadgeCheck,
  Bookmark,
  Briefcase,
  Building2,
  CalendarDays,
  FileText,
  IdCard,
  Landmark,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  User as UserIcon,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAgentByUserIdQuery,
  useGetLandlordByUserIdQuery,
  useGetUserByIdQuery,
} from "@/services/userApi";

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

/* ── Professional profile helpers ───────────────────────────────────────────────── */
const initials = (name?: string) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

const ChipList = ({ items, fallback }: { items?: string[]; fallback?: string }) => {
  const list = (items || []).filter(Boolean);
  if (list.length === 0) return <span className="text-sm text-slate-400">{fallback || "—"}</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {list.map((item, i) => (
        <span key={i} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          {item}
        </span>
      ))}
    </div>
  );
};

const FieldGrid = ({ fields }: { fields: Array<{ label: string; value?: React.ReactNode }> }) => {
  const visible = fields.filter(
    (f) => f.value !== undefined && f.value !== null && f.value !== "",
  );
  if (visible.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
      {visible.map((f, i) => (
        <div key={i} className="flex items-center justify-between gap-2 border-b border-gray-100 py-1.5">
          <span className="min-w-0 text-xs text-slate-500">{f.label}</span>
          <span className="truncate text-sm font-medium text-slate-900">{f.value}</span>
        </div>
      ))}
    </div>
  );
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{children}</p>
);

const yesNo = (v?: boolean) => (v === true ? "Yes" : v === false ? "No" : undefined);

const ProfileLoading = ({ role }: { role: string }) => (
  <Card className="border border-gray-200 shadow-lg rounded-2xl">
    <CardContent className="p-6 space-y-4">
      <p className="text-sm font-medium text-slate-500">Loading {role} profile…</p>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-6 w-full" />
      ))}
    </CardContent>
  </Card>
);

const ProfileError = ({ message }: { message: string }) => (
  <Card className="border border-gray-200 shadow-lg rounded-2xl">
    <CardContent className="p-6 text-sm text-gray-500">
      {message || "No professional profile found for this account."}
    </CardContent>
  </Card>
);

const AgentProfileCard = ({ agent }: { agent: any }) => {
  const avatar = agent?.avatar;
  const name = agent?.name || "Agent";
  const title = agent?.title || "Real Estate Agent";

  const statusBadge =
    agent?.status === "active"
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-red-100 text-red-700 border-red-200";
  const unverifiedBadge = "bg-amber-100 text-amber-700 border-amber-200";

  return (
    <Card className="border border-gray-200 shadow-lg rounded-2xl">
      <CardHeader className="border-b bg-blue-50/60 rounded-t-2xl p-5">
        <CardTitle className="flex items-center gap-2 text-base">
          <Briefcase size={18} className="text-blue-600" /> Agent Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        <div>
          <div className="flex items-center gap-3">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={name} className="h-14 w-14 rounded-full object-cover ring-2 ring-blue-100" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold">
                {initials(name)}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">{name}</p>
              <p className="text-sm text-slate-500">{title}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge className={`border px-2.5 py-1 text-xs capitalize ${agent?.verified ? "bg-green-100 text-green-700 border-green-200" : unverifiedBadge}`}>{agent?.verified ? "Verified" : "Unverified"}</Badge>
            <Badge className={`border px-2.5 py-1 text-xs capitalize ${agent?.topAgent ? "bg-purple-100 text-purple-700 border-purple-200" : unverifiedBadge}`}>{agent?.topAgent ? "Top Agent" : "Not Top Agent"}</Badge>
            <Badge className={`border px-2.5 py-1 text-xs capitalize ${statusBadge}`}>{agent?.status || "—"}</Badge>
            <Badge className={`border px-2.5 py-1 text-xs capitalize ${agent?.featured ? "bg-green-100 text-green-700 border-green-200" : unverifiedBadge}`}>{agent?.featured ? "Featured" : "Not Featured"}</Badge>
          </div>
        </div>

        {agent?.profileCompleteness != null && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Profile completeness</span>
              <span>{agent.profileCompleteness}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-blue-500" style={{ width: `${agent.profileCompleteness}%` }} />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <SectionLabel>About</SectionLabel>
            <p className="text-sm text-slate-600 leading-relaxed mt-1">{agent?.bio || "—"}</p>
            {agent?.longBio && <p className="text-sm text-slate-500 leading-relaxed mt-2">{agent.longBio}</p>}
          </div>

          <div>
            <SectionLabel>Identity</SectionLabel>
            <FieldGrid fields={[
              { label: "ID (_id)", value: agent?._id },
              { label: "User ID (userID)", value: agent?.userID },
              { label: "Slug", value: agent?.slug },
            ]} />
          </div>

          <div>
            <SectionLabel>Contact</SectionLabel>
            <FieldGrid fields={[
              { label: "Email", value: agent?.email },
              { label: "Phone", value: agent?.phone },
              { label: "WhatsApp", value: agent?.whatsapp },
            ]} />
          </div>

          <div>
            <SectionLabel>Agency & Registration</SectionLabel>
            <FieldGrid fields={[
              { label: "Agency Name", value: agent?.agencyName },
              { label: "RERA Number", value: agent?.rera },
            ]} />
          </div>

          <div>
            <SectionLabel>Performance Stats</SectionLabel>
            <FieldGrid fields={[
              { label: "Rating", value: agent?.rating ?? "—" },
              { label: "Total Reviews", value: agent?.totalReviews ?? "—" },
              { label: "Experience (Years)", value: agent?.experience ?? "—" },
              { label: "Deals Closed", value: agent?.deals ?? "—" },
              { label: "Response Time", value: agent?.responseTime || "—" },
              { label: "Response Rate", value: agent?.responseRate || "—" },
            ]} />
          </div>

        <div>
            <SectionLabel>Service Areas</SectionLabel>
            <div className="mt-1.5 space-y-2">
              <div className="flex items-start gap-2">
                <span className="w-32 shrink-0 text-xs text-slate-500">Locations</span>
                <ChipList items={agent?.locations} fallback="—" />
              </div>
              <div className="flex items-start gap-2">
                <span className="w-32 shrink-0 text-xs text-slate-500">Specialisations</span>
                <ChipList items={agent?.specialisations} fallback="—" />
              </div>
              <div className="flex items-start gap-2">
                <span className="w-32 shrink-0 text-xs text-slate-500">Languages</span>
                <ChipList items={agent?.languages} fallback="—" />
              </div>
              <div className="flex items-start gap-2">
                <span className="w-32 shrink-0 text-xs text-slate-500">Achievements</span>
                <ChipList items={agent?.achievements} fallback="—" />
              </div>
            </div>
          </div>

          {Array.isArray(agent?.stats) && agent.stats.length > 0 && (
            <div>
              <SectionLabel>Custom Stats</SectionLabel>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {agent.stats.map((s: any, i: number) => (
                  <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
                    <p className="text-lg">{s.icon || "📊"}</p>
                    <p className="mt-1 text-sm font-bold text-gray-900">{s.value || "—"}</p>
                    <p className="text-xs text-slate-500">{s.label || "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <SectionLabel>Branding & Visuals</SectionLabel>
            <div className="mt-1.5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-32 shrink-0 text-xs text-slate-500">Avatar Color</span>
                <span className="h-4 w-4 rounded-full border border-gray-200" style={{ backgroundColor: agent?.avatarColor || "#4161df" }} />
                <span className="text-xs font-mono text-slate-600">{agent?.avatarColor || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-32 shrink-0 text-xs text-slate-500">Cover Color</span>
                <span className="h-4 w-4 rounded-full border border-gray-200" style={{ backgroundColor: agent?.coverColor || "#0d1640" }} />
                <span className="text-xs font-mono text-slate-600">{agent?.coverColor || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-32 shrink-0 text-xs text-slate-500">Cover Image</span>
                {agent?.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={agent.coverImage} alt="Cover" className="h-10 w-16 rounded object-cover" />
                ) : (
                  <span className="text-sm text-slate-400">—</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>SEO</SectionLabel>
            <FieldGrid fields={[
              { label: "Meta Title", value: agent?.metaTitle },
              { label: "Meta Description", value: agent?.metaDescription },
            ]} />
          </div>

          <div>
            <SectionLabel>Timestamps</SectionLabel>
            <FieldGrid fields={[
              { label: "Created At", value: formatDate(agent?.createdAt) },
              { label: "Updated At", value: formatDate(agent?.updatedAt) },
            ]} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LandlordProfileCard = ({ landlord }: { landlord: any }) => {
  const avatar = landlord?.avatar;
  const name = landlord?.name || "Landlord";
  const title = landlord?.title || "Property Owner";

  const unverifiedBadge = "bg-amber-100 text-amber-700 border-amber-200";
  const statusBadge =
    landlord?.status === "active"
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-red-100 text-red-700 border-red-200";

  return (
    <Card className="border border-gray-200 shadow-lg rounded-2xl">
      <CardHeader className="border-b bg-amber-50/60 rounded-t-2xl p-5">
        <CardTitle className="flex items-center gap-2 text-base">
          <Landmark size={18} className="text-amber-600" /> Landlord Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        <div>
          <div className="flex items-center gap-3">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={name} className="h-14 w-14 rounded-full object-cover ring-2 ring-amber-100" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold">
                {initials(name)}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">{name}</p>
              <p className="text-sm text-slate-500">{title}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge className={`border px-2.5 py-1 text-xs capitalize ${landlord?.isVerified ? "bg-green-100 text-green-700 border-green-200" : unverifiedBadge}`}>{landlord?.isVerified ? "Verified" : "Unverified"}</Badge>
            <Badge className={`border px-2.5 py-1 text-xs capitalize ${landlord?.identityVerified ? "bg-green-100 text-green-700 border-green-200" : unverifiedBadge}`}>{landlord?.identityVerified ? "ID Verified" : "ID Not Verified"}</Badge>
            <Badge className="border bg-slate-100 text-slate-700 border-slate-200 px-2.5 py-1 text-xs capitalize">{landlord?.isCompany ? "Company" : "Individual"}</Badge>
            <Badge className={`border px-2.5 py-1 text-xs capitalize ${statusBadge}`}>{landlord?.status || "—"}</Badge>
            <Badge className={`border px-2.5 py-1 text-xs capitalize ${landlord?.featured ? "bg-green-100 text-green-700 border-green-200" : unverifiedBadge}`}>{landlord?.featured ? "Featured" : "Not Featured"}</Badge>
          </div>
        </div>

        {landlord?.profileCompleteness != null && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Profile completeness</span>
              <span>{landlord.profileCompleteness}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-amber-500" style={{ width: `${landlord.profileCompleteness}%` }} />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <SectionLabel>About</SectionLabel>
            <p className="text-sm text-slate-600 leading-relaxed mt-1">{landlord?.bio || "—"}</p>
            {landlord?.longBio && <p className="text-sm text-slate-500 leading-relaxed mt-2">{landlord.longBio}</p>}
          </div>

          <div>
            <SectionLabel>Identity</SectionLabel>
            <FieldGrid fields={[
              { label: "ID (_id)", value: landlord?._id },
              { label: "User ID (userID)", value: landlord?.userID },
              { label: "Slug", value: landlord?.slug },
              { label: "Member Since", value: landlord?.memberSince ? formatDate(landlord.memberSince) : undefined },
            ]} />
          </div>

          <div>
            <SectionLabel>Contact</SectionLabel>
            <FieldGrid fields={[
              { label: "Email", value: landlord?.email },
              { label: "Phone", value: landlord?.phone },
              { label: "WhatsApp", value: landlord?.whatsapp },
            ]} />
          </div>

          <div>
            <SectionLabel>Address</SectionLabel>
            <FieldGrid fields={[
              { label: "Address", value: landlord?.address },
              { label: "City", value: landlord?.city },
              { label: "State", value: landlord?.state },
              { label: "Pincode", value: landlord?.pincode },
            ]} />
          </div>

          <div>
            <SectionLabel>Preferences</SectionLabel>
            <FieldGrid fields={[
              { label: "Preferred Contact Method", value: landlord?.preferences?.contactMethod },
              { label: "Available Timings", value: landlord?.preferences?.availableTimings },
              { label: "Accepts Site Visits", value: yesNo(landlord?.preferences?.acceptsVisits) },
            ]} />
          </div>

          <div>
            <SectionLabel>Portfolio & Performance</SectionLabel>
            <FieldGrid fields={[
              { label: "Rating", value: landlord?.rating ?? "—" },
              { label: "Total Reviews", value: landlord?.totalReviews ?? "—" },
              { label: "Total Properties", value: landlord?.totalProperties ?? "—" },
              { label: "Active Listings", value: landlord?.activeListings ?? "—" },
              { label: "Deals Closed", value: landlord?.totalDeals ?? "—" },
              { label: "Response Time", value: landlord?.responseTime },
              { label: "Response Rate", value: landlord?.responseRate },
            ]} />
          </div>

          <div>
            <SectionLabel>Service Areas</SectionLabel>
            <div className="mt-1.5 space-y-2">
              <div className="flex items-start gap-2">
                <span className="w-32 shrink-0 text-xs text-slate-500">Property Types</span>
                <ChipList items={landlord?.propertyTypes} fallback="—" />
              </div>
              <div className="flex items-start gap-2">
                <span className="w-32 shrink-0 text-xs text-slate-500">Locations</span>
                <ChipList items={landlord?.locations} fallback="—" />
              </div>
              <div className="flex items-start gap-2">
                <span className="w-32 shrink-0 text-xs text-slate-500">Languages</span>
                <ChipList items={landlord?.languages} fallback="—" />
              </div>
            </div>
          </div>

          {(landlord?.isCompany || landlord?.companyName || landlord?.gstin || landlord?.pan) && (
            <div>
              <SectionLabel>Company & Tax Details</SectionLabel>
              <FieldGrid fields={[
                { label: "Company Registered", value: yesNo(landlord?.isCompany) },
                { label: "Company Name", value: landlord?.companyName },
                { label: "GSTIN", value: landlord?.gstin },
                { label: "PAN", value: landlord?.pan },
              ]} />
            </div>
          )}

          {landlord?.bankDetails && Object.values(landlord.bankDetails).some(Boolean) && (
            <div>
              <SectionLabel>Bank Details (Payouts)</SectionLabel>
              <FieldGrid fields={[
                { label: "Bank Name", value: landlord?.bankDetails?.bankName },
                { label: "Account Holder", value: landlord?.bankDetails?.accountHolderName },
                { label: "Account Number", value: landlord?.bankDetails?.accountNumber },
                { label: "IFSC Code", value: landlord?.bankDetails?.ifscCode },
                { label: "UPI ID", value: landlord?.bankDetails?.upiId },
              ]} />
            </div>
          )}

          {landlord?.documents?.length > 0 && (
            <div>
              <SectionLabel>Documents</SectionLabel>
              <div className="mt-2 space-y-2">
                {landlord.documents.map((doc: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-2.5">
                    <FileText size={16} className="shrink-0 text-amber-600" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{doc.title || doc.type || "Document"}</p>
                      <p className="text-xs text-slate-500">
                        {doc.type ? `${doc.type} · ` : ""}Uploaded {doc.uploadedAt ? formatDate(doc.uploadedAt) : "—"}
                      </p>
                    </div>
                    <Badge className={`shrink-0 border px-2 py-0.5 text-xs ${doc.verified ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
                      {doc.verified ? "Verified" : "Pending"}
                    </Badge>
                    {doc.url && (
                      <a href={doc.url} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-medium text-blue-600 hover:underline">
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <SectionLabel>Branding & Visuals</SectionLabel>
            <div className="mt-1.5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-32 shrink-0 text-xs text-slate-500">Avatar Color</span>
                <span className="h-4 w-4 rounded-full border border-gray-200" style={{ backgroundColor: landlord?.avatarColor || "#4161df" }} />
                <span className="text-xs font-mono text-slate-600">{landlord?.avatarColor || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-32 shrink-0 text-xs text-slate-500">Cover Image</span>
                {landlord?.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={landlord.coverImage} alt="Cover" className="h-10 w-16 rounded object-cover" />
                ) : (
                  <span className="text-sm text-slate-400">—</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>SEO</SectionLabel>
            <FieldGrid fields={[
              { label: "Meta Title", value: landlord?.metaTitle },
              { label: "Meta Description", value: landlord?.metaDescription },
            ]} />
          </div>

          <div>
            <SectionLabel>Timestamps</SectionLabel>
            <FieldGrid fields={[
              { label: "Created At", value: formatDate(landlord?.createdAt) },
              { label: "Updated At", value: formatDate(landlord?.updatedAt) },
            ]} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ProfessionalProfileSection = ({
  role,
  agent,
  agentLoading,
  agentError,
  landlord,
  landlordLoading,
  landlordError,
}: {
  role: string;
  agent: any;
  agentLoading: boolean;
  agentError: any;
  landlord: any;
  landlordLoading: boolean;
  landlordError: any;
}) => {
  if (role === "agent") {
    if (agentLoading) return <ProfileLoading role="agent" />;
    if (agentError || !agent) return <ProfileError message={agentError?.data?.message || "No agent profile found for this account."} />;
    return <AgentProfileCard agent={agent} />;
  }

  if (role === "landlord") {
    if (landlordLoading) return <ProfileLoading role="landlord" />;
    if (landlordError || !landlord) return <ProfileError message={landlordError?.data?.message || "No landlord profile found for this account."} />;
    return <LandlordProfileCard landlord={landlord} />;
  }

  return null;
};

export default function UserDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const router = useRouter();

  const { data: user, error, isLoading } = useGetUserByIdQuery(id, {
    skip: !id,
  });

  // Role determines which professional profile (agent / landlord) to show,
  // fetched separately from the user account details below.

  const userRole = (user?.role || "").toLowerCase();

  const {
    data: agent,
    error: agentError,
    isLoading: agentLoading,
  } = useGetAgentByUserIdQuery(id, {
    skip: !id || userRole !== "agent",
  });

  const {
    data: landlord,
    error: landlordError,
    isLoading: landlordLoading,
  } = useGetLandlordByUserIdQuery(id, {
    skip: !id || userRole !== "landlord",
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
            <Link href={`/users/${id}/edit`}>
              <Button className="gap-1.5">
                <Pencil size={15} /> Edit User
              </Button>
            </Link>
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

      {/* PROFESSIONAL PROFILE — rendered separately from user account details */}
      {role === "agent" || role === "landlord" ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Professional Profile</h2>
            <p className="text-sm text-gray-500 mt-1">
              {role === "agent"
                ? "Agent profile linked to this account"
                : "Landlord profile linked to this account"}
            </p>
          </div>
          <ProfessionalProfileSection
            role={role}
            agent={agent}
            agentLoading={agentLoading}
            agentError={agentError}
            landlord={landlord}
            landlordLoading={landlordLoading}
            landlordError={landlordError}
          />
        </div>
      ) : null}
    </div>
  );
}