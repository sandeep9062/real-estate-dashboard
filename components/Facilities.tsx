"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  selectUser,
  selectToken,
} from "../store/authSlice";
import {
  useCreatePropertyMutation,
  useGetAllPropertiesQuery,
} from "@/services/propertiesApi";

interface FacilitiesProps {
  prevStep: () => void;
  propertyDetails: any;
  setPropertyDetails: React.Dispatch<React.SetStateAction<any>>;
  setOpened: (value: boolean) => void;
  setActiveStep: (value: number) => void;
  onSave?: (updatedData?: any) => void;
  isEditing?: boolean;
}

const schema = z.object({
  bedrooms: z.number().min(0, "Cannot be negative"),
  parkings: z.number().min(0),
  bathrooms: z.number().min(0, "Cannot be negative"),
  servantRooms: z.number().min(0),
  balconies: z.number().min(0),
  parkingType: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const Facilities: React.FC<FacilitiesProps> = ({
  prevStep,
  propertyDetails,
  setPropertyDetails,
  setOpened,
  setActiveStep,
  onSave,
  isEditing = false,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      bedrooms: propertyDetails.facilities?.bedrooms ?? 0,
      parkings: propertyDetails.facilities?.parkings ?? 0,
      bathrooms: propertyDetails.facilities?.bathrooms ?? 0,
      servantRooms: propertyDetails.facilities?.servantRooms ?? 0,
      balconies: propertyDetails.facilities?.balconies ?? 0,
      parkingType: propertyDetails.facilities?.parkingType || "__none__",
    },
  });

  const facilitiesKey = JSON.stringify(propertyDetails.facilities ?? {});
  useEffect(() => {
    reset({
      bedrooms: propertyDetails.facilities?.bedrooms ?? 0,
      parkings: propertyDetails.facilities?.parkings ?? 0,
      bathrooms: propertyDetails.facilities?.bathrooms ?? 0,
      servantRooms: propertyDetails.facilities?.servantRooms ?? 0,
      balconies: propertyDetails.facilities?.balconies ?? 0,
      parkingType: propertyDetails.facilities?.parkingType || "__none__",
    });
  }, [facilitiesKey, reset]);

  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const { refetch: refetchProperties } = useGetAllPropertiesQuery({});
  const [createProperty, { isLoading }] = useCreatePropertyMutation();

  const buildFacilities = (data: FormData) => {
    const parking =
      data.parkingType && data.parkingType !== "__none__"
        ? data.parkingType
        : undefined;
    const merged: Record<string, unknown> = {
      ...propertyDetails.facilities,
      bedrooms: data.bedrooms,
      parkings: data.parkings,
      bathrooms: data.bathrooms,
      servantRooms: data.servantRooms,
      balconies: data.balconies,
    };
    if (parking) merged.parkingType = parking;
    else delete merged.parkingType;
    return merged;
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error("You must be logged in to add a property");
      return;
    }

    const updatedFacilities = buildFacilities(data);
    const updatedPropertyDetails = {
      ...propertyDetails,
      facilities: updatedFacilities,
    };
    setPropertyDetails(updatedPropertyDetails);

    if (isEditing && onSave) {
      try {
        await onSave(updatedPropertyDetails);
        toast.success("Property details updated");
      } catch (error) {
        console.error("Failed to update property:", error);
        toast.error("Failed to update property");
        return;
      }
    } else {
      const newProperty = {
        ...propertyDetails,
        facilities: updatedFacilities,
        userEmail: user.email,
      };

      try {
        await createProperty({ ...newProperty, token }).unwrap();
        toast.success("Property added successfully");
        setPropertyDetails((prev: any) => ({
          ...prev,
          title: "",
          description: "",
          price: 0,
          deal: "Rent",
          type: "Residential",
          propertyCategory: "Apartment/Flat",
          area: { value: 1000, unit: "sqft" },
          availability: "Ready to Move",
          furnishing: "Un-Furnished",
          postedBy: "Owner",
          listingAvailability: "Available",
          virtualTourUrl: "",
          videoUrl: "",
          floorPlanImages: [],
          nearbyPlaces: {
            schools: [],
            metroStations: [],
            hospitals: [],
            malls: [],
          },
          reraNumber: "",
          floorPlanFiles: [],
          bulbulVerified: false,
          ownerVerified: false,
          visitVerified: false,
          maintenanceCharge: undefined,
          securityDeposit: undefined,
          lockInMonths: undefined,
          noticePeriodDays: undefined,
          ocStatus: undefined,
          ageOfProperty: undefined,
          pricePerSqft: undefined,
          negotiable: true,
          amenities: [],
          location: {
            address: "",
            city: "",
            state: "",
            country: "",
            pincode: "",
            coordinates: { lat: 0, lng: 0 },
          },
          commercialPropertyTypes: [],
          investmentOptions: [],
          image: [],
          facilities: {
            bedrooms: 0,
            parkings: 0,
            bathrooms: 0,
            servantRooms: 0,
            balconies: 0,
          },
          userEmail: user.email,
        }));
        setOpened(false);
        setActiveStep(0);
        refetchProperties();
      } catch (error) {
        toast.error("Failed to add property");
        console.error(error);
      }
    }
  };

  return (
    <div className="max-w-full mx-auto my-2">
      <form className="flex flex-col gap-6 mt-8" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="bedrooms">No of Bedrooms</Label>
          <Input
            id="bedrooms"
            type="number"
            min="0"
            {...register("bedrooms", { valueAsNumber: true })}
          />
          {errors.bedrooms && <p className="text-red-600">{errors.bedrooms.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="parkings">No of Parkings</Label>
          <Input
            id="parkings"
            type="number"
            min="0"
            {...register("parkings", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bathrooms">No of Bathrooms</Label>
          <Input
            id="bathrooms"
            type="number"
            min="0"
            {...register("bathrooms", { valueAsNumber: true })}
          />
          {errors.bathrooms && <p className="text-red-600">{errors.bathrooms.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="servantRooms">No of Servant Rooms</Label>
          <Input
            id="servantRooms"
            type="number"
            min="0"
            {...register("servantRooms", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="balconies">Balconies</Label>
          <Input
            id="balconies"
            type="number"
            min="0"
            {...register("balconies", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label>Parking type</Label>
          <Controller
            name="parkingType"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Not specified —</SelectItem>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Covered">Covered</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <Button type="button" variant="outline" onClick={prevStep}>
            Back
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Submitting" : isEditing ? "Update Property" : "Add Property"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Facilities;
