"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import useCountries from "../lib/useCountries";

interface AddLocationProps {
  propertyDetails: any;
  setPropertyDetails: (details: any) => void;
  nextStep: () => void;
}

const Map = dynamic(() => import("./Map"), { ssr: false });

const schema = z.object({
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(1, "Address is required"),
});

type FormData = z.infer<typeof schema>;

const AddLocation = ({
  propertyDetails,
  setPropertyDetails,
  nextStep,
}: AddLocationProps) => {
  const { getAll } = useCountries();
  const countries = getAll();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      country: "",
      city: "",
      address: "",
    },
    shouldUnregister: false, // 🔑 VERY IMPORTANT
  });

  const countryValue = watch("country");

  /* ✅ HARD RESET FOR EDIT MODE */
  useEffect(() => {
    if (!propertyDetails?.location?.country) return;

    reset({
      country: propertyDetails.location.country, // MUST be "IN"
      city: propertyDetails.location.city || "",
      address: propertyDetails.location.address || "",
    });
  }, [propertyDetails?.location, reset]);

  const onSubmit = (data: FormData) => {
    setPropertyDetails((prev: any) => ({
      ...prev,
      location: {
        ...prev.location,
        ...data,
      },
    }));
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h4 className="text-lg font-semibold">Property Location</h4>

      {/* Country */}
      <div className="space-y-2">
        <Label>Country</Label>

        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <Select
              key={field.value} // 🔥 FORCE REMOUNT (THIS FIXES IT)
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        {errors.country && (
          <p className="text-red-600 text-sm">{errors.country.message}</p>
        )}
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label>City</Label>
        <Input {...register("city")} />
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label>Address</Label>
        <Input {...register("address")} />
      </div>

      {/* Map */}
      {/* map is currently closed */}

      {/* <div className="h-72 border rounded-xl overflow-hidden">
        <Map
          location={propertyDetails?.location?.coordinates}
          setLocation={(coords: { lat: number; lng: number }) =>
            setPropertyDetails((prev: any) => ({
              ...prev,
              location: {
                ...prev.location,
                coordinates: coords,
              },
            }))
          }
        />
      </div> */}

      <div className="flex justify-end">
        <Button type="submit">Next step →</Button>
      </div>
    </form>
  );
};

export default AddLocation;
