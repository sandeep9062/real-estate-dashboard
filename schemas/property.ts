// schemas/property.ts
import { z } from "zod";

export const propertySchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),

  deal: z.enum(["Rent", "Sale"]),
  type: z.enum(["Residential", "Commercial"]),
  propertyCategory: z.string(),

  price: z.number(),
  availability: z.enum(["Ready to Move", "Under Construction"]),
  furnishing: z.enum(["Furnished", "Semi Furnished", "Un-Furnished"]),

  area: z.object({
    value: z.number(),
    unit: z.enum(["sqft", "sqyard", "sqm", "marla", "kanal", "acre"]),
  }),

  location: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    pincode: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),

  facilities: z.object({
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    parkings: z.number().optional(),
    servantRooms: z.number().optional(),
  }),

  amenities: z.array(z.string()).optional(),
  image: z.any(),
});

export type PropertySchema = z.infer<typeof propertySchema>;
