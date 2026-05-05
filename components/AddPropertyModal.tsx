"use client";

import { CustomStepper } from "./ui/stepper";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../store/authSlice";
import AddLocation from "./AddLocation";
import UploadImage from "./UploadImage";
import BasicDetails from "./BasicDetails";
import Facilities from "./Facilities";
import { MapPin, Image, FileText, Building } from "lucide-react";

interface AddPropertyModalProps {
  opened: boolean;
  setOpened: (value: boolean) => void;
}

interface FacilitiesType {
  bedrooms: number;
  parkings: number;
  bathrooms: number;
  servantRooms: number;
  balconies?: number;
  parkingType?: string;
}

interface PropertyDetailsType {
  title: string;
  description: string;
  price: number;
  deal: string;
  type: string;
  propertyCategory: string;
  area: {
    value: number;
    unit: string;
  };
  availability: string;
  furnishing: string;
  postedBy: string;
  listingAvailability?: string;
  virtualTourUrl?: string;
  floorPlanImages?: string[];
  floorPlanFiles?: File[];
  nearbyPlaces?: {
    schools?: string[];
    metroStations?: string[];
    hospitals?: string[];
    malls?: string[];
  };
  reraNumber?: string;
  bulbulVerified?: boolean;
  ownerVerified?: boolean;
  visitVerified?: boolean;
  maintenanceCharge?: number;
  securityDeposit?: number;
  lockInMonths?: number;
  noticePeriodDays?: number;
  amenities?: string[];
  ocStatus?: string;
  ageOfProperty?: number;
  pricePerSqft?: number;
  negotiable?: boolean;
  videoUrl?: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  commercialPropertyTypes: string[];
  investmentOptions: string[];
  image: File[];
  facilities: FacilitiesType;
  userEmail?: string;
}

const APD: React.FC<AddPropertyModalProps> = ({
  opened,
  setOpened,
}) => {
  console.log("AddPropertyModal render, opened:", opened);
  const [active, setActive] = useState(0);

  const user = useSelector(selectUser);

  const [propertyDetails, setPropertyDetails] = useState<PropertyDetailsType>({
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
    userEmail: user?.email,
  });

  const nextStep = () => {
    console.log("nextStep called, current active:", active);
    setActive((current) => (current < 3 ? current + 1 : current));
  };

  const prevStep = () => {
    setActive((current) => (current > 0 ? current - 1 : current));
  };

  if (!opened) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
        onClick={() => setOpened(false)}
      />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Add New Property
              </h1>
              <p className="text-gray-500 mt-1">
                Step {active + 1} of 4
              </p>
            </div>
            <button
              onClick={() => setOpened(false)}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <span className="text-2xl text-gray-500">×</span>
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="px-6 py-4 border-b">
            <CustomStepper
              steps={[
                { icon: <MapPin size={18} />, label: 'Location', description: 'Set property location' },
                { icon: <Image size={18} />, label: 'Images', description: 'Upload property photos' },
                { icon: <FileText size={18} />, label: 'Details', description: 'Property information' },
                { icon: <Building size={18} />, label: 'Facilities', description: 'Rooms and amenities' },
              ]}
              active={active}
              onStepClick={setActive}
            />
            <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((active + 1) / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {active === 0 && (
              <AddLocation
                nextStep={nextStep}
                propertyDetails={propertyDetails}
                setPropertyDetails={setPropertyDetails}
              />
            )}
            {active === 1 && (
              <UploadImage
                prevStep={prevStep}
                nextStep={nextStep}
                propertyDetails={propertyDetails}
                setPropertyDetails={setPropertyDetails}
              />
            )}
            {active === 2 && (
              <BasicDetails
                prevStep={prevStep}
                nextStep={nextStep}
                propertyDetails={propertyDetails}
                setPropertyDetails={setPropertyDetails}
              />
            )}
            {active === 3 && (
              <Facilities
                prevStep={prevStep}
                propertyDetails={propertyDetails}
                setPropertyDetails={setPropertyDetails}
                setOpened={setOpened}
                setActiveStep={setActive}
              />
            )}
            {active === 4 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl text-green-600">✓</span>
                </div>
                <h3 className="text-3xl font-bold text-green-600 mb-2">
                  Property Added!
                </h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto">
                  Your property has been successfully listed on the platform.
                  It should appear in your properties manager now.
                </p>
                <button
                  onClick={() => setOpened(false)}
                  className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default APD;
