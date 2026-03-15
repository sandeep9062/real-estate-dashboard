"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
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
  bedrooms: z.number().min(1, "Must have at least one bedroom"),
  parkings: z.number().min(0),
  bathrooms: z.number().min(1, "Must have at least one bathroom"),
  servantRooms: z.number().min(0),
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
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      bedrooms: propertyDetails.facilities.bedrooms || 0,
      parkings: propertyDetails.facilities.parkings || 0,
      bathrooms: propertyDetails.facilities.bathrooms || 0,
      servantRooms: propertyDetails.facilities.servantRooms || 0,
    },
  });

  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const { refetch: refetchProperties } = useGetAllPropertiesQuery({});
  const [createProperty, { isLoading }] = useCreatePropertyMutation();

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error("You must be logged in to add a property");
      return;
    }

    // First update the propertyDetails with the form data
    const updatedFacilities = data;
    const updatedPropertyDetails = {
      ...propertyDetails,
      facilities: updatedFacilities,
    };
    setPropertyDetails(updatedPropertyDetails);

    if (isEditing && onSave) {
      // For editing, call the custom save function with updated data
      try {
        await onSave(updatedPropertyDetails);
      } catch (error) {
        console.error("Failed to update property:", error);
        toast.error("Failed to update property");
        return;
      }
    } else {
      // For adding new property
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
          <Label htmlFor="bedrooms">No of Bedrooms *</Label>
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
          <Label htmlFor="bathrooms">No of Bathrooms *</Label>
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
