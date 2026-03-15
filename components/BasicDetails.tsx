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

interface BasicDetailsProps {
  prevStep: () => void;
  nextStep: () => void;
  propertyDetails: any;
  setPropertyDetails: React.Dispatch<React.SetStateAction<any>>;
}

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(1000, "Must be greater than 999 rupees"),
  deal: z.string(),
  type: z.string(),
  propertyCategory: z.string(),
  areaValue: z.number().min(1),
  areaUnit: z.string(),
  availability: z.string(),
  furnishing: z.string(),
  postedBy: z.string(),
  commercialPropertyTypes: z.array(z.string()).optional(),
  investmentOptions: z.array(z.string()).optional(),
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
    },
  });

  const watchedType = watch("type");

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
  }, [propertyDetails, setValue]);

  const onSubmit = (data: FormData) => {
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
              min="1"
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
