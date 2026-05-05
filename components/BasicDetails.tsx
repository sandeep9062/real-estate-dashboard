"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { validateString } from "@/lib/utils";
import FloorPlanUploadSection from "./FloorPlanUploadSection";

function splitLines(s: string) {
  return s
    .split(/\n|,/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function toOptNumStr(s: string | undefined) {
  if (s == null || String(s).trim() === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

const LISTING_STATUS_OPTIONS = [
  { value: "Available", label: "Available — open enquiries" },
  { value: "Fresh", label: "Fresh listing" },
  { value: "Under offer", label: "Under offer" },
  { value: "Booked", label: "Booked / on hold" },
];

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

interface BasicDetailsProps {
  prevStep: () => void;
  nextStep: () => void;
  propertyDetails: any;
  setPropertyDetails: React.Dispatch<React.SetStateAction<any>>;
}

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(1, "Enter a valid price (min ₹1)"),
  deal: z.string(),
  type: z.string(),
  propertyCategory: z.string(),
  areaValue: z.number().min(0, "Area cannot be negative"),
  areaUnit: z.string(),
  availability: z.string(),
  furnishing: z.string(),
  postedBy: z.string(),
  commercialPropertyTypes: z.array(z.string()).optional(),
  investmentOptions: z.array(z.string()).optional(),
  listingAvailability: z.string().optional(),
  virtualTourUrl: z.string().optional(),
  schoolsText: z.string().optional(),
  metroStationsText: z.string().optional(),
  hospitalsText: z.string().optional(),
  mallsText: z.string().optional(),
  reraNumber: z.string().optional(),
  bulbulVerified: z.boolean().optional(),
  ownerVerified: z.boolean().optional(),
  visitVerified: z.boolean().optional(),
  maintenanceCharge: z.string().optional(),
  securityDeposit: z.string().optional(),
  lockInMonths: z.string().optional(),
  noticePeriodDays: z.string().optional(),
  ocStatus: z.string().optional(),
  ageOfProperty: z.string().optional(),
  pricePerSqft: z.string().optional(),
  negotiable: z.boolean().optional(),
  amenities: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

const BasicDetails: React.FC<BasicDetailsProps> = ({
  prevStep,
  nextStep,
  propertyDetails,
  setPropertyDetails,
}) => {
  const [selectedType, setSelectedType] = useState(
    propertyDetails.type || "Residential"
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      deal: "Rent",
      type: "Residential",
      propertyCategory: "Apartment/Flat",
      areaValue: 1000,
      areaUnit: "sqft",
      availability: "Ready to Move",
      furnishing: "Un-Furnished",
      postedBy: "Owner",
      commercialPropertyTypes: [],
      investmentOptions: [],
      listingAvailability: "Available",
      virtualTourUrl: "",
      schoolsText: "",
      metroStationsText: "",
      hospitalsText: "",
      mallsText: "",
      reraNumber: "",
      bulbulVerified: false,
      ownerVerified: false,
      visitVerified: false,
      maintenanceCharge: "",
      securityDeposit: "",
      lockInMonths: "",
      noticePeriodDays: "",
      ocStatus: "__none__",
      ageOfProperty: "",
      pricePerSqft: "",
      negotiable: true,
      amenities: [] as string[],
    },
  });

  const watchedType = watch("type");
  const deal = watch("deal");

  // Set form values when propertyDetails changes (for editing existing properties)
  useEffect(() => {
    setValue('title', propertyDetails.title || "");
    setValue('description', propertyDetails.description || "");
    setValue('price', propertyDetails.price || 0);
    setValue('deal', propertyDetails.deal || "Rent");
    setValue('type', propertyDetails.type || "Residential");
    setValue('propertyCategory', propertyDetails.propertyCategory || "Apartment/Flat");
    setValue('areaValue', propertyDetails.area?.value || 1000);
    setValue('areaUnit', propertyDetails.area?.unit || "sqft");
    setValue('availability', propertyDetails.availability || "Ready to Move");
    setValue('furnishing', propertyDetails.furnishing || "Un-Furnished");
    setValue('postedBy', propertyDetails.postedBy || "Owner");
    setValue('commercialPropertyTypes', propertyDetails.commercialPropertyTypes || []);
    setValue('investmentOptions', propertyDetails.investmentOptions || []);
    setValue('listingAvailability', propertyDetails.listingAvailability || "Available");
    setValue('virtualTourUrl', propertyDetails.virtualTourUrl || "");
    setValue('schoolsText', (propertyDetails.nearbyPlaces?.schools || []).join("\n"));
    setValue('metroStationsText', (propertyDetails.nearbyPlaces?.metroStations || []).join("\n"));
    setValue('hospitalsText', (propertyDetails.nearbyPlaces?.hospitals || []).join("\n"));
    setValue('mallsText', (propertyDetails.nearbyPlaces?.malls || []).join("\n"));
    setValue('reraNumber', propertyDetails.reraNumber || "");
    setValue('bulbulVerified', !!propertyDetails.bulbulVerified);
    setValue('ownerVerified', !!propertyDetails.ownerVerified);
    setValue('visitVerified', !!propertyDetails.visitVerified);
    setValue('maintenanceCharge', propertyDetails.maintenanceCharge != null ? String(propertyDetails.maintenanceCharge) : "");
    setValue('securityDeposit', propertyDetails.securityDeposit != null ? String(propertyDetails.securityDeposit) : "");
    setValue('lockInMonths', propertyDetails.lockInMonths != null ? String(propertyDetails.lockInMonths) : "");
    setValue('noticePeriodDays', propertyDetails.noticePeriodDays != null ? String(propertyDetails.noticePeriodDays) : "");
    setValue('ocStatus', propertyDetails.ocStatus || "__none__");
    setValue('ageOfProperty', propertyDetails.ageOfProperty != null ? String(propertyDetails.ageOfProperty) : "");
    setValue('pricePerSqft', propertyDetails.pricePerSqft != null ? String(propertyDetails.pricePerSqft) : "");
    setValue('negotiable', propertyDetails.negotiable !== false);
    setValue('amenities', propertyDetails.amenities || []);
  }, [propertyDetails, setValue]);

  const onSubmit = (data: FormData) => {
    const nearbyPlaces = {
      schools: splitLines(data.schoolsText || ""),
      metroStations: splitLines(data.metroStationsText || ""),
      hospitals: splitLines(data.hospitalsText || ""),
      malls: splitLines(data.mallsText || ""),
    };
    setPropertyDetails((prev: any) => ({
      ...prev,
      title: data.title,
      description: data.description,
      price: data.price,
      deal: data.deal,
      type: data.type,
      propertyCategory: data.propertyCategory,
      area: { value: data.areaValue, unit: data.areaUnit },
      availability: data.availability,
      furnishing: data.furnishing,
      postedBy: data.postedBy,
      commercialPropertyTypes: data.commercialPropertyTypes || [],
      investmentOptions: data.investmentOptions || [],
      listingAvailability: data.listingAvailability || "Available",
      virtualTourUrl: (data.virtualTourUrl || "").trim(),
      nearbyPlaces,
      reraNumber: (data.reraNumber || "").trim(),
      bulbulVerified: !!data.bulbulVerified,
      ownerVerified: !!data.ownerVerified,
      visitVerified: !!data.visitVerified,
      maintenanceCharge: toOptNumStr(data.maintenanceCharge),
      securityDeposit: toOptNumStr(data.securityDeposit),
      lockInMonths: toOptNumStr(data.lockInMonths),
      noticePeriodDays: toOptNumStr(data.noticePeriodDays),
      ocStatus:
        data.ocStatus && data.ocStatus !== "__none__"
          ? data.ocStatus
          : undefined,
      ageOfProperty: toOptNumStr(data.ageOfProperty),
      pricePerSqft: toOptNumStr(data.pricePerSqft),
      negotiable: data.negotiable !== false,
      amenities: data.amenities || [],
    }));
    nextStep();
  };

  return (
    <div className="max-w-full mx-auto my-4">
      <form
        className="flex flex-col gap-6 mt-8"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="Property Name"
            {...register("title")}
          />
          {errors.title && (
            <p className="text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Description"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            placeholder="1000"
            {...register("price", { valueAsNumber: true })}
          />
          {errors.price && (
            <p className="text-red-600">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="deal">Deal</Label>
          <Controller
            name="deal"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rent">Rent</SelectItem>
                  <SelectItem value="Sale">Sale</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setSelectedType(value);
                }}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Residential">Residential</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {watchedType === "Commercial" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Commercial Property Types</Label>
              <Controller
                name="commercialPropertyTypes"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Office",
                      "Retail",
                      "Industrial",
                      "Warehouse",
                      "Hospitality",
                      "Land",
                    ].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={field.value?.includes(type) || false}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            if (checked) {
                              field.onChange([...current, type]);
                            } else {
                              field.onChange(
                                current.filter((t: string) => t !== type)
                              );
                            }
                          }}
                        />
                        <Label htmlFor={type}>{type}</Label>
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Investment Options</Label>
              <Controller
                name="investmentOptions"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Fractional Ownership",
                      "REIT",
                      "Direct Purchase",
                      "Leasehold",
                    ].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={option}
                          checked={field.value?.includes(option) || false}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            if (checked) {
                              field.onChange([...current, option]);
                            } else {
                              field.onChange(
                                current.filter((o: string) => o !== option)
                              );
                            }
                          }}
                        />
                        <Label htmlFor={option}>{option}</Label>
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="propertyCategory">Property Category</Label>
          <Controller
            name="propertyCategory"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Apartment/Flat">Apartment/Flat</SelectItem>
                  <SelectItem value="House/Villa">House/Villa</SelectItem>
                  <SelectItem value="Land/Plot">Land/Plot</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Industrial">Industrial</SelectItem>
                  <SelectItem value="Warehouse">Warehouse</SelectItem>
                  <SelectItem value="Shop/Showroom">Shop/Showroom</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="areaValue">Area</Label>
            <Input
              id="areaValue"
              type="number"
              min="0"
              {...register("areaValue", { valueAsNumber: true })}
            />
            {errors.areaValue && (
              <p className="text-red-600">{errors.areaValue.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="areaUnit">Unit</Label>
            <Controller
              name="areaUnit"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sqft">sqft</SelectItem>
                    <SelectItem value="sqyard">sqyard</SelectItem>
                    <SelectItem value="sqm">sqm</SelectItem>
                    <SelectItem value="marla">marla</SelectItem>
                    <SelectItem value="kanal">kanal</SelectItem>
                    <SelectItem value="acre">acre</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="availability">Availability</Label>
          <Controller
            name="availability"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ready to Move">Ready to Move</SelectItem>
                  <SelectItem value="Under Construction">
                    Under Construction
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="furnishing">Furnishing</Label>
          <Controller
            name="furnishing"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Furnished">Furnished</SelectItem>
                  <SelectItem value="Semi Furnished">Semi Furnished</SelectItem>
                  <SelectItem value="Un-Furnished">Un-Furnished</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="postedBy">Posted By</Label>
          <Controller
            name="postedBy"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Owner">Owner</SelectItem>
                  <SelectItem value="Agent">Agent</SelectItem>
                  <SelectItem value="Builder">Builder</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="border-t pt-6 mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Pricing & terms</h3>
          <p className="text-sm text-gray-500">
            {deal === "Rent" ? "Price is monthly rent (₹)." : "Price is total asking amount (₹)."}
          </p>
          {deal === "Rent" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maintenanceCharge">Monthly maintenance (₹)</Label>
                <Input id="maintenanceCharge" type="number" min={0} {...register("maintenanceCharge")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="securityDeposit">Security deposit (₹)</Label>
                <Input id="securityDeposit" type="number" min={0} {...register("securityDeposit")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lockInMonths">Lock-in (months)</Label>
                <Input id="lockInMonths" type="number" min={0} {...register("lockInMonths")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="noticePeriodDays">Notice period (days)</Label>
                <Input id="noticePeriodDays" type="number" min={0} {...register("noticePeriodDays")} />
              </div>
            </div>
          )}
          {deal === "Sale" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pricePerSqft">Price per sqft (₹)</Label>
                <Input id="pricePerSqft" type="number" min={0} {...register("pricePerSqft")} />
              </div>
              <div className="space-y-2">
                <Label>Occupancy certificate (OC)</Label>
                <Controller
                  name="ocStatus"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">—</SelectItem>
                        <SelectItem value="Available">OC available</SelectItem>
                        <SelectItem value="Applied">OC applied</SelectItem>
                        <SelectItem value="Not issued">Not issued yet</SelectItem>
                        <SelectItem value="NA">Not applicable</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="ageOfProperty">Age of property (years)</Label>
            <Input id="ageOfProperty" type="number" min={0} {...register("ageOfProperty")} />
          </div>
          <div className="flex items-center space-x-2">
            <Controller
              name="negotiable"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="negotiable"
                  checked={!!field.value}
                  onCheckedChange={(c) => field.onChange(c === true)}
                />
              )}
            />
            <Label htmlFor="negotiable">Price negotiable</Label>
          </div>
          <div className="space-y-2">
            <Label>Amenities</Label>
            <Controller
              name="amenities"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {AMENITIES_OPTIONS.map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={`am-${item}`}
                        checked={field.value?.includes(item) || false}
                        onCheckedChange={(checked) => {
                          const cur = field.value || [];
                          if (checked) field.onChange([...cur, item]);
                          else field.onChange(cur.filter((x: string) => x !== item));
                        }}
                      />
                      <Label htmlFor={`am-${item}`}>{item}</Label>
                    </div>
                  ))}
                </div>
              )}
            />
          </div>
        </div>

        <div className="border-t pt-6 mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Trust, media & neighborhood
          </h3>
          <p className="text-sm text-gray-500">
            Listing status and rich media sync to the public site. Verification toggles are saved for admin workflows.
          </p>

          <div className="space-y-2">
            <Label>Listing status (buyers)</Label>
            <Controller
              name="listingAvailability"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LISTING_STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reraNumber">RERA registration ID</Label>
            <Input id="reraNumber" {...register("reraNumber")} placeholder="Optional" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center space-x-2">
              <Controller
                name="bulbulVerified"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="bulbulVerified"
                    checked={!!field.value}
                    onCheckedChange={(c) => field.onChange(c === true)}
                  />
                )}
              />
              <Label htmlFor="bulbulVerified">Bulbul verified</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Controller
                name="ownerVerified"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="ownerVerified"
                    checked={!!field.value}
                    onCheckedChange={(c) => field.onChange(c === true)}
                  />
                )}
              />
              <Label htmlFor="ownerVerified">Owner verified</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Controller
                name="visitVerified"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="visitVerified"
                    checked={!!field.value}
                    onCheckedChange={(c) => field.onChange(c === true)}
                  />
                )}
              />
              <Label htmlFor="visitVerified">Visit verified</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="virtualTourUrl">Virtual tour URL</Label>
            <Input id="virtualTourUrl" {...register("virtualTourUrl")} placeholder="https://…" />
          </div>

          <FloorPlanUploadSection
            urls={propertyDetails.floorPlanImages || []}
            files={propertyDetails.floorPlanFiles || []}
            onUrlsChange={(u) =>
              setPropertyDetails((p: any) => ({ ...p, floorPlanImages: u }))
            }
            onFilesChange={(f) =>
              setPropertyDetails((p: any) => ({ ...p, floorPlanFiles: f }))
            }
          />

          <div className="space-y-2">
            <Label htmlFor="schoolsText">Nearby — schools (one per line)</Label>
            <Textarea id="schoolsText" rows={2} {...register("schoolsText")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metroStationsText">Nearby — metro / transit</Label>
            <Textarea id="metroStationsText" rows={2} {...register("metroStationsText")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hospitalsText">Nearby — hospitals</Label>
            <Textarea id="hospitalsText" rows={2} {...register("hospitalsText")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mallsText">Nearby — malls & shopping</Label>
            <Textarea id="mallsText" rows={2} {...register("mallsText")} />
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <Button type="button" variant="outline" onClick={prevStep}>
            Back
          </Button>
          <Button type="submit">Next step</Button>
        </div>
      </form>
    </div>
  );
};

export default BasicDetails;
