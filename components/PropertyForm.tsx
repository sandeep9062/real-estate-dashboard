"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertySchema, PropertySchema } from "@/schemas/property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
} from "@/services/propertiesApi";

const AMENITIES_LIST = [
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

export default function PropertyForm({ defaultValues, mode, id }: any) {
  const isEdit = mode === "edit";
  const [createProperty] = useCreatePropertyMutation();
  const [updateProperty] = useUpdatePropertyMutation();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const form = useForm<PropertySchema>({
    resolver: zodResolver(propertySchema),
    defaultValues,
  });

  useEffect(() => {
    if (defaultValues?.image?.length) {
      setImagePreviews(
        defaultValues.image.map((img: string) =>
          typeof img === "string" ? img : URL.createObjectURL(img)
        )
      );
    }
  }, [defaultValues]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    form.setValue("image", files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const onSubmit = async (values: any) => {
    try {
      const formData = new FormData();
      ["title", "description", "deal", "type", "propertyCategory", "availability", "furnishing"].forEach(
        (key) => {
          formData.append(key, values[key]);
        }
      );

      formData.append("price", values.price.toString());
      formData.append("area[value]", values.area.value.toString());
      formData.append("area[unit]", values.area.unit);

      Object.entries(values.location).forEach(([key, val]: any) => {
        if (key === "coordinates") {
          formData.append("location[coordinates][type]", "Point");
          formData.append("location[coordinates][coordinates][]", val.lng);
          formData.append("location[coordinates][coordinates][]", val.lat);
        } else {
          formData.append(`location[${key}]`, val || "");
        }
      });

      Object.entries(values.facilities || {}).forEach(([key, val]: any) => {
        if (val !== undefined) formData.append(`facilities[${key}]`, val.toString());
      });

      values.amenities?.forEach((item: string) => formData.append("amenities[]", item));
      values.image?.forEach((file: File) => formData.append("image", file));

      if (isEdit) {
        await updateProperty({ id, data: formData }).unwrap();
        toast.success("Property updated successfully!");
      } else {
        await createProperty(formData).unwrap();
        toast.success("Property created successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-8 bg-white p-6 rounded-xl shadow-md"
    >
      {/* Basic Info */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Basic Information</h2>
        <div>
          <Label>Title</Label>
          <Input {...form.register("title")} placeholder="Beautiful 3BHK Flat" className="mt-1" />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea {...form.register("description")} rows={4} placeholder="Detailed description" className="mt-1" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            control={form.control}
            name="deal"
            render={({ field }) => (
              <select {...field} className="w-full border rounded px-2 py-1">
                <option value="">Select Deal</option>
                <option value="Rent">Rent</option>
                <option value="Sale">Sale</option>
              </select>
            )}
          />
          <Controller
            control={form.control}
            name="type"
            render={({ field }) => (
              <select {...field} className="w-full border rounded px-2 py-1">
                <option value="">Select Type</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
            )}
          />
        </div>
      </div>

      {/* Property Details */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Property Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            control={form.control}
            name="propertyCategory"
            render={({ field }) => (
              <select {...field} className="w-full border rounded px-2 py-1">
                <option value="">Select Category</option>
                <option value="Apartment/Flat">Apartment/Flat</option>
                <option value="House/Villa">House/Villa</option>
                <option value="Land/Plot">Land/Plot</option>
                <option value="Retail">Retail</option>
                <option value="Office">Office</option>
                <option value="Industrial">Industrial</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Shop/Showroom">Shop/Showroom</option>
              </select>
            )}
          />
          <Controller
            control={form.control}
            name="availability"
            render={({ field }) => (
              <select {...field} className="w-full border rounded px-2 py-1">
                <option value="">Select Availability</option>
                <option value="Ready to Move">Ready to Move</option>
                <option value="Under Construction">Under Construction</option>
              </select>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input {...form.register("price", { valueAsNumber: true })} placeholder="Price" />
          <div className="flex gap-2">
            <Input {...form.register("area.value", { valueAsNumber: true })} placeholder="Area" />
            <Controller
              control={form.control}
              name="area.unit"
              render={({ field }) => (
                <select {...field} className="border rounded px-2 py-1">
                  <option value="">Unit</option>
                  <option value="sqft">sqft</option>
                  <option value="sqyard">sqyard</option>
                  <option value="sqm">sqm</option>
                  <option value="marla">marla</option>
                  <option value="kanal">kanal</option>
                  <option value="acre">acre</option>
                </select>
              )}
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input {...form.register("location.address")} placeholder="Address" />
          <Input {...form.register("location.city")} placeholder="City" />
          <Input {...form.register("location.state")} placeholder="State" />
          <Input {...form.register("location.country")} placeholder="Country" />
          <Input {...form.register("location.pincode")} placeholder="Pincode" />
        </div>
      </div>

      {/* Facilities */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Facilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input {...form.register("facilities.bedrooms", { valueAsNumber: true })} placeholder="Bedrooms" />
          <Input {...form.register("facilities.bathrooms", { valueAsNumber: true })} placeholder="Bathrooms" />
          <Input {...form.register("facilities.servantRooms", { valueAsNumber: true })} placeholder="Servant Rooms" />
          <Input {...form.register("facilities.parkings", { valueAsNumber: true })} placeholder="Parkings" />
        </div>
        <Controller
          control={form.control}
          name="furnishing"
          render={({ field }) => (
            <select {...field} className="border rounded px-2 py-1">
              <option value="">Select Furnishing</option>
              <option value="Furnished">Furnished</option>
              <option value="Semi Furnished">Semi Furnished</option>
              <option value="Un-Furnished">Un-Furnished</option>
            </select>
          )}
        />
      </div>

      {/* Amenities */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Amenities</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {AMENITIES_LIST.map((item) => (
            <label key={item} className="flex items-center gap-2">
              <Checkbox
                value={item}
                checked={form.watch("amenities")?.includes(item)}
                onCheckedChange={(checked) => {
                  const current = form.watch("amenities") || [];
                  if (checked) form.setValue("amenities", [...current, item]);
                  else form.setValue("amenities", current.filter((a: string) => a !== item));
                }}
              />
              {item}
            </label>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="space-y-2">
        <Label>Upload Images</Label>
        <Input type="file" multiple onChange={handleImageChange} />
        <div className="flex gap-3 mt-2 flex-wrap">
          {imagePreviews.map((src, i) => (
            <img key={i} src={src} className="w-24 h-24 object-cover rounded-md border" />
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full mt-6">
        {isEdit ? "Update Property" : "Create Property"}
      </Button>
    </form>
  );
}
