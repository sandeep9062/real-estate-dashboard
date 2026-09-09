"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  useAdminCreatePropertyMutation,
  useAdminUpdatePropertyMutation,
} from "@/services/propertiesApi";

/* ── Enums mirrored from backend/models/Property.js ─────────────────────── */
const DEALS = ["Rent", "Sale"];
const PROPERTY_TYPES = [
  "Residential",
  "Commercial",
  "Industrial",
  "Agricultural",
];
const PROPERTY_CATEGORIES = [
  "Apartment/Flat",
  "House/Villa",
  "Land/Plot",
  "Studio Apartment",
  "Builder Floor",
  "PG/Hostel",
  "Farmhouse",
  "Retail",
  "Office",
  "Industrial",
  "Warehouse",
  "Shop/Showroom",
];
const AREA_UNITS = ["sqft", "sqyard", "sqm", "marla", "kanal", "acre"];
const AVAILABILITY = ["Ready to Move", "Under Construction"];
const FURNISHING = [
  "Furnished",
  "Fully Furnished",
  "Semi Furnished",
  "Un-Furnished",
];
const TENANT_PREFERENCES = [
  "Family",
  "Bachelors",
  "Any",
  "Working Professionals",
  "Students",
];
const POSTED_BY = ["Owner", "Agent", "Builder"];
const PREFERRED_CONTACT = ["Call", "WhatsApp", "Email"];
const OWNERSHIP_TYPES = [
  "Freehold",
  "Leasehold",
  "Co-operative",
  "Power of Attorney",
];
const OC_STATUS = ["Available", "Applied", "Not issued", "NA"];
const LISTING_AVAILABILITY = [
  "Available",
  "Fresh",
  "Under offer",
  "Booked",
  "Sold",
  "Rented",
  "Review Required",
  "Non Available",
];
const PARKING_TYPES = ["None", "Open", "Covered", "Both"];
const SECURITY_FEATURES = ["CCTV", "Guard", "Biometric", "Gated"];
const WATER_SUPPLY = ["Municipal", "Borewell", "Both"];
const AMENITIES_OPTIONS = [
  "Parking",
  "Lift",
  "Power Backup",
  "Security",
  "Park",
  "Gas Pipeline",
  "Wifi",
  "Gym",
  "Swimming Pool",
  "Club House",
];
const COMMERCIAL_TYPES = [
  "Office",
  "Retail",
  "Industrial",
  "Warehouse",
  "Shop/Showroom",
];
const INVESTMENT_OPTIONS = [
  "Fractional Ownership",
  "REIT",
  "Direct Purchase",
  "Leasehold",
];

/* ── Form state shape: strings for inputs, converted on submit ──────────── */
interface PropertyFormValues {
  title: string;
  description: string;
  deal: string;
  type: string;
  propertyCategory: string;
  price: string;
  negotiable: boolean;
  pricePerSqft: string;
  ageOfProperty: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  projectId: string;
  location: {
    address: string;
    city: string;
    sector: string;
    state: string;
    country: string;
    slug: string;
    pincode: string;
    landmark: string;
    lat: string;
    lng: string;
  };
  area: { value: string; unit: string };
  carpetArea: { value: string; unit: string };
  superBuiltUpArea: { value: string; unit: string };
  availability: string;
  constructionStatus: {
    percentageComplete: string;
    currentPhase: string;
    expectedOCDate: string;
  };
  availableFrom: string;
  possessionDate: string;
  furnishing: string;
  facing: string;
  tenantPreference: string;
  postedBy: string;
  ownershipType: string;
  approvedBy: string;
  floor: string;
  maintenanceCharge: string;
  securityDeposit: string;
  lockInMonths: string;
  noticePeriodDays: string;
  ocStatus: string;
  projectName: string;
  builderName: string;
  totalUnits: string;
  contactNumbersText: string;
  preferredContact: string;
  facilities: {
    bedrooms: string;
    bathrooms: string;
    parkings: string;
    balconies: string;
    servantRooms: string;
    parkingType: string;
    waterSupply: string;
    powerBackup: boolean;
    totalFloors: string;
    securityFeatures: string[];
  };
  amenities: string[];
  nearbyPlaces: {
    schoolsText: string;
    hospitalsText: string;
    metroStationsText: string;
    mallsText: string;
  };
  commercialPropertyTypes: string[];
  investmentOptions: string[];
  tagsText: string;
  image: (File | string)[];
  floorPlanImages: string[];
  floorPlanFiles: File[];
  videoUrl: string;
  virtualTourUrl: string;
  listingAvailability: string;
  isVerified: boolean;
  isActive: boolean;
  isFeatured: boolean;
  featuredUntil: string;
  bulbulVerified: boolean;
  ownerVerified: boolean;
  visitVerified: boolean;
  adminNotes: string;
  user: string;
}

const DEFAULT_FORM: PropertyFormValues = {
  title: "",
  description: "",
  deal: "Rent",
  type: "Residential",
  propertyCategory: "Apartment/Flat",
  price: "",
  negotiable: true,
  pricePerSqft: "",
  ageOfProperty: "",
  slug: "",
  seoTitle: "",
  seoDescription: "",
  projectId: "",
  location: {
    address: "",
    city: "",
    sector: "",
    state: "",
    country: "India",
    slug: "",
    pincode: "",
    landmark: "",
    lat: "",
    lng: "",
  },
  area: { value: "", unit: "sqft" },
  carpetArea: { value: "", unit: "sqft" },
  superBuiltUpArea: { value: "", unit: "sqft" },
  availability: "Ready to Move",
  constructionStatus: {
    percentageComplete: "",
    currentPhase: "",
    expectedOCDate: "",
  },
  availableFrom: "",
  possessionDate: "",
  furnishing: "Un-Furnished",
  facing: "",
  tenantPreference: "Any",
  postedBy: "Owner",
  ownershipType: "__none__",
  approvedBy: "",
  floor: "",
  maintenanceCharge: "",
  securityDeposit: "",
  lockInMonths: "",
  noticePeriodDays: "",
  ocStatus: "__none__",
  projectName: "",
  builderName: "",
  totalUnits: "",
  contactNumbersText: "",
  preferredContact: "WhatsApp",
  facilities: {
    bedrooms: "",
    bathrooms: "",
    parkings: "",
    balconies: "",
    servantRooms: "",
    parkingType: "__none__",
    waterSupply: "__none__",
    powerBackup: false,
    totalFloors: "",
    securityFeatures: [],
  },
  amenities: [],
  nearbyPlaces: {
    schoolsText: "",
    hospitalsText: "",
    metroStationsText: "",
    mallsText: "",
  },
  commercialPropertyTypes: [],
  investmentOptions: [],
  tagsText: "",
  image: [],
  floorPlanImages: [],
  floorPlanFiles: [],
  videoUrl: "",
  virtualTourUrl: "",
  listingAvailability: "Available",
  isVerified: false,
  isActive: true,
  isFeatured: false,
  featuredUntil: "",
  bulbulVerified: false,
  ownerVerified: false,
  visitVerified: false,
  adminNotes: "",
  user: "",
};

/* ── Small presentational helpers ───────────────────────────────────────── */
const inputCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

function toOptNum(s: string): number | undefined {
  if (s == null || String(s).trim() === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function splitLines(s: string): string[] {
  return s
    .split(/\n|,/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function toDateInput(v: any): string {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

/* Leaflet map — client-side only (react-leaflet needs the DOM) */
const MapWrapper = dynamic(() => import("./MapWrapper"), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full rounded-xl bg-slate-100 animate-pulse" />
  ),
});

/* ── Main form component ────────────────────────────────────────────────── */
interface AdminPropertyFormProps {
  mode: "create" | "edit";
  propertyId?: string;
  property?: any; // hydrated property document (edit mode)
}

const AdminPropertyForm: React.FC<AdminPropertyFormProps> = ({
  mode,
  propertyId,
  property,
}) => {
  const router = useRouter();
  const [form, setForm] = useState<PropertyFormValues>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [adminCreateProperty] = useAdminCreatePropertyMutation();
  const [adminUpdateProperty] = useAdminUpdatePropertyMutation();

  const isEdit = mode === "edit";

  const update = (key: keyof PropertyFormValues, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const updateNested = (
    parent:
      | "location"
      | "area"
      | "carpetArea"
      | "superBuiltUpArea"
      | "constructionStatus"
      | "facilities"
      | "nearbyPlaces",
    key: string,
    value: any,
  ) =>
    setForm((p) => ({
      ...p,
      [parent]: { ...(p as any)[parent], [key]: value },
    }));

  const toggleArrayItem = (
    key: "amenities" | "commercialPropertyTypes" | "investmentOptions",
    item: string,
  ) =>
    setForm((p) => ({
      ...p,
      [key]: p[key].includes(item)
        ? p[key].filter((x) => x !== item)
        : [...p[key], item],
    }));

  const toggleSecurityFeature = (item: string) =>
    setForm((p) => ({
      ...p,
      facilities: {
        ...p.facilities,
        securityFeatures: p.facilities.securityFeatures.includes(item)
          ? p.facilities.securityFeatures.filter((x) => x !== item)
          : [...p.facilities.securityFeatures, item],
      },
    }));

  /* Current map marker position (only when both coordinates are valid) */
  const mapCoords = useMemo(() => {
    const lat = toOptNum(form.location.lat);
    const lng = toOptNum(form.location.lng);
    return lat != null && lng != null ? { lat, lng } : undefined;
  }, [form.location.lat, form.location.lng]);

  /* Map click → fill latitude / longitude inputs */
  const handleMapPick = ({ lat, lng }: { lat: number; lng: number }) => {
    const round = (n: number) => Number(n.toFixed(6));
    setForm((p) => ({
      ...p,
      location: {
        ...p.location,
        lat: String(round(lat)),
        lng: String(round(lng)),
      },
    }));
  };

  /* Hydrate the form from an existing property (edit mode) */
  useEffect(() => {
    if (!isEdit || !property?._id) return;
    setForm({
      ...DEFAULT_FORM,
      title: property.title || "",
      description: property.description || "",
      deal: property.deal || "Rent",
      type: property.type || "Residential",
      propertyCategory:
        property.propertyCategory || property.category || "Apartment/Flat",
      price: property.price != null ? String(property.price) : "",
      negotiable: property.negotiable !== false,
      pricePerSqft:
        property.pricePerSqft != null ? String(property.pricePerSqft) : "",
      ageOfProperty:
        property.ageOfProperty != null ? String(property.ageOfProperty) : "",
      slug: property.slug || "",
      seoTitle: property.seoTitle || "",
      seoDescription: property.seoDescription || "",
      projectId: property.projectId?._id || property.projectId || "",
      location: {
        address: property.location?.address || "",
        city: property.location?.city || "",
        sector: property.location?.sector || "",
        state: property.location?.state || "",
        country: property.location?.country || "",
        slug: property.location?.slug || "",
        pincode: property.location?.pincode || "",
        landmark: property.location?.landmark || "",
        lat:
          property.location?.coordinates?.lat != null
            ? String(property.location.coordinates.lat)
            : "",
        lng:
          property.location?.coordinates?.lng != null
            ? String(property.location.coordinates.lng)
            : "",
      },
      area: {
        value: property.area?.value != null ? String(property.area.value) : "",
        unit: property.area?.unit || "sqft",
      },
      carpetArea: {
        value:
          property.area?.carpetArea?.value != null
            ? String(property.area.carpetArea.value)
            : "",
        unit: property.area?.carpetArea?.unit || "sqft",
      },
      superBuiltUpArea: {
        value:
          property.area?.superBuiltUpArea?.value != null
            ? String(property.area.superBuiltUpArea.value)
            : "",
        unit: property.area?.superBuiltUpArea?.unit || "sqft",
      },
      availability: property.availability || "Ready to Move",
      constructionStatus: {
        percentageComplete:
          property.constructionStatus?.percentageComplete != null
            ? String(property.constructionStatus.percentageComplete)
            : "",
        currentPhase: property.constructionStatus?.currentPhase || "",
        expectedOCDate: toDateInput(
          property.constructionStatus?.expectedOCDate,
        ),
      },
      availableFrom: toDateInput(property.availableFrom),
      possessionDate: toDateInput(property.possessionDate),
      furnishing: property.furnishing || "Un-Furnished",
      facing: property.facing || "",
      tenantPreference: property.tenantPreference || "Any",
      postedBy: property.postedBy || "Owner",
      ownershipType: property.ownershipType || "__none__",
      approvedBy: property.approvedBy || "",
      floor: property.floor != null ? String(property.floor) : "",
      maintenanceCharge:
        property.maintenanceCharge != null
          ? String(property.maintenanceCharge)
          : "",
      securityDeposit:
        property.securityDeposit != null
          ? String(property.securityDeposit)
          : "",
      lockInMonths:
        property.lockInMonths != null ? String(property.lockInMonths) : "",
      noticePeriodDays:
        property.noticePeriodDays != null
          ? String(property.noticePeriodDays)
          : "",
      ocStatus: property.ocStatus || "__none__",
      projectName: property.projectName || "",
      builderName: property.builderName || "",
      totalUnits:
        property.totalUnits != null ? String(property.totalUnits) : "",
      contactNumbersText: (property.contactNumber || []).join("\n"),
      preferredContact: property.preferredContact || "WhatsApp",
      facilities: {
        bedrooms:
          property.facilities?.bedrooms != null
            ? String(property.facilities.bedrooms)
            : "",
        bathrooms:
          property.facilities?.bathrooms != null
            ? String(property.facilities.bathrooms)
            : "",
        parkings:
          property.facilities?.parkings != null
            ? String(property.facilities.parkings)
            : "",
        balconies:
          property.facilities?.balconies != null
            ? String(property.facilities.balconies)
            : "",
        servantRooms:
          property.facilities?.servantRooms != null
            ? String(property.facilities.servantRooms)
            : "",
        parkingType: property.facilities?.parkingType || "__none__",
        waterSupply: property.facilities?.waterSupply || "__none__",
        powerBackup: !!property.facilities?.powerBackup,
        totalFloors:
          property.facilities?.totalFloors != null
            ? String(property.facilities.totalFloors)
            : "",
        securityFeatures: property.facilities?.securityFeatures || [],
      },
      amenities: property.amenities || [],
      nearbyPlaces: {
        schoolsText: (property.nearbyPlaces?.schools || []).join("\n"),
        hospitalsText: (property.nearbyPlaces?.hospitals || []).join("\n"),
        metroStationsText: (property.nearbyPlaces?.metroStations || []).join(
          "\n",
        ),
        mallsText: (property.nearbyPlaces?.malls || []).join("\n"),
      },
      commercialPropertyTypes: property.commercialPropertyTypes || [],
      investmentOptions: property.investmentOptions || [],
      tagsText: (property.tags || []).join(", "),
      image: property.image || [],
      floorPlanImages: property.floorPlanImages || [],
      floorPlanFiles: [],
      videoUrl: property.videoUrl || "",
      virtualTourUrl: property.virtualTourUrl || "",
      listingAvailability: property.listingAvailability || "Available",
      isVerified: !!property.isVerified,
      isActive: property.isActive !== false,
      isFeatured: !!property.isFeatured,
      featuredUntil: toDateInput(property.featuredUntil),
      bulbulVerified: !!property.bulbulVerified,
      ownerVerified: !!property.ownerVerified,
      visitVerified: !!property.visitVerified,
      adminNotes: property.adminNotes || "",
      user: property.user?._id || property.user || "",
    });
  }, [isEdit, property?._id]);

  /* Build API payload from form state */
  const buildPayload = () => {
    const loc = form.location;
    return {
      title: form.title.trim(),
      description: form.description.trim(),
      deal: form.deal,
      type: form.type,
      propertyCategory: form.propertyCategory,
      price: toOptNum(form.price),
      negotiable: form.negotiable,
      pricePerSqft: toOptNum(form.pricePerSqft),
      ageOfProperty: toOptNum(form.ageOfProperty),
      slug: form.slug.trim() || undefined,
      seoTitle: form.seoTitle.trim(),
      seoDescription: form.seoDescription.trim(),
      projectId: form.projectId.trim() || undefined,
      location: {
        address: loc.address.trim(),
        city: loc.city.trim(),
        sector: loc.sector.trim(),
        state: loc.state.trim(),
        country: loc.country.trim(),
        slug: loc.slug.trim() || undefined,
        pincode: loc.pincode.trim(),
        landmark: loc.landmark.trim(),
        coordinates: {
          lat: toOptNum(loc.lat) ?? 0,
          lng: toOptNum(loc.lng) ?? 0,
        },
      },
      area: {
        value: toOptNum(form.area.value) ?? 0,
        unit: form.area.unit,
        carpetArea: form.carpetArea.value
          ? {
              value: toOptNum(form.carpetArea.value),
              unit: form.carpetArea.unit,
            }
          : undefined,
        superBuiltUpArea: form.superBuiltUpArea.value
          ? {
              value: toOptNum(form.superBuiltUpArea.value),
              unit: form.superBuiltUpArea.unit,
            }
          : undefined,
      },
      availability: form.availability,
      constructionStatus: {
        percentageComplete: toOptNum(
          form.constructionStatus.percentageComplete,
        ),
        currentPhase: form.constructionStatus.currentPhase.trim() || undefined,
        expectedOCDate: form.constructionStatus.expectedOCDate || undefined,
      },
      availableFrom: form.availableFrom || undefined,
      possessionDate: form.possessionDate || undefined,
      furnishing: form.furnishing,
      facing: form.facing.trim(),
      tenantPreference: form.tenantPreference,
      postedBy: form.postedBy,
      ownershipType:
        form.ownershipType === "__none__" ? undefined : form.ownershipType,
      approvedBy: form.approvedBy.trim(),
      floor: toOptNum(form.floor),
      maintenanceCharge: toOptNum(form.maintenanceCharge),
      securityDeposit: toOptNum(form.securityDeposit),
      lockInMonths: toOptNum(form.lockInMonths),
      noticePeriodDays: toOptNum(form.noticePeriodDays),
      ocStatus: form.ocStatus === "__none__" ? undefined : form.ocStatus,
      projectName: form.projectName.trim(),
      builderName: form.builderName.trim(),
      totalUnits: toOptNum(form.totalUnits),
      contactNumber: splitLines(form.contactNumbersText),
      preferredContact: form.preferredContact,
      facilities: {
        bedrooms: toOptNum(form.facilities.bedrooms),
        bathrooms: toOptNum(form.facilities.bathrooms),
        parkings: toOptNum(form.facilities.parkings),
        balconies: toOptNum(form.facilities.balconies),
        servantRooms: toOptNum(form.facilities.servantRooms),
        parkingType:
          form.facilities.parkingType === "__none__"
            ? undefined
            : form.facilities.parkingType,
        waterSupply:
          form.facilities.waterSupply === "__none__"
            ? undefined
            : form.facilities.waterSupply,
        powerBackup: form.facilities.powerBackup,
        totalFloors: toOptNum(form.facilities.totalFloors),
        securityFeatures: form.facilities.securityFeatures,
      },
      amenities: form.amenities,
      nearbyPlaces: {
        schools: splitLines(form.nearbyPlaces.schoolsText),
        hospitals: splitLines(form.nearbyPlaces.hospitalsText),
        metroStations: splitLines(form.nearbyPlaces.metroStationsText),
        malls: splitLines(form.nearbyPlaces.mallsText),
      },
      commercialPropertyTypes: form.commercialPropertyTypes,
      investmentOptions: form.investmentOptions,
      tags: splitLines(form.tagsText),
      image: form.image,
      floorPlanImages: form.floorPlanImages,
      floorPlanFiles: form.floorPlanFiles,
      videoUrl: form.videoUrl.trim(),
      virtualTourUrl: form.virtualTourUrl.trim(),
      listingAvailability: form.listingAvailability,
      isVerified: form.isVerified,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      featuredUntil: form.featuredUntil || undefined,
      bulbulVerified: form.bulbulVerified,
      ownerVerified: form.ownerVerified,
      visitVerified: form.visitVerified,
      adminNotes: form.adminNotes,
      user: form.user.trim() || undefined,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Required-field validation (mirrors the Property model)
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.description.trim()) return toast.error("Description is required");
    if (!form.price.trim()) return toast.error("Price is required");
    if (!form.location.address.trim())
      return toast.error("Location address is required");

    setSaving(true);
    try {
      const payload = buildPayload();
      if (isEdit && propertyId) {
        await adminUpdateProperty({ id: propertyId, ...payload }).unwrap();
        toast.success("Property updated successfully");
      } else {
        await adminCreateProperty(payload).unwrap();
        toast.success("Property created successfully");
      }
      router.push("/properties");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save property");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  /* Image / floor-plan handlers */
  const addImages = (files: FileList | null) => {
    if (!files?.length) return;
    setForm((p) => ({ ...p, image: [...p.image, ...Array.from(files)] }));
  };

  const removeImage = (index: number) =>
    setForm((p) => ({ ...p, image: p.image.filter((_, i) => i !== index) }));

  const addFloorPlans = (files: FileList | null) => {
    if (!files?.length) return;
    setForm((p) => ({
      ...p,
      floorPlanFiles: [...p.floorPlanFiles, ...Array.from(files)],
    }));
  };

  const removeFloorPlanFile = (index: number) =>
    setForm((p) => ({
      ...p,
      floorPlanFiles: p.floorPlanFiles.filter((_, i) => i !== index),
    }));

  const removeFloorPlanUrl = (index: number) =>
    setForm((p) => ({
      ...p,
      floorPlanImages: p.floorPlanImages.filter((_, i) => i !== index),
    }));

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/properties"
            className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEdit ? "Edit Property" : "Add New Property"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEdit
                ? "Update any field of this property listing"
                : "Post a property with every detail from the property model"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ADMIN FLAGS */}
        <Section
          title="Admin Controls"
          description="Verification, featured status, owner assignment and internal notes"
        >
          <div className="flex flex-wrap gap-6">
            <Check
              label="Verified"
              checked={form.isVerified}
              onChange={(v) => update("isVerified", v)}
            />
            <Check
              label="Active"
              checked={form.isActive}
              onChange={(v) => update("isActive", v)}
            />
            <Check
              label="Featured"
              checked={form.isFeatured}
              onChange={(v) => update("isFeatured", v)}
            />
            <Check
              label="Bulbul verified"
              checked={form.bulbulVerified}
              onChange={(v) => update("bulbulVerified", v)}
            />
            <Check
              label="Owner verified"
              checked={form.ownerVerified}
              onChange={(v) => update("ownerVerified", v)}
            />
            <Check
              label="Visit verified"
              checked={form.visitVerified}
              onChange={(v) => update("visitVerified", v)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Featured until">
              <input
                className={inputCls}
                type="date"
                value={form.featuredUntil}
                onChange={(e) => update("featuredUntil", e.target.value)}
              />
            </Field>
            <Field label="Owner user ID (leave empty to assign to yourself)">
              <input
                className={inputCls}
                value={form.user}
                onChange={(e) => update("user", e.target.value)}
                placeholder="Optional MongoDB ObjectId"
              />
            </Field>
          </div>

          {isEdit && property && (
            <div className="grid gap-4 sm:grid-cols-2 border-t pt-4">
              <div className="text-sm text-slate-600">
                Views:{" "}
                <span className="font-semibold">{property.views ?? 0}</span>
              </div>
              <div className="text-sm text-slate-600">
                Leads:{" "}
                <span className="font-semibold">{property.leads ?? 0}</span>
              </div>
            </div>
          )}

          <Field label="Admin notes (internal)">
            <textarea
              className={inputCls}
              rows={2}
              value={form.adminNotes}
              onChange={(e) => update("adminNotes", e.target.value)}
            />
          </Field>
        </Section>

        {/* CONTACT */}
        <Section title="Contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contact numbers (one per line)">
              <textarea
                className={inputCls}
                rows={2}
                value={form.contactNumbersText}
                onChange={(e) => update("contactNumbersText", e.target.value)}
                placeholder={"+91 98765 43210"}
              />
            </Field>
            <Field label="Preferred contact method">
              <select
                className={inputCls}
                value={form.preferredContact}
                onChange={(e) => update("preferredContact", e.target.value)}
              >
                {PREFERRED_CONTACT.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        {/* BASIC INFORMATION */}
        <Section title="Basic Information" description="Core listing details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" required>
              <input
                className={inputCls}
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. 3BHK Apartment in Sector 70"
              />
            </Field>
            <Field label="Price (₹)" required>
              <input
                className={inputCls}
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder={
                  form.deal === "Rent" ? "Monthly rent" : "Total asking price"
                }
              />
            </Field>
          </div>

          <Field label="Description" required>
            <textarea
              className={inputCls}
              rows={4}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe the property…"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Deal">
              <select
                className={inputCls}
                value={form.deal}
                onChange={(e) => update("deal", e.target.value)}
              >
                {DEALS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Type">
              <select
                className={inputCls}
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Property Category">
              <select
                className={inputCls}
                value={form.propertyCategory}
                onChange={(e) => update("propertyCategory", e.target.value)}
              >
                {PROPERTY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Price per sqft (₹)">
              <input
                className={inputCls}
                type="number"
                min="0"
                value={form.pricePerSqft}
                onChange={(e) => update("pricePerSqft", e.target.value)}
              />
            </Field>
            <Field label="Age of property (years)">
              <input
                className={inputCls}
                type="number"
                min="0"
                value={form.ageOfProperty}
                onChange={(e) => update("ageOfProperty", e.target.value)}
              />
            </Field>
            <Field label="Posted by">
              <select
                className={inputCls}
                value={form.postedBy}
                onChange={(e) => update("postedBy", e.target.value)}
              >
                {POSTED_BY.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex items-end pb-2">
              <Check
                label="Price negotiable"
                checked={form.negotiable}
                onChange={(v) => update("negotiable", v)}
              />
            </div>
          </div>

          <Field label="Tags (comma separated)">
            <input
              className={inputCls}
              value={form.tagsText}
              onChange={(e) => update("tagsText", e.target.value)}
              placeholder="corner unit, vastu, near metro"
            />
          </Field>
        </Section>

        {/* LOCATION */}
        <Section
          title="Location"
          description="Enter coordinates as decimal degrees (latitude / longitude)"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Address" required>
              <input
                className={inputCls}
                value={form.location.address}
                onChange={(e) =>
                  updateNested("location", "address", e.target.value)
                }
                placeholder="House / Street / Locality"
              />
            </Field>
            <Field label="City">
              <input
                className={inputCls}
                value={form.location.city}
                onChange={(e) =>
                  updateNested("location", "city", e.target.value)
                }
                placeholder="Mohali"
              />
            </Field>
            <Field label="Sector">
              <input
                className={inputCls}
                value={form.location.sector}
                onChange={(e) =>
                  updateNested("location", "sector", e.target.value)
                }
              />
            </Field>
            <Field label="State">
              <input
                className={inputCls}
                value={form.location.state}
                onChange={(e) =>
                  updateNested("location", "state", e.target.value)
                }
              />
            </Field>
            <Field label="Country">
              <input
                className={inputCls}
                value={form.location.country}
                onChange={(e) =>
                  updateNested("location", "country", e.target.value)
                }
              />
            </Field>
            <Field label="Pincode">
              <input
                className={inputCls}
                value={form.location.pincode}
                onChange={(e) =>
                  updateNested("location", "pincode", e.target.value)
                }
              />
            </Field>
            <Field label="Landmark">
              <input
                className={inputCls}
                value={form.location.landmark}
                onChange={(e) =>
                  updateNested("location", "landmark", e.target.value)
                }
              />
            </Field>
            <Field label="Location slug (URL key)">
              <input
                className={inputCls}
                value={form.location.slug}
                onChange={(e) =>
                  updateNested("location", "slug", e.target.value)
                }
              />
            </Field>
            <Field label="Latitude">
              <input
                className={inputCls}
                type="number"
                step="any"
                value={form.location.lat}
                onChange={(e) =>
                  updateNested("location", "lat", e.target.value)
                }
              />
            </Field>
            <Field label="Longitude">
              <input
                className={inputCls}
                type="number"
                step="any"
                value={form.location.lng}
                onChange={(e) =>
                  updateNested("location", "lng", e.target.value)
                }
              />
            </Field>
          </div>

          {/* MAP PICKER */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Pick location on map
            </label>
            <p className="text-xs text-slate-500">
              Click anywhere on the map to set the latitude &amp; longitude
              above — the marker follows the coordinate inputs too.
            </p>
            <div className="h-72 w-full border border-slate-200 rounded-xl overflow-hidden">
              <MapWrapper location={mapCoords} setLocation={handleMapPick} />
            </div>
          </div>
        </Section>

        {/* AREA & AVAILABILITY */}
        <Section
          title="Area & Availability"
          description="Carpet and super built-up areas support RERA compliance"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Area value">
              <input
                className={inputCls}
                type="number"
                min="0"
                value={form.area.value}
                onChange={(e) => updateNested("area", "value", e.target.value)}
              />
            </Field>
            <Field label="Area unit">
              <select
                className={inputCls}
                value={form.area.unit}
                onChange={(e) => updateNested("area", "unit", e.target.value)}
              >
                {AREA_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Availability">
              <select
                className={inputCls}
                value={form.availability}
                onChange={(e) => update("availability", e.target.value)}
              >
                {AVAILABILITY.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Carpet area value">
              <input
                className={inputCls}
                type="number"
                min="0"
                value={form.carpetArea.value}
                onChange={(e) =>
                  updateNested("carpetArea", "value", e.target.value)
                }
              />
            </Field>
            <Field label="Carpet area unit">
              <select
                className={inputCls}
                value={form.carpetArea.unit}
                onChange={(e) =>
                  updateNested("carpetArea", "unit", e.target.value)
                }
              >
                {AREA_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Super built-up value">
              <input
                className={inputCls}
                type="number"
                min="0"
                value={form.superBuiltUpArea.value}
                onChange={(e) =>
                  updateNested("superBuiltUpArea", "value", e.target.value)
                }
              />
            </Field>
            <Field label="Super built-up unit">
              <select
                className={inputCls}
                value={form.superBuiltUpArea.unit}
                onChange={(e) =>
                  updateNested("superBuiltUpArea", "unit", e.target.value)
                }
              >
                {AREA_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {form.availability === "Under Construction" && (
            <div className="grid gap-4 sm:grid-cols-3 border-t pt-4">
              <Field label="Construction complete (%)">
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  max="100"
                  value={form.constructionStatus.percentageComplete}
                  onChange={(e) =>
                    updateNested(
                      "constructionStatus",
                      "percentageComplete",
                      e.target.value,
                    )
                  }
                />
              </Field>
              <Field label="Current phase">
                <input
                  className={inputCls}
                  value={form.constructionStatus.currentPhase}
                  onChange={(e) =>
                    updateNested(
                      "constructionStatus",
                      "currentPhase",
                      e.target.value,
                    )
                  }
                  placeholder="Foundation / Structure / Finishing"
                />
              </Field>
              <Field label="Expected OC date">
                <input
                  className={inputCls}
                  type="date"
                  value={form.constructionStatus.expectedOCDate}
                  onChange={(e) =>
                    updateNested(
                      "constructionStatus",
                      "expectedOCDate",
                      e.target.value,
                    )
                  }
                />
              </Field>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Available from">
              <input
                className={inputCls}
                type="date"
                value={form.availableFrom}
                onChange={(e) => update("availableFrom", e.target.value)}
              />
            </Field>
            <Field label="Possession date">
              <input
                className={inputCls}
                type="date"
                value={form.possessionDate}
                onChange={(e) => update("possessionDate", e.target.value)}
              />
            </Field>
          </div>
        </Section>

        {/* FURNISHING & PREFERENCES */}
        <Section title="Furnishing & Preferences">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Furnishing">
              <select
                className={inputCls}
                value={form.furnishing}
                onChange={(e) => update("furnishing", e.target.value)}
              >
                {FURNISHING.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Facing">
              <input
                className={inputCls}
                value={form.facing}
                onChange={(e) => update("facing", e.target.value)}
                placeholder="e.g. North-East"
              />
            </Field>
            {form.deal === "Rent" && (
              <Field label="Tenant preference">
                <select
                  className={inputCls}
                  value={form.tenantPreference}
                  onChange={(e) => update("tenantPreference", e.target.value)}
                >
                  {TENANT_PREFERENCES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Floor number">
              <input
                className={inputCls}
                type="number"
                min="0"
                value={form.floor}
                onChange={(e) => update("floor", e.target.value)}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ownership type">
              <select
                className={inputCls}
                value={form.ownershipType}
                onChange={(e) => update("ownershipType", e.target.value)}
              >
                <option value="__none__">— Not specified —</option>
                {OWNERSHIP_TYPES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Approved by">
              <input
                className={inputCls}
                value={form.approvedBy}
                onChange={(e) => update("approvedBy", e.target.value)}
                placeholder="e.g. GMADA / PUDA"
              />
            </Field>
          </div>
        </Section>

        {/* PRICING & TERMS */}
        <Section title="Pricing & Terms">
          {form.deal === "Rent" ? (
            <div className="grid gap-4 sm:grid-cols-4">
              <Field label="Monthly maintenance (₹)">
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  value={form.maintenanceCharge}
                  onChange={(e) => update("maintenanceCharge", e.target.value)}
                />
              </Field>
              <Field label="Security deposit (₹)">
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  value={form.securityDeposit}
                  onChange={(e) => update("securityDeposit", e.target.value)}
                />
              </Field>
              <Field label="Lock-in (months)">
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  value={form.lockInMonths}
                  onChange={(e) => update("lockInMonths", e.target.value)}
                />
              </Field>
              <Field label="Notice period (days)">
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  value={form.noticePeriodDays}
                  onChange={(e) => update("noticePeriodDays", e.target.value)}
                />
              </Field>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Occupancy certificate (OC)">
                <select
                  className={inputCls}
                  value={form.ocStatus}
                  onChange={(e) => update("ocStatus", e.target.value)}
                >
                  <option value="__none__">— Not specified —</option>
                  {OC_STATUS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}
        </Section>

        {/* PROJECT & BUILDER */}
        <Section title="Project & Builder">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project name">
              <input
                className={inputCls}
                value={form.projectName}
                onChange={(e) => update("projectName", e.target.value)}
              />
            </Field>
            <Field label="Builder name">
              <input
                className={inputCls}
                value={form.builderName}
                onChange={(e) => update("builderName", e.target.value)}
              />
            </Field>
            <Field label="Total units">
              <input
                className={inputCls}
                type="number"
                min="0"
                value={form.totalUnits}
                onChange={(e) => update("totalUnits", e.target.value)}
              />
            </Field>
            <Field label="Project ID (links to a Project document)">
              <input
                className={inputCls}
                value={form.projectId}
                onChange={(e) => update("projectId", e.target.value)}
                placeholder="Optional MongoDB ObjectId"
              />
            </Field>
          </div>
        </Section>

        {/* FACILITIES */}
        <Section title="Facilities" description="Rooms, parking and utilities">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Bedrooms">
              <input
                className={inputCls}
                type="number"
                min="0"
                value={form.facilities.bedrooms}
                onChange={(e) =>
                  updateNested("facilities", "bedrooms", e.target.value)
                }
              />
            </Field>
            <Field label="Bathrooms">
              <input
                className={inputCls}
                type="number"
                min="0"
                value={form.facilities.bathrooms}
                onChange={(e) =>
                  updateNested("facilities", "bathrooms", e.target.value)
                }
              />
            </Field>
            <Field label="Balconies">
              <input
                className={inputCls}
                type="number"
                min="0"
                value={form.facilities.balconies}
                onChange={(e) =>
                  updateNested("facilities", "balconies", e.target.value)
                }
              />
            </Field>
            <Field label="Parkings">
              <input
                className={inputCls}
                type="number"
                min="0"
                value={form.facilities.parkings}
                onChange={(e) =>
                  updateNested("facilities", "parkings", e.target.value)
                }
              />
            </Field>
            <Field label="Servant rooms">
              <input
                className={inputCls}
                type="number"
                min="0"
                value={form.facilities.servantRooms}
                onChange={(e) =>
                  updateNested("facilities", "servantRooms", e.target.value)
                }
              />
            </Field>
            <Field label="Total floors">
              <input
                className={inputCls}
                type="number"
                min="0"
                value={form.facilities.totalFloors}
                onChange={(e) =>
                  updateNested("facilities", "totalFloors", e.target.value)
                }
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Parking type">
              <select
                className={inputCls}
                value={form.facilities.parkingType}
                onChange={(e) =>
                  updateNested("facilities", "parkingType", e.target.value)
                }
              >
                <option value="__none__">— Not specified —</option>
                {PARKING_TYPES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Water supply">
              <select
                className={inputCls}
                value={form.facilities.waterSupply}
                onChange={(e) =>
                  updateNested("facilities", "waterSupply", e.target.value)
                }
              >
                <option value="__none__">— Not specified —</option>
                {WATER_SUPPLY.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Security features
            </label>
            <div className="flex flex-wrap gap-4 mt-2">
              {SECURITY_FEATURES.map((s) => (
                <Check
                  key={s}
                  label={s}
                  checked={form.facilities.securityFeatures.includes(s)}
                  onChange={() => toggleSecurityFeature(s)}
                />
              ))}
            </div>
          </div>

          <Check
            label="Power backup"
            checked={form.facilities.powerBackup}
            onChange={(v) => updateNested("facilities", "powerBackup", v)}
          />
        </Section>

        {/* AMENITIES & NEARBY */}
        <Section
          title="Amenities & Nearby"
          description="Checklist amenities and neighborhood highlights"
        >
          <div>
            <label className="text-sm font-medium text-slate-700">
              Amenities
            </label>
            <div className="flex flex-wrap gap-4 mt-2">
              {AMENITIES_OPTIONS.map((a) => (
                <Check
                  key={a}
                  label={a}
                  checked={form.amenities.includes(a)}
                  onChange={() => toggleArrayItem("amenities", a)}
                />
              ))}
            </div>
          </div>

          {form.type === "Commercial" && (
            <div className="grid gap-4 sm:grid-cols-2 border-t pt-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Commercial property types
                </label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {COMMERCIAL_TYPES.map((c) => (
                    <Check
                      key={c}
                      label={c}
                      checked={form.commercialPropertyTypes.includes(c)}
                      onChange={() =>
                        toggleArrayItem("commercialPropertyTypes", c)
                      }
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Investment options
                </label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {INVESTMENT_OPTIONS.map((o) => (
                    <Check
                      key={o}
                      label={o}
                      checked={form.investmentOptions.includes(o)}
                      onChange={() => toggleArrayItem("investmentOptions", o)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nearby — schools (one per line)">
              <textarea
                className={inputCls}
                rows={2}
                value={form.nearbyPlaces.schoolsText}
                onChange={(e) =>
                  updateNested("nearbyPlaces", "schoolsText", e.target.value)
                }
              />
            </Field>
            <Field label="Nearby — hospitals (one per line)">
              <textarea
                className={inputCls}
                rows={2}
                value={form.nearbyPlaces.hospitalsText}
                onChange={(e) =>
                  updateNested("nearbyPlaces", "hospitalsText", e.target.value)
                }
              />
            </Field>
            <Field label="Nearby — metro / transit (one per line)">
              <textarea
                className={inputCls}
                rows={2}
                value={form.nearbyPlaces.metroStationsText}
                onChange={(e) =>
                  updateNested(
                    "nearbyPlaces",
                    "metroStationsText",
                    e.target.value,
                  )
                }
              />
            </Field>
            <Field label="Nearby — malls & shopping (one per line)">
              <textarea
                className={inputCls}
                rows={2}
                value={form.nearbyPlaces.mallsText}
                onChange={(e) =>
                  updateNested("nearbyPlaces", "mallsText", e.target.value)
                }
              />
            </Field>
          </div>
        </Section>

        {/* MEDIA */}
        <Section
          title="Media"
          description="Photos/videos upload to Cloudinary on save — max 100MB each"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Video URL">
              <input
                className={inputCls}
                value={form.videoUrl}
                onChange={(e) => update("videoUrl", e.target.value)}
                placeholder="https://…"
              />
            </Field>
            <Field label="Virtual tour URL">
              <input
                className={inputCls}
                value={form.virtualTourUrl}
                onChange={(e) => update("virtualTourUrl", e.target.value)}
                placeholder="https://…"
              />
            </Field>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Photos & videos
            </label>
            <label className="mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer p-8 transition">
              <Plus size={28} className="text-slate-500" />
              <span className="text-sm text-slate-600 mt-2">
                Click to browse (JPEG, PNG, WebP, GIF, MP4, MOV, WebM)
              </span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
                className="hidden"
                onChange={(e) => {
                  addImages(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>

            {form.image.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {form.image.map((item, index) => {
                  const preview =
                    typeof item === "string" ? item : URL.createObjectURL(item);
                  const isVideo =
                    item instanceof File
                      ? item.type.startsWith("video/")
                      : /\.(mp4|mov|avi|webm)$/i.test(item);
                  return (
                    <div
                      key={index}
                      className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 group bg-black"
                    >
                      {isVideo ? (
                        <video
                          src={preview}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={preview}
                          alt={`media ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                      {typeof item === "string" && (
                        <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                          Existing
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Floor plans
            </label>
            <label className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 cursor-pointer px-4 py-2 text-sm text-slate-600 transition w-max">
              <Plus size={16} />
              Add floor plan files
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => {
                  addFloorPlans(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>

            {form.floorPlanImages.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {form.floorPlanImages.map((url, index) => (
                  <div
                    key={`fp-url-${index}`}
                    className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`floor plan ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFloorPlanUrl(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                      Existing
                    </div>
                  </div>
                ))}
              </div>
            )}

            {form.floorPlanFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.floorPlanFiles.map((file, index) => (
                  <span
                    key={`fp-file-${index}`}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs"
                  >
                    {file.name}
                    <button
                      type="button"
                      onClick={() => removeFloorPlanFile(index)}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* SEO, SLUG & STATUS */}
        <Section
          title="SEO, Slug & Listing Status"
          description="Slug, SEO metadata and lifecycle status sync to the public site"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Slug (URL key)">
              <input
                className={inputCls}
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder="Auto-generated if left empty"
              />
            </Field>
            <Field label="Listing status (buyers)">
              <select
                className={inputCls}
                value={form.listingAvailability}
                onChange={(e) => update("listingAvailability", e.target.value)}
              >
                {LISTING_AVAILABILITY.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="SEO title">
              <input
                className={inputCls}
                value={form.seoTitle}
                onChange={(e) => update("seoTitle", e.target.value)}
              />
            </Field>
            <Field label="SEO description">
              <textarea
                className={inputCls}
                rows={2}
                value={form.seoDescription}
                onChange={(e) => update("seoDescription", e.target.value)}
              />
            </Field>
          </div>
        </Section>

        {/* SUBMIT */}
        <div className="flex justify-end gap-3">
          <Link
            href="/properties"
            className="px-6 py-2.5 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isEdit ? "Update Property" : "Create Property"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPropertyForm;
