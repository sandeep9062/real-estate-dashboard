"use client";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Ruler,
  Car,
  Edit,
  Eye,
  Phone,
  Star,
  Shield,
  Zap,
  Droplets,
  Lock,
  Clipboard,
  Tag,
  Home,
  Building2,
  IndianRupee,
  Bed,
  Bath,
  Boxes,
  TreePine,
  Users,
  Globe,
  Heart,
  Share2,
  Video,
  ExternalLink,
  CircleCheck,
  CircleX,
} from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGetPropertyQuery } from "@/services/propertiesApi";
import { Skeleton } from "@/components/ui/skeleton";

/* ── Small helpers ─────────────────────────────────────────────────────── */
const formatPrice = (price?: number | null) => {
  if (price == null) return "N/A";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (date?: string | Date | null) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const renderArea = (area?: { value?: number; unit?: string } | null) => {
  if (!area?.value) return "N/A";
  return `${area.value.toLocaleString("en-IN")} ${area.unit || "sqft"}`;
};

const fmtList = (arr?: string[] | null) =>
  Array.isArray(arr) && arr.length > 0 ? arr : null;

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

const VerifiedBadge = ({ verified }: { verified?: boolean }) =>
  verified ? (
    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
      <CircleCheck size={12} className="mr-1" /> Verified
    </Badge>
  ) : (
    <Badge variant="secondary" className="text-slate-500">
      <CircleX size={12} className="mr-1" /> Unverified
    </Badge>
  );

export default function PropertyView() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { data, error, isLoading } = useGetPropertyQuery(id);
  const p = data?.data ?? data;

  /* ── Loading ───────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-72" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  /* ── Error ─────────────────────────────────────────────────────────── */
  if (error || !p) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Property not found
          </h2>
          <p className="text-slate-500 mt-2">
            The property you&apos;re looking for doesn&apos;t exist or was removed.
          </p>
          <Button onClick={() => router.push("/properties")} className="mt-4">
            ← Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  /* ── Derived values ────────────────────────────────────────────────── */
  const images = Array.isArray(p.image) ? p.image : [];
  const floorPlans = Array.isArray(p.floorPlanImages) ? p.floorPlanImages : [];
  const facilities = p.facilities || {};
  const location = p.location || {};
  const nearby = p.nearbyPlaces || {};
  const isCommercial = p.type === "Commercial";
  const coords =
    location.coordinates?.lat != null && location.coordinates?.lng != null
      ? { lat: location.coordinates.lat, lng: location.coordinates.lng }
      : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in pb-10">
      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.push("/properties")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{p.title}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin size={14} />
              {location.address || "Address not specified"}
              {location.city && `, ${location.city}`}
              {location.sector && `, Sector ${location.sector}`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/properties/edit/${p._id}`)}>
            <Edit size={14} className="mr-1.5" /> Edit
          </Button>
        </div>
      </div>

      {/* ── IMAGE GALLERY ───────────────────────────────────────────── */}
      {images.length > 0 && (
        <div className="grid gap-2 overflow-hidden rounded-xl md:grid-cols-4 md:grid-rows-2">
          {images.slice(0, 5).map((img: string | File, i: number) => (
            <div
              key={i}
              className={`relative overflow-hidden bg-slate-100 ${
                i === 0 ? "md:col-span-2 md:row-span-2 aspect-square md:aspect-auto" : "aspect-square"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={typeof img === "string" ? img : URL.createObjectURL(img)} alt={`${p.title} ${i + 1}`} className="h-full w-full object-cover" />
              {i === 4 && images.length > 5 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-semibold text-lg">
                  +{images.length - 5} more
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── MAIN COLUMN ───────────────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          {/* KEY STATS */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary" className="capitalize">{p.deal}</Badge>
                <Badge variant="outline" className="capitalize">{p.type}</Badge>
                {p.propertyCategory && <Badge variant="outline">{p.propertyCategory}</Badge>}
                <VerifiedBadge verified={p.isVerified} />
                {p.isFeatured && (
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                    <Star size={12} className="mr-1" /> Featured
                  </Badge>
                )}
                {!p.isActive && <Badge variant="destructive">Inactive</Badge>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
                <IconWithLabel icon={IndianRupee} label="Price" value={formatPrice(p.price)} />
                <IconWithLabel icon={Ruler} label="Area" value={renderArea(p.area)} />
                <IconWithLabel icon={Home} label="Furnishing" value={p.furnishing || "N/A"} />
                <IconWithLabel icon={Calendar} label="Availability" value={p.availability || "N/A"} />
              </div>
            </CardContent>
          </Card>

          {/* DESCRIPTION */}
          {p.description && (
            <Card>
              <CardHeader><CardTitle>About this property</CardTitle></CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{p.description}</p>
              </CardContent>
            </Card>
          )}

          {/* FACILITIES */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Boxes size={20} /> Facilities</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <IconWithLabel icon={Bed} label="Bedrooms" value={facilities.bedrooms ?? "—"} />
                <IconWithLabel icon={Bath} label="Bathrooms" value={facilities.bathrooms ?? "—"} />
                <IconWithLabel icon={Car} label="Parkings" value={facilities.parkings ?? "—"} />
                <IconWithLabel icon={Boxes} label="Balconies" value={facilities.balconies ?? "—"} />
                <IconWithLabel icon={Home} label="Servant Rooms" value={facilities.servantRooms ?? "—"} />
                <IconWithLabel icon={Building2} label="Total Floors" value={facilities.totalFloors ?? "—"} />
              </div>
              <Separator className="my-4" />
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailRow label="Parking type" value={facilities.parkingType} />
                <DetailRow label="Water supply" value={facilities.waterSupply} />
                <DetailRow label="Power backup" value={facilities.powerBackup ? "Yes" : "No"} />
                <DetailRow label="Facing" value={p.facing} />
              </div>
              {fmtList(facilities.securityFeatures) && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-slate-500 mb-2">Security</p>
                  <div className="flex flex-wrap gap-2">
                    {facilities.securityFeatures.map((s: string) => (
                      <Badge key={s} variant="secondary" className="gap-1"><Shield size={12} /> {s}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AREA DETAILS */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Ruler size={20} /> Area Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Total Area</p>
                  <p className="text-lg font-semibold">{renderArea(p.area)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Carpet Area</p>
                  <p className="text-lg font-semibold">{renderArea(p.area?.carpetArea)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Super Built-up</p>
                  <p className="text-lg font-semibold">{renderArea(p.area?.superBuiltUpArea)}</p>
                </div>
              </div>
              {(p.ageOfProperty != null || p.floor != null) && (
                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                  <DetailRow label="Age" value={p.ageOfProperty != null ? `${p.ageOfProperty} yrs` : undefined} />
                  <DetailRow label="Floor" value={p.floor} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* AMENITIES */}
          {fmtList(p.amenities) && (
            <Card>
              <CardHeader><CardTitle>Amenities</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {p.amenities.map((a: string) => (<Badge key={a} variant="secondary">{a}</Badge>))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* COMMERCIAL */}
          {isCommercial && (fmtList(p.commercialPropertyTypes) || fmtList(p.investmentOptions)) && (
            <Card>
              <CardHeader><CardTitle>Commercial Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {fmtList(p.commercialPropertyTypes) && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">Property types</p>
                    <div className="flex flex-wrap gap-2">
                      {p.commercialPropertyTypes.map((t: string) => (<Badge key={t} variant="secondary">{t}</Badge>))}
                    </div>
                  </div>
                )}
                {fmtList(p.investmentOptions) && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">Investment options</p>
                    <div className="flex flex-wrap gap-2">
                      {p.investmentOptions.map((o: string) => (<Badge key={o} variant="secondary">{o}</Badge>))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* NEARBY PLACES */}
          {(fmtList(nearby.schools) || fmtList(nearby.hospitals) || fmtList(nearby.metroStations) || fmtList(nearby.malls)) && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><MapPin size={20} /> Nearby Places</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {fmtList(nearby.schools) && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Schools</p>
                    <div className="flex flex-wrap gap-2">{nearby.schools.map((s: string) => (<Badge key={s} variant="outline">{s}</Badge>))}</div>
                  </div>
                )}
                {fmtList(nearby.hospitals) && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Hospitals</p>
                    <div className="flex flex-wrap gap-2">{nearby.hospitals.map((h: string) => (<Badge key={h} variant="outline">{h}</Badge>))}</div>
                  </div>
                )}
                {fmtList(nearby.metroStations) && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Metro / Transit</p>
                    <div className="flex flex-wrap gap-2">{nearby.metroStations.map((m: string) => (<Badge key={m} variant="outline">{m}</Badge>))}</div>
                  </div>
                )}
                {fmtList(nearby.malls) && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Malls & Shopping</p>
                    <div className="flex flex-wrap gap-2">{nearby.malls.map((m: string) => (<Badge key={m} variant="outline">{m}</Badge>))}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* FLOOR PLANS */}
          {floorPlans.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Floor Plans</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {floorPlans.map((fp: string, i: number) => (
                    <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-lg border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fp} alt={`Floor plan ${i + 1}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* LOCATION */}
          {coords && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><MapPin size={20} /> Location</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600">
                  {location.address}{location.city && `, ${location.city}`}{location.state && `, ${location.state}`}{location.pincode && ` - ${location.pincode}`}
                </p>
                <p className="text-xs text-slate-400">{coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── SIDE COLUMN ───────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* PRICING CARD */}
          <Card className="sticky top-6">
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-500">{p.deal === "Rent" ? "Monthly Rent" : "Total Price"}</p>
                <p className="text-3xl font-bold text-slate-900">{formatPrice(p.price)}</p>
                {p.pricePerSqft != null && (
                  <p className="text-sm text-slate-500">₹{p.pricePerSqft.toLocaleString("en-IN")}/sqft</p>
                )}
              </div>
              {p.deal === "Rent" && <Separator />}
              {p.deal === "Rent" && (
                <div className="space-y-2 text-sm">
                  {p.maintenanceCharge != null && <DetailRow label="Maintenance" value={`₹${p.maintenanceCharge.toLocaleString("en-IN")}`} />}
                  {p.securityDeposit != null && <DetailRow label="Security Deposit" value={`₹${p.securityDeposit.toLocaleString("en-IN")}`} />}
                  {p.lockInMonths != null && <DetailRow label="Lock-in" value={`${p.lockInMonths} months`} />}
                  {p.noticePeriodDays != null && <DetailRow label="Notice" value={`${p.noticePeriodDays} days`} />}
                </div>
              )}
              {p.deal === "Sale" && p.ocStatus && (<><Separator /><DetailRow label="OC Status" value={p.ocStatus} /></>)}
              {p.negotiable != null && (<><Separator /><DetailRow label="Negotiable" value={p.negotiable ? "Yes" : "No"} /></>)}
            </CardContent>
          </Card>

          {/* PROPERTY INFO */}
          <Card>
            <CardHeader><CardTitle>Property Information</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              <DetailRow label="Type" value={p.type} />
              <DetailRow label="Category" value={p.propertyCategory} />
              <DetailRow label="Furnishing" value={p.furnishing} />
              <DetailRow label="Facing" value={p.facing} />
              {p.deal === "Rent" && (
                <DetailRow label="Tenant Preference" value={p.tenantPreference} />
              )}
              <DetailRow label="Pets Allowed" value={p.petsAllowed ? "Yes" : "No"} />
              <DetailRow label="Posted By" value={p.postedBy} />
              <DetailRow label="Availability" value={p.availability} />
              {p.availableFrom && <DetailRow label="Available From" value={formatDate(p.availableFrom)} />}
              {p.possessionDate && <DetailRow label="Possession" value={formatDate(p.possessionDate)} />}
            </CardContent>
          </Card>

          {/* PROJECT / BUILDER */}
          {(p.projectName || p.builderName || p.totalUnits) && (
            <Card>
              <CardHeader><CardTitle>Project & Builder</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                <DetailRow label="Project" value={p.projectName} />
                <DetailRow label="Builder" value={p.builderName} />
                <DetailRow label="Total Units" value={p.totalUnits} />
                {p.ownershipType && <DetailRow label="Ownership" value={p.ownershipType} />}
                {p.approvedBy && <DetailRow label="Approved By" value={p.approvedBy} />}
                {p.reraNumber && <DetailRow label="RERA Number" value={p.reraNumber} />}
              </CardContent>
            </Card>
          )}

          {/* CONTACT */}
          {(fmtList(p.contactNumber) || p.preferredContact) && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Phone size={18} /> Contact</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {fmtList(p.contactNumber) && p.contactNumber.map((num: string, i: number) => (
                  <p key={i} className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Phone size={14} className="text-slate-400" /> {num}
                  </p>
                ))}
                {p.preferredContact && <Badge variant="outline">{p.preferredContact}</Badge>}
              </CardContent>
            </Card>
          )}

          {/* VERIFICATION */}
          <Card>
            <CardHeader><CardTitle>Verification Status</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Bulbul Verified</span><VerifiedBadge verified={p.bulbulVerified} /></div>
              <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Owner Verified</span><VerifiedBadge verified={p.ownerVerified} /></div>
              <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Visit Verified</span><VerifiedBadge verified={p.visitVerified} /></div>
            </CardContent>
          </Card>

          {/* LISTING STATUS */}
          <Card>
            <CardHeader><CardTitle>Listing Status</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              <DetailRow label="Status" value={p.listingAvailability} />
              <DetailRow label="Active" value={p.isActive ? "Yes" : "No"} />
              <DetailRow label="Featured" value={p.isFeatured ? "Yes" : "No"} />
              {p.featuredUntil && <DetailRow label="Featured Until" value={formatDate(p.featuredUntil)} />}
              <DetailRow label="Views" value={p.views?.toLocaleString("en-IN")} />
              <DetailRow label="Leads" value={p.leads?.toLocaleString("en-IN")} />
              <DetailRow label="Created" value={formatDate(p.createdAt)} />
              <DetailRow label="Updated" value={formatDate(p.updatedAt)} />
            </CardContent>
          </Card>

          {/* MEDIA LINKS */}
          {p.videoUrl && (
            <Button variant="outline" className="w-full" asChild>
              <a href={p.videoUrl} target="_blank" rel="noopener noreferrer"><Video size={16} className="mr-2" /> Watch Video Tour</a>
            </Button>
          )}
          {p.virtualTourUrl && (
            <Button variant="outline" className="w-full" asChild>
              <a href={p.virtualTourUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} className="mr-2" /> Virtual Tour</a>
            </Button>
          )}

          {/* SEO / SLUG (admin info) */}
          {(p.seoTitle || p.seoDescription || p.slug) && (
            <Card>
              <CardHeader><CardTitle className="text-sm">SEO & Slug</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-500">
                {p.slug && <DetailRow label="Slug" value={p.slug} />}
                {p.seoTitle && <DetailRow label="Title" value={p.seoTitle} />}
                {p.seoDescription && (
                  <div>
                    <p className="text-slate-400 mb-1">Description</p>
                    <p className="text-slate-600 leading-relaxed">{p.seoDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {p.adminNotes && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Clipboard size={16} /> Admin Notes</CardTitle></CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-xs text-slate-600 leading-relaxed">{p.adminNotes}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4 text-sm">
              <DetailRow label="Landlord Property" value={p.isLandlordProperty ? "Yes" : "No"} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}






