"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Landmark,
  Loader2,
  Save,
  User as UserIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  useGetAgentByUserIdQuery,
  useGetLandlordByUserIdQuery,
  useGetUserByIdQuery,
  useUpdateAgentByUserIdMutation,
  useCreateAgentByUserIdMutation,
  useCreateLandlordByUserIdMutation,
  useUpdateLandlordProfileMutation,
  useUpdateUserMutation,
} from "@/services/userApi";

const ROLES = ["user", "agent", "landlord", "builder", "admin"];

const splitList = (value: string) =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

/* Extract a readable message from an RTK Query / fetch error */
const getErrMsg = (e: any) => {
  if (typeof e?.data === "string" && e.data.trim()) return e.data.trim();
  if (e?.data?.message) return e.data.message;
  if (e?.status === 404)
    return "API endpoint not found — the backend may be missing the latest code.";
  if (e?.status) return `Request failed (HTTP ${e.status}).`;
  return "Please try again.";
};

const joinList = (value?: string[] | null) => (value || []).join(", ");

/* ── Field primitives ──────────────────────────────────────────────────── */
const TextField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-slate-500">{label}</Label>
    <Input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="bg-white"
    />
  </div>
);

const TextAreaField = ({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-slate-500">{label}</Label>
    <Textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      className="bg-white"
    />
  </div>
);

const ListField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <TextField
    label={`${label} (comma separated)`}
    value={value}
    onChange={onChange}
    placeholder="e.g. Item one, Item two"
  />
);

const SelectField = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-slate-500">{label}</Label>
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="bg-white w-full">
        <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o} className="capitalize">
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const SwitchField = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
    <span className="text-sm text-slate-700">{label}</span>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

const SaveBar = ({
  onSave,
  saving,
  saved,
  label = "Save Changes",
}: {
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  label?: string;
}) => (
  <div className="flex items-center gap-3">
    <Button onClick={onSave} disabled={saving} className="gap-2">
      {saving ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Save size={16} />
      )}
      {saving ? "Saving…" : label}
    </Button>
    {saved && !saving && (
      <span className="text-sm font-medium text-green-600">Saved ✓</span>
    )}
  </div>
);

/* ── Shared card helpers ───────────────────────────────────────────────── */
type AgentFormValues = {
  name: string; title: string; email: string; phone: string; whatsapp: string;
  agencyName: string; rera: string; experience: string; bio: string; longBio: string;
  locations: string; specialisations: string; languages: string; achievements: string;
  isActive: boolean; verified: boolean; topAgent: boolean; featured: boolean;
  avatarColor: string; coverColor: string; coverImage: string;
  metaTitle: string; metaDescription: string;
};

type LandlordFormValues = {
  name: string; email: string; title: string; phone: string; whatsapp: string;
  bio: string; longBio: string;
  address: string; city: string; state: string; pincode: string;
  totalProperties: string; activeListings: string;
  propertyTypes: string; locations: string; languages: string;
  isCompany: boolean; companyName: string; gstin: string; pan: string;
  isVerified: boolean; identityVerified: boolean; featured: boolean; isActive: boolean;
  contactMethod: string; availableTimings: string; acceptsVisits: boolean;
  avatarColor: string; coverImage: string;
  metaTitle: string; metaDescription: string;
};

const CardShell = ({
  title,
  icon: Icon,
  iconClass,
  headerClass,
  children,
}: {
  title: string;
  icon: React.ElementType;
  iconClass: string;
  headerClass: string;
  children: React.ReactNode;
}) => (
  <Card className="border border-gray-200 shadow-lg rounded-2xl">
    <CardHeader className={`border-b rounded-t-2xl p-5 ${headerClass}`}>
      <CardTitle className="flex items-center gap-2 text-base">
        <Icon size={18} className={iconClass} /> {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-5 space-y-5">{children}</CardContent>
  </Card>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{children}</p>
);

const NoProfileNote = ({ role }: { role: string }) => (
  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
    No {role} profile exists for this account yet. Fill in the details below and
    click <span className="font-medium">Create {role === "agent" ? "Agent" : "Landlord"} Profile</span>.
  </div>
);

const ColorField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-slate-500">{label}</Label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-12 cursor-pointer rounded border border-gray-200 bg-white"
      />
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="bg-white" />
    </div>
  </div>
);

/* ── Agent edit card ───────────────────────────────────────────────────── */
const AgentEditCard = ({
  agent,
  form,
  af,
  saving,
  saved,
  onSave,
  isCreate,
}: {
  agent?: any;
  form: AgentFormValues;
  af: (key: keyof AgentFormValues) => (v: string | boolean) => void;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  isCreate: boolean;
}) => {
  return (
    <CardShell title="Agent Profile" icon={Briefcase} iconClass="text-blue-600" headerClass="bg-blue-50/60">
      {isCreate && <NoProfileNote role="agent" />}

      <div>
        <SectionHeading>Basic Info</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Name" value={form.name} onChange={af("name")} />
          <TextField label="Title" value={form.title} onChange={af("title")} placeholder="e.g. Senior Property Advisor" />
          <TextField label="Email" type="email" value={form.email} onChange={af("email")} />
          <TextField label="Phone" value={form.phone} onChange={af("phone")} />
          <TextField label="WhatsApp" value={form.whatsapp} onChange={af("whatsapp")} />
          <TextField label="Agency Name" value={form.agencyName} onChange={af("agencyName")} />
          <TextField label="RERA Number" value={form.rera} onChange={af("rera")} />
          <TextField label="Experience (years)" type="number" value={form.experience} onChange={af("experience")} />
        </div>
      </div>

      <div>
        <SectionHeading>About</SectionHeading>
        <div className="space-y-4">
          <TextAreaField label="Short Bio" value={form.bio} onChange={af("bio")} rows={2} />
          <TextAreaField label="Detailed Bio" value={form.longBio} onChange={af("longBio")} rows={4} />
        </div>
      </div>

      <div>
        <SectionHeading>Service Areas</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ListField label="Locations" value={form.locations} onChange={af("locations")} />
          <ListField label="Specialisations" value={form.specialisations} onChange={af("specialisations")} />
          <ListField label="Languages" value={form.languages} onChange={af("languages")} />
          <ListField label="Achievements" value={form.achievements} onChange={af("achievements")} />
        </div>
      </div>

      <div>
        <SectionHeading>Status & Verification</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <SwitchField label="Active" checked={form.isActive} onChange={af("isActive")} />
            <SwitchField label="Verified" checked={form.verified} onChange={af("verified")} />
            <SwitchField label="Top Agent" checked={form.topAgent} onChange={af("topAgent")} />
            <SwitchField label="Featured" checked={form.featured} onChange={af("featured")} />
          </div>
        </div>
      </div>

      <div>
        <SectionHeading>Branding & SEO</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ColorField label="Avatar Color" value={form.avatarColor} onChange={af("avatarColor")} />
          <ColorField label="Cover Color" value={form.coverColor} onChange={af("coverColor")} />
          <TextField label="Cover Image URL" value={form.coverImage} onChange={af("coverImage")} />
          <TextField label="Meta Title" value={form.metaTitle} onChange={af("metaTitle")} />
          <TextAreaField label="Meta Description" value={form.metaDescription} onChange={af("metaDescription")} rows={2} />
        </div>
      </div>

      <SaveBar onSave={onSave} saving={saving} saved={saved} label={isCreate ? "Create Agent Profile" : "Save Changes"} />
    </CardShell>
  );
};

/* ── Landlord edit card ────────────────────────────────────────────────── */
const LandlordEditCard = ({
  landlord,
  form,
  lf,
  saving,
  saved,
  onSave,
  isCreate,
}: {
  landlord?: any;
  form: LandlordFormValues;
  lf: (key: keyof LandlordFormValues) => (v: string | boolean) => void;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  isCreate: boolean;
}) => {
  return (
    <CardShell title="Landlord Profile" icon={Landmark} iconClass="text-amber-600" headerClass="bg-amber-50/60">
      {isCreate && <NoProfileNote role="landlord" />}

      <div>
        <SectionHeading>Basic Info</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Name" value={form.name} onChange={lf("name")} />
          <TextField label="Title" value={form.title} onChange={lf("title")} placeholder="e.g. Property Owner" />
          <TextField label="Email" type="email" value={form.email} onChange={lf("email")} />
          <TextField label="Phone" value={form.phone} onChange={lf("phone")} />
          <TextField label="WhatsApp" value={form.whatsapp} onChange={lf("whatsapp")} />
        </div>
      </div>

      <div>
        <SectionHeading>About</SectionHeading>
        <div className="space-y-4">
          <TextAreaField label="Short Bio" value={form.bio} onChange={lf("bio")} rows={2} />
          <TextAreaField label="Detailed Bio" value={form.longBio} onChange={lf("longBio")} rows={4} />
        </div>
      </div>

      <div>
        <SectionHeading>Address</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Address" value={form.address} onChange={lf("address")} />
          <TextField label="City" value={form.city} onChange={lf("city")} />
          <TextField label="State" value={form.state} onChange={lf("state")} />
          <TextField label="Pincode" value={form.pincode} onChange={lf("pincode")} />
        </div>
      </div>

      <div>
        <SectionHeading>Portfolio & Service Areas</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Total Properties" type="number" value={form.totalProperties} onChange={lf("totalProperties")} />
          <TextField label="Active Listings" type="number" value={form.activeListings} onChange={lf("activeListings")} />
          <ListField label="Property Types" value={form.propertyTypes} onChange={lf("propertyTypes")} />
          <ListField label="Locations" value={form.locations} onChange={lf("locations")} />
          <ListField label="Languages" value={form.languages} onChange={lf("languages")} />
        </div>
      </div>

      <div>
        <SectionHeading>Company & Tax Details</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SwitchField label="Company / Corporate Landlord" checked={form.isCompany} onChange={lf("isCompany")} />
          <TextField label="Company Name" value={form.companyName} onChange={lf("companyName")} />
          <TextField label="GSTIN" value={form.gstin} onChange={lf("gstin")} />
          <TextField label="PAN" value={form.pan} onChange={lf("pan")} />
        </div>
      </div>

      <div>
        <SectionHeading>Status, Verification & Preferences</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <SwitchField label="Active" checked={form.isActive} onChange={lf("isActive")} />
            <SwitchField label="Verified" checked={form.isVerified} onChange={lf("isVerified")} />
            <SwitchField label="Identity Verified" checked={form.identityVerified} onChange={lf("identityVerified")} />
            <SwitchField label="Featured" checked={form.featured} onChange={lf("featured")} />
            <SwitchField label="Accepts Site Visits" checked={form.acceptsVisits} onChange={lf("acceptsVisits")} />
          </div>
          <SelectField label="Preferred Contact Method" value={form.contactMethod} options={["phone", "email", "whatsapp"]} onChange={lf("contactMethod")} />
          <TextField label="Available Timings" value={form.availableTimings} onChange={lf("availableTimings")} placeholder="e.g. 10:00 AM - 6:00 PM" />
        </div>
      </div>

      <div>
        <SectionHeading>Branding & SEO</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ColorField label="Avatar Color" value={form.avatarColor} onChange={lf("avatarColor")} />
          <TextField label="Cover Image URL" value={form.coverImage} onChange={lf("coverImage")} />
          <TextField label="Meta Title" value={form.metaTitle} onChange={lf("metaTitle")} />
          <TextAreaField label="Meta Description" value={form.metaDescription} onChange={lf("metaDescription")} rows={2} />
        </div>
      </div>

      <SaveBar onSave={onSave} saving={saving} saved={saved} label={isCreate ? "Create Landlord Profile" : "Save Changes"} />
    </CardShell>
  );
};

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function EditUserPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const router = useRouter();

  const { data: user, isLoading, error } = useGetUserByIdQuery(id, { skip: !id });
  const role = user?.role || "user";

  const { data: agent, isLoading: agentLoading } = useGetAgentByUserIdQuery(id, {
    skip: !id || role !== "agent",
  });
  const { data: landlord, isLoading: landlordLoading } = useGetLandlordByUserIdQuery(id, {
    skip: !id || role !== "landlord",
  });

  const [updateUser, { isLoading: savingUser }] = useUpdateUserMutation();
  const [updateAgent, { isLoading: savingAgent }] = useUpdateAgentByUserIdMutation();
  const [createAgentProfile, { isLoading: creatingAgent }] = useCreateAgentByUserIdMutation();
  const [createLandlordProfile, { isLoading: creatingLandlord }] = useCreateLandlordByUserIdMutation();
  const [updateLandlord, { isLoading: savingLandlord }] = useUpdateLandlordProfileMutation();

  /* Account form state */
  const [account, setAccount] = useState({ name: "", email: "", phone: "", role: "user", isActive: true });
  const [userSaved, setUserSaved] = useState(false);

  /* Agent form state */
  const emptyAgent = useMemo(
    () => ({
      name: "", title: "", email: "", phone: "", whatsapp: "", agencyName: "", rera: "",
      experience: "0", bio: "", longBio: "",
      locations: "", specialisations: "", languages: "", achievements: "",
      isActive: true, verified: false, topAgent: false, featured: false,
      avatarColor: "#4161df", coverColor: "#0d1640", coverImage: "",
      metaTitle: "", metaDescription: "",
    }),
    [],
  );
  const [agentForm, setAgentForm] = useState(emptyAgent);
  const [agentSaved, setAgentSaved] = useState(false);

  /* Landlord form state */
  const emptyLandlord = useMemo(
    () => ({
      name: "", email: "", title: "", phone: "", whatsapp: "",
      bio: "", longBio: "",
      address: "", city: "", state: "", pincode: "",
      totalProperties: "0", activeListings: "0",
      propertyTypes: "", locations: "", languages: "",
      isCompany: false, companyName: "", gstin: "", pan: "",
      isVerified: false, identityVerified: false, featured: false, isActive: true,
      contactMethod: "phone", availableTimings: "", acceptsVisits: true,
      avatarColor: "#4161df", coverImage: "",
      metaTitle: "", metaDescription: "",
    }),
    [],
  );
  const [landlordForm, setLandlordForm] = useState(emptyLandlord);
  const [landlordSaved, setLandlordSaved] = useState(false);

  /* Hydrate forms when data arrives */
  useEffect(() => {
    if (!user) return;
    setAccount({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "user",
      isActive: user.isActive ?? true,
    });
  }, [user]);

  useEffect(() => {
    if (!agent) return;
    setAgentForm({
      name: agent.name || "",
      title: agent.title || "",
      email: agent.email || "",
      phone: agent.phone || "",
      whatsapp: agent.whatsapp || "",
      agencyName: agent.agencyName || "",
      rera: agent.rera || "",
      experience: String(agent.experience ?? 0),
      bio: agent.bio || "",
      longBio: agent.longBio || "",
      locations: joinList(agent.locations),
      specialisations: joinList(agent.specialisations),
      languages: joinList(agent.languages),
      achievements: joinList(agent.achievements),
      isActive: agent.isActive !== false,
      verified: Boolean(agent.verified),
      topAgent: Boolean(agent.topAgent),
      featured: Boolean(agent.featured),
      avatarColor: agent.avatarColor || "#4161df",
      coverColor: agent.coverColor || "#0d1640",
      coverImage: agent.coverImage || "",
      metaTitle: agent.metaTitle || "",
      metaDescription: agent.metaDescription || "",
    });
  }, [agent]);

  useEffect(() => {
    if (!landlord) return;
    setLandlordForm({
      name: landlord.name || "",
      email: landlord.email || "",
      title: landlord.title || "",
      phone: landlord.phone || "",
      whatsapp: landlord.whatsapp || "",
      bio: landlord.bio || "",
      longBio: landlord.longBio || "",
      address: landlord.address || "",
      city: landlord.city || "",
      state: landlord.state || "",
      pincode: landlord.pincode || "",
      totalProperties: String(landlord.totalProperties ?? 0),
      activeListings: String(landlord.activeListings ?? 0),
      propertyTypes: joinList(landlord.propertyTypes),
      locations: joinList(landlord.locations),
      languages: joinList(landlord.languages),
      isCompany: Boolean(landlord.isCompany),
      companyName: landlord.companyName || "",
      gstin: landlord.gstin || "",
      pan: landlord.pan || "",
      isVerified: Boolean(landlord.isVerified),
      identityVerified: Boolean(landlord.identityVerified),
      featured: Boolean(landlord.featured),
      isActive: landlord.isActive !== false,
      contactMethod: landlord.preferences?.contactMethod || "phone",
      availableTimings: landlord.preferences?.availableTimings || "",
      acceptsVisits: landlord.preferences?.acceptsVisits ?? true,
      avatarColor: landlord.avatarColor || "#4161df",
      coverImage: landlord.coverImage || "",
      metaTitle: landlord.metaTitle || "",
      metaDescription: landlord.metaDescription || "",
    });
  }, [landlord]);

  /* When a profile doesn't exist yet, seed the form from the user account */
  useEffect(() => {
    if (role !== "agent" || agentLoading || agent) return;
    setAgentForm((p) => ({
      ...p,
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    }));
  }, [role, agent, agentLoading, user]);

  useEffect(() => {
    if (role !== "landlord" || landlordLoading || landlord) return;
    setLandlordForm((p) => ({
      ...p,
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    }));
  }, [role, landlord, landlordLoading, user]);

  const af = (key: keyof typeof agentForm) => (v: string | boolean) =>
    setAgentForm((p) => ({ ...p, [key]: v }));
  const lf = (key: keyof typeof landlordForm) => (v: string | boolean) =>
    setLandlordForm((p) => ({ ...p, [key]: v }));

  /* Save handlers */
  const handleSaveUser = async () => {
    try {
      await updateUser({ id, data: { ...account } }).unwrap();
      setUserSaved(true);
      setTimeout(() => setUserSaved(false), 2500);
      toast({ title: "User account updated" });
    } catch (e: any) {
      toast({
        title: "Failed to update user",
        description: getErrMsg(e),
        variant: "destructive",
      });
    }
  };

  const agentPayload = () => ({
    name: agentForm.name,
    title: agentForm.title,
    email: agentForm.email,
    phone: agentForm.phone,
    whatsapp: agentForm.whatsapp,
    agencyName: agentForm.agencyName,
    rera: agentForm.rera,
    experience: Number(agentForm.experience) || 0,
    bio: agentForm.bio,
    longBio: agentForm.longBio,
    locations: splitList(agentForm.locations),
    specialisations: splitList(agentForm.specialisations),
    languages: splitList(agentForm.languages),
    achievements: splitList(agentForm.achievements),
    isActive: agentForm.isActive,
    verified: agentForm.verified,
    topAgent: agentForm.topAgent,
    featured: agentForm.featured,
    avatarColor: agentForm.avatarColor,
    coverColor: agentForm.coverColor,
    coverImage: agentForm.coverImage,
    metaTitle: agentForm.metaTitle,
    metaDescription: agentForm.metaDescription,
  });

  const handleSaveAgent = async () => {
    try {
      await updateAgent({ userId: id, data: agentPayload() }).unwrap();
      setAgentSaved(true);
      setTimeout(() => setAgentSaved(false), 2500);
      toast({ title: "Agent profile updated" });
    } catch (e: any) {
      toast({
        title: "Failed to update agent profile",
        description: getErrMsg(e),
        variant: "destructive",
      });
    }
  };

  const handleCreateAgent = async () => {
    try {
      await createAgentProfile({ userId: id, data: agentPayload() }).unwrap();
      setAgentSaved(true);
      setTimeout(() => setAgentSaved(false), 2500);
      toast({ title: "Agent profile created" });
    } catch (e: any) {
      toast({
        title: "Failed to create agent profile",
        description: getErrMsg(e),
        variant: "destructive",
      });
    }
  };

  const landlordPayload = () => ({
    name: landlordForm.name,
    email: landlordForm.email,
    title: landlordForm.title,
    phone: landlordForm.phone,
    whatsapp: landlordForm.whatsapp,
    bio: landlordForm.bio,
    longBio: landlordForm.longBio,
    address: landlordForm.address,
    city: landlordForm.city,
    state: landlordForm.state,
    pincode: landlordForm.pincode,
    totalProperties: Number(landlordForm.totalProperties) || 0,
    activeListings: Number(landlordForm.activeListings) || 0,
    propertyTypes: splitList(landlordForm.propertyTypes),
    locations: splitList(landlordForm.locations),
    languages: splitList(landlordForm.languages),
    isCompany: landlordForm.isCompany,
    companyName: landlordForm.companyName,
    gstin: landlordForm.gstin,
    pan: landlordForm.pan,
    isVerified: landlordForm.isVerified,
    identityVerified: landlordForm.identityVerified,
    featured: landlordForm.featured,
    isActive: landlordForm.isActive,
    preferences: {
      contactMethod: landlordForm.contactMethod,
      availableTimings: landlordForm.availableTimings,
      acceptsVisits: landlordForm.acceptsVisits,
    },
    avatarColor: landlordForm.avatarColor,
    coverImage: landlordForm.coverImage,
    metaTitle: landlordForm.metaTitle,
    metaDescription: landlordForm.metaDescription,
  });

  const handleSaveLandlord = async () => {
    if (!landlord?._id) return;
    try {
      await updateLandlord({ id: landlord._id, data: landlordPayload() }).unwrap();
      setLandlordSaved(true);
      setTimeout(() => setLandlordSaved(false), 2500);
      toast({ title: "Landlord profile updated" });
    } catch (e: any) {
      toast({
        title: "Failed to update landlord profile",
        description: getErrMsg(e),
        variant: "destructive",
      });
    }
  };

  const handleCreateLandlord = async () => {
    try {
      await createLandlordProfile({ userId: id, data: landlordPayload() }).unwrap();
      setLandlordSaved(true);
      setTimeout(() => setLandlordSaved(false), 2500);
      toast({ title: "Landlord profile created" });
    } catch (e: any) {
      toast({
        title: "Failed to create landlord profile",
        description: getErrMsg(e),
        variant: "destructive",
      });
    }
  };

  /* Loading / error states */
  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <Card className="rounded-2xl">
          <CardContent className="p-6 text-sm text-gray-500">
            User not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const showAgentCard = role === "agent";
  const showLandlordCard = role === "landlord";
  const profileLoading =
    (showAgentCard && agentLoading) || (showLandlordCard && landlordLoading);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.push(`/users/${id}`)}>
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit User</h1>
            <p className="text-sm text-slate-500">
              {user.name} · <span className="capitalize">{role}</span>
            </p>
          </div>
        </div>
        <Link
          href={`/users/${id}`}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          View details →
        </Link>
      </div>

      {/* Account card */}
      <Card className="border border-gray-200 shadow-lg rounded-2xl">
        <CardHeader className="border-b bg-slate-50/60 rounded-t-2xl p-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserIcon size={18} className="text-slate-600" /> Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Full Name" value={account.name} onChange={(v) => setAccount((p) => ({ ...p, name: v }))} />
            <TextField label="Email" type="email" value={account.email} onChange={(v) => setAccount((p) => ({ ...p, email: v }))} />
            <TextField label="Phone" value={account.phone} onChange={(v) => setAccount((p) => ({ ...p, phone: v }))} />
            <SelectField
              label="Role"
              value={account.role}
              options={ROLES}
              onChange={(v) => setAccount((p) => ({ ...p, role: v }))}
            />
          </div>
          <SwitchField
            label="Account Active"
            checked={account.isActive}
            onChange={(v) => setAccount((p) => ({ ...p, isActive: v }))}
          />
          <SaveBar onSave={handleSaveUser} saving={savingUser} saved={userSaved} />
        </CardContent>
      </Card>

      {profileLoading && (
        <Card className="rounded-2xl">
          <CardContent className="p-6 space-y-3">
            <p className="text-sm font-medium text-slate-500">Loading professional profile…</p>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Agent profile card */}
      {showAgentCard && !agentLoading && (
        <AgentEditCard
          agent={agent}
          isCreate={!agent}
          form={agentForm}
          af={af}
          saving={savingAgent || creatingAgent}
          saved={agentSaved}
          onSave={agent ? handleSaveAgent : handleCreateAgent}
        />
      )}

      {/* Landlord profile card */}
      {showLandlordCard && !landlordLoading && (
        <LandlordEditCard
          landlord={landlord}
          isCreate={!landlord}
          form={landlordForm}
          lf={lf}
          saving={savingLandlord || creatingLandlord}
          saved={landlordSaved}
          onSave={landlord ? handleSaveLandlord : handleCreateLandlord}
        />
      )}

      {/* Roles without professional profiles */}
      {!showAgentCard && !showLandlordCard && (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="flex items-center gap-3 p-5 text-sm text-slate-500">
            <Badge variant="secondary" className="capitalize">{role}</Badge>
            This role has no separate professional profile to edit.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
