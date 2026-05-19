"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  X,
  Upload,
  MapPin,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import the map component to avoid SSR issues with Leaflet
const MapWrapper = dynamic(() => import("@/components/MapWrapper"), {
  ssr: false,
  loading: () => <Skeleton className="h-72 w-full rounded-xl" />,
});
import Link from "next/link";
import { toast } from "sonner";
import { useCreateProjectMutation } from "@/services/projectsApi";

const CITIES = [
  "Chandigarh",
  "Mohali",
  "Panchkula",
  "Zirakpur",
  "New Chandigarh",
  "Kharar",
];

const PROJECT_TYPES = ["Residential", "Commercial", "Mixed-Use", "Industrial"];

const CONSTRUCTION_STATUSES = [
  "Ready to Move",
  "Under Construction",
  "Newly Launched",
  "Upcoming",
];

// Drag-and-drop image upload component
function ImageUploadSection({
  files,
  previews,
  onFilesChange,
}: {
  files: File[];
  previews: string[];
  onFilesChange: (files: File[], previews: string[]) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const validFiles = newFiles.filter((file) => {
        const allowed = [
          "image/jpeg",
          "image/png",
          "image/jpg",
          "image/webp",
          "image/gif",
        ];
        if (!allowed.includes(file.type)) {
          toast.error(`${file.name}: unsupported format`);
          return false;
        }
        if (file.size > 100 * 1024 * 1024) {
          toast.error(`${file.name}: exceeds 100MB limit`);
          return false;
        }
        return true;
      });

      if (!validFiles.length) return;

      const updatedFiles = [...files, ...validFiles];
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      onFilesChange(updatedFiles, [...previews, ...newPreviews]);
    },
    [files, previews, onFilesChange],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    // Revoke the blob URL to free memory
    URL.revokeObjectURL(previews[index]);
    onFilesChange(updatedFiles, updatedPreviews);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        Project Images
      </label>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ")
            document.getElementById("project-image-upload")?.click();
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (!e.currentTarget.contains(e.relatedTarget as Node))
            setDragOver(false);
        }}
        onDrop={handleDrop}
        onClick={() => document.getElementById("project-image-upload")?.click()}
        className={`flex flex-col justify-center items-center w-full min-h-[12rem] border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50/80 border-solid"
            : "border-gray-300 bg-gray-50 hover:bg-gray-100"
        }`}
      >
        <Upload size={40} className="text-gray-400" />
        <span className="text-sm text-gray-600 mt-2 text-center px-4">
          Drag & drop images here, or click to browse
        </span>
        <span className="text-xs text-gray-500 text-center px-4 mt-1">
          JPEG, PNG, WebP, GIF — max 100MB each (uploaded to Cloudinary)
        </span>
      </div>

      <input
        id="project-image-upload"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Image previews */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {previews.map((preview, idx) => (
            <div
              key={idx}
              className="relative w-28 h-28 rounded-lg overflow-hidden border border-gray-300 shadow-sm group"
            >
              <img
                src={preview}
                alt={`Upload ${idx}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
              <div className="absolute bottom-1 left-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                New
              </div>
            </div>
          ))}
        </div>
      )}

      {previews.length > 0 && (
        <p className="text-sm text-gray-500">
          {previews.length} image(s) selected
        </p>
      )}
    </div>
  );
}

export default function AddProjectPage() {
  const router = useRouter();
  const [createProject, { isLoading }] = useCreateProjectMutation();

  const [formData, setFormData] = useState({
    name: "",
    developer: "",
    location: {
      address: "",
      sector: "",
      city: "",
      coordinates: { lat: "", lng: "" },
    },
    description: "",
    projectType: "Residential",
    constructionStatus: "Under Construction",
    reraNumber: "",
    pricing: { from: "", to: "", currency: "INR" },
    amenities: [] as string[],
    media: {
      brochureUrl: "",
      images: [] as string[],
      videoTour: "",
    },
    stats: {
      totalUnits: "",
      availableUnits: "",
      possessionDate: "",
      areaRange: "",
    },
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: [] as string[],
    },
    isActive: true,
    isFeatured: false,
    isVerified: true,
  });

  // Drag-and-drop file state
  // Map coordinates state (separate from formData for numeric handling)
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number }>({
    lat: 30.751851738730274,
    lng: 76.77228927612306,
  });

  const handleMapLocationChange = (coords: { lat: number; lng: number }) => {
    setMapCoords(coords);
    setFormData((prev: any) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: {
          lat: String(coords.lat),
          lng: String(coords.lng),
        },
      },
    }));
  };

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [amenityInput, setAmenityInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [developers, setDevelopers] = useState<any[]>([]);

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000/api";
      const token =
        localStorage.getItem("token") ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("accessToken="))
          ?.split("=")[1];
      const res = await fetch(`${API_URL}/v1/developers`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      const devs = Array.isArray(data) ? data : (data?.data ?? []);
      setDevelopers(devs);
    } catch (err) {
      console.error("Failed to fetch developers:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    if (name.includes(".")) {
      const parts = name.split(".");
      setFormData((prev: any) => {
        const newData = { ...prev };
        let current: any = newData;
        for (let i = 0; i < parts.length - 1; i++) {
          current[parts[i]] = { ...current[parts[i]] };
          current = current[parts[i]];
        }
        if (type === "checkbox" && checked !== undefined) {
          current[parts[parts.length - 1]] = checked;
        } else {
          current[parts[parts.length - 1]] = value;
        }
        return newData;
      });
    } else {
      if (type === "checkbox" && checked !== undefined) {
        setFormData((prev) => ({ ...prev, [name]: checked }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  const addAmenity = () => {
    if (amenityInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()],
      }));
      setAmenityInput("");
    }
  };

  const removeAmenity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        seo: {
          ...prev.seo,
          keywords: [...prev.seo.keywords, keywordInput.trim()],
        },
      }));
      setKeywordInput("");
    }
  };

  const removeKeyword = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.developer || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Build the payload with file objects embedded
      const payload = {
        name: formData.name,
        developer: formData.developer,
        location: {
          ...formData.location,
          coordinates: {
            lat: formData.location.coordinates.lat
              ? Number(formData.location.coordinates.lat)
              : undefined,
            lng: formData.location.coordinates.lng
              ? Number(formData.location.coordinates.lng)
              : undefined,
          },
        },
        description: formData.description,
        projectType: formData.projectType,
        constructionStatus: formData.constructionStatus,
        reraNumber: formData.reraNumber,
        pricing: {
          from: Number(formData.pricing.from),
          to: formData.pricing.to ? Number(formData.pricing.to) : undefined,
          currency: formData.pricing.currency,
        },
        amenities: formData.amenities,
        media: {
          brochureUrl: formData.media.brochureUrl || undefined,
          images: imageFiles.length > 0 ? imageFiles : undefined,
          videoTour: formData.media.videoTour || undefined,
        },
        stats: {
          totalUnits: formData.stats.totalUnits
            ? Number(formData.stats.totalUnits)
            : undefined,
          availableUnits: formData.stats.availableUnits
            ? Number(formData.stats.availableUnits)
            : undefined,
          possessionDate: formData.stats.possessionDate || undefined,
          areaRange: formData.stats.areaRange || undefined,
        },
        seo: {
          metaTitle: formData.seo.metaTitle || undefined,
          metaDescription: formData.seo.metaDescription || undefined,
          keywords: formData.seo.keywords?.length
            ? formData.seo.keywords
            : undefined,
        },
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isVerified: formData.isVerified,
      };

      await createProject(payload).unwrap();
      toast.success("Project created successfully!");
      router.push("/projects");
    } catch (error: any) {
      console.error("Failed to create project:", error);
      toast.error(
        error?.data?.message || "Failed to create project. Please try again.",
      );
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/projects"
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Back to Projects</span>
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Add New Project</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Basic Information
            </h2>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                name="name"
                placeholder="e.g. Sushma Gradient"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Developer <span className="text-red-500">*</span>
              </label>
              <select
                required
                name="developer"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={formData.developer}
                onChange={handleChange}
              >
                <option value="">Select Developer</option>
                {developers.map((dev: any) => (
                  <option key={dev._id} value={dev._id}>
                    {dev.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                name="description"
                rows={5}
                placeholder="Detailed description of the project..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none transition-all"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Project Type
                </label>
                <select
                  name="projectType"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={formData.projectType}
                  onChange={handleChange}
                >
                  {PROJECT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Construction Status
                </label>
                <select
                  name="constructionStatus"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={formData.constructionStatus}
                  onChange={handleChange}
                >
                  {CONSTRUCTION_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                RERA Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="reraNumber"
                placeholder="e.g. PB/RERA/12345/2024"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={formData.reraNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Location */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-slate-900">Location</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  City
                </label>
                <select
                  name="location.city"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={formData.location.city}
                  onChange={handleChange}
                >
                  <option value="">Select City</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Sector
                </label>
                <input
                  type="text"
                  name="location.sector"
                  placeholder="e.g. Sector 62"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={formData.location.sector}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Address
              </label>
              <input
                type="text"
                name="location.address"
                placeholder="Full address"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={formData.location.address}
                onChange={handleChange}
              />
            </div>

            {/* Interactive Map for Coordinates */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-blue-600" />
                <label className="text-sm font-semibold text-slate-700">
                  Location on Map
                </label>
              </div>
              <div className="h-72 rounded-xl overflow-hidden border border-slate-200">
                <MapWrapper
                  location={mapCoords}
                  setLocation={handleMapLocationChange}
                />
              </div>
              {formData.location.coordinates.lat && (
                <p className="text-xs text-slate-500 mt-1">
                  Selected coordinates: {formData.location.coordinates.lat},{" "}
                  {formData.location.coordinates.lng}
                </p>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-slate-900">Pricing</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Price From (₹)
                </label>
                <input
                  type="number"
                  name="pricing.from"
                  placeholder="7500000"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={formData.pricing.from}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Price To (₹)
                </label>
                <input
                  type="number"
                  name="pricing.to"
                  placeholder="15000000"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={formData.pricing.to}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Images — Drag & Drop Upload */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <ImageUploadSection
              files={imageFiles}
              previews={imagePreviews}
              onFilesChange={(files, previews) => {
                setImageFiles(files);
                setImagePreviews(previews);
              }}
            />
          </div>

          {/* Media URLs */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-slate-900">Media URLs</h2>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Brochure URL
              </label>
              <input
                type="text"
                name="media.brochureUrl"
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={formData.media.brochureUrl}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Video Tour URL
              </label>
              <input
                type="text"
                name="media.videoTour"
                placeholder="https://youtube.com/..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={formData.media.videoTour}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Project Stats
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Total Units
                </label>
                <input
                  type="number"
                  name="stats.totalUnits"
                  placeholder="e.g. 200"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={formData.stats.totalUnits}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Available Units
                </label>
                <input
                  type="number"
                  name="stats.availableUnits"
                  placeholder="e.g. 50"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={formData.stats.availableUnits}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Possession Date
                </label>
                <input
                  type="date"
                  name="stats.possessionDate"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={formData.stats.possessionDate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Area Range
                </label>
                <input
                  type="text"
                  name="stats.areaRange"
                  placeholder="e.g. 1200 - 2500 sq.ft"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={formData.stats.areaRange}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Amenities */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Amenities</h2>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Swimming Pool"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAmenity();
                  }
                }}
              />
              <button
                type="button"
                onClick={addAmenity}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            {formData.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(idx)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* SEO */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">SEO</h2>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Meta Title
              </label>
              <input
                type="text"
                name="seo.metaTitle"
                placeholder="SEO title"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={formData.seo.metaTitle}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Meta Description
              </label>
              <textarea
                name="seo.metaDescription"
                rows={3}
                placeholder="SEO description..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none transition-all"
                value={formData.seo.metaDescription}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Keywords
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add keyword"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              {formData.seo.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.seo.keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => removeKeyword(idx)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status Toggles */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Status</h2>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Active</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">
                Featured
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isVerified"
                checked={formData.isVerified}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">
                Verified
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            disabled={isLoading}
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}
            {isLoading ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
