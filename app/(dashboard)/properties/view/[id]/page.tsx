"use client";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Ruler, Users, Wifi, Car, Dumbbell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  useGetPropertyQuery,
} from "@/services/propertiesApi";
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertyView() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { data: property, error, isLoading } = useGetPropertyQuery(id);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <Skeleton className="h-64 w-full" />
            <CardContent className="p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Property not found</h2>
          <p className="text-gray-600 mt-2">The property you're looking for doesn't exist.</p>
          <Button
            onClick={() => router.push("/properties")}
            className="mt-4"
          >
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  if (!property) return null;

  // Helper functions to safely render object properties
  const renderValue = (value: any) => {
    if (!value) return value;
    if (typeof value === 'object' && value.value !== undefined) {
      return value.value + (value.unit ? ' ' + value.unit : '');
    }
    return String(value);
  };

  const renderArea = (area: any) => {
    if (!area) return 'N/A';
    if (typeof area === 'object' && area.value) {
      return `${area.value} ${area.unit || 'sq ft'}`;
    }
    return `${area} sq ft`;
  };

  const renderPrice = (price: any) => {
    if (!price) return 'N/A';
    if (typeof price === 'object' && price.value) {
      return `₹${price.value}`;
    }
    return `₹${price}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/properties")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {property.title}
          </h1>
          <p className="text-muted-foreground">
            Property details and specifications
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* LEFT COLUMN - IMAGES & BASIC INFO */}
        <div className="space-y-4">
          {/* MAIN IMAGE */}
          <Card className="overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={property.image?.[0] || "/placeholder.png"}
                alt={property.title}
                className="h-full w-full object-cover"
              />
              <Badge
                className={`absolute top-4 right-4 ${
                  property.availability === "Ready to Move"
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }`}
              >
                {renderValue(property.availability)}
              </Badge>
            </div>
          </Card>

          {/* BASIC PROPERTIES */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Basic Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Property Type</p>
                  <p className="font-semibold">{renderValue(property.type)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="font-semibold">{renderValue(property.category || property.propertyCategory)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Deal Type</p>
                  <p className="font-semibold">{renderValue(property.deal)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Furnishing</p>
                  <p className="font-semibold">{renderValue(property.furnishing)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold text-black">{renderPrice(property.price)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">postedBy</p>
                  <p className="font-semibold">{renderValue(property.postedBy)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Listed Date</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {property.createdAt ? new Date(property.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* VERIFICATION STATUS */}
              {property.isVerified && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Verified Property</span>
                  </div>
                </div>
              )}

              {/* SERVANT ROOMS */}
              {property.facilities?.servantRooms > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-700">Servant Rooms: {property.facilities.servantRooms}</p>
                </div>
              )}

              {/* COMMERCIAL PROPERTY TYPES */}
              {property.type === "Commercial" && property.commercialPropertyTypes && property.commercialPropertyTypes.length > 0 && (
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm font-medium text-purple-700 mb-2">Commercial Property Types:</p>
                  <div className="flex flex-wrap gap-1">
                    {property.commercialPropertyTypes.map((type: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs text-purple-600 border-purple-300">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* INVESTMENT OPTIONS */}
              {property.investmentOptions && property.investmentOptions.length > 0 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm font-medium text-orange-700 mb-2">Investment Options:</p>
                  <div className="flex flex-wrap gap-1">
                    {property.investmentOptions.map((option: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs text-orange-600 border-orange-300">
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN - DETAILED INFO */}
        <div className="space-y-4">
          {/* PROPERTY DETAILS */}
          <Card>
            <CardHeader>
              <CardTitle>Property Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* COMPLETE ADDRESS */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-slate-600" />
                  Complete Address
                </h4>
                <div className="space-y-1 text-sm">
                  {property.location?.address && (
                    <p className="text-slate-700"><span className="font-medium">Address:</span> {property.location.address}</p>
                  )}
                  <p className="text-slate-700"><span className="font-medium">City:</span> {property.location?.city}</p>
                  <p className="text-slate-700"><span className="font-medium">State:</span> {property.location?.state}</p>
                  {property.location?.country && (
                    <p className="text-slate-700"><span className="font-medium">Country:</span> {property.location.country}</p>
                  )}
                  {property.location?.pincode && (
                    <p className="text-slate-700"><span className="font-medium">Pincode:</span> {property.location.pincode}</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* FACILITIES DETAIL */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  Property Facilities
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-md">
                    <p className="text-sm font-medium text-blue-700">Bedrooms</p>
                    <p className="text-lg font-bold text-blue-900">{renderValue(property.facilities?.bedrooms || property.bedrooms || 'N/A')}</p>
                  </div>
                  <div className="bg-white p-3 rounded-md">
                    <p className="text-sm font-medium text-blue-700">Bathrooms</p>
                    <p className="text-lg font-bold text-blue-900">{renderValue(property.facilities?.bathrooms || property.bathrooms || 'N/A')}</p>
                  </div>
                  <div className="bg-white p-3 rounded-md">
                    <p className="text-sm font-medium text-blue-700">Parking Spaces</p>
                    <p className="text-lg font-bold text-blue-900">{renderValue(property.facilities?.parkings || (property.parking ? '1' : 'N/A'))}</p>
                  </div>
                  {property.facilities?.servantRooms > 0 && (
                    <div className="bg-white p-3 rounded-md">
                      <p className="text-sm font-medium text-blue-700">Servant Rooms</p>
                      <p className="text-lg font-bold text-blue-900">{property.facilities.servantRooms}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* AREA DETAILS */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  Area Details
                </h4>
                <div className="bg-white p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-700">Total Area</span>
                    <span className="text-xl font-bold text-green-900">{renderArea(property.area)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AMENITIES */}
          {property.amenities && property.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  Amenities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity: any, index: number) => (
                    <Badge key={index} variant="secondary">
                      {renderValue(amenity)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* DESCRIPTION */}
          {property.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {renderValue(property.description)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* ADDITIONAL IMAGES */}
          {property.image && property.image.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {property.image.slice(1).map((img: string, index: number) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-md">
                      <img
                        src={img}
                        alt={`Property ${index + 2}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
