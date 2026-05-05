"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

const MAX_BYTES = 100 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
]);

function filterMediaFiles(fileList: File[]): File[] {
  const out: File[] = [];
  for (const file of fileList) {
    if (file.size > MAX_BYTES) {
      toast.error(`${file.name}: exceeds 100MB limit`);
      continue;
    }
    if (ALLOWED_MIME.has(file.type)) {
      out.push(file);
      continue;
    }
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (
      ext &&
      ["jpg", "jpeg", "png", "webp", "gif", "mp4", "mov", "avi", "webm"].includes(ext)
    ) {
      out.push(file);
      continue;
    }
    toast.error(`${file.name}: unsupported type (use images or MP4/MOV/WebM)`);
  }
  return out;
}

interface UploadImageProps {
  propertyDetails: any;
  setPropertyDetails: React.Dispatch<React.SetStateAction<any>>;
  nextStep: () => void;
  prevStep: () => void;
}

const UploadImage: React.FC<UploadImageProps> = ({
  propertyDetails,
  setPropertyDetails,
  nextStep,
  prevStep,
}) => {
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(
    propertyDetails.image
      ? propertyDetails.image.filter((img: any) => typeof img === "string")
      : [],
  );
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    setExistingImages(
      propertyDetails.image
        ? propertyDetails.image.filter((img: any) => typeof img === "string")
        : [],
    );
  }, [propertyDetails.image]);

  const isEditMode = existingImages.length > 0;

  const addNewFiles = useCallback((raw: File[]) => {
    const selectedFiles = filterMediaFiles(raw);
    if (!selectedFiles.length) return;
    setNewFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPreviews((prevPreviews) => [...prevPreviews, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addNewFiles(selectedFiles);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    addNewFiles(dropped);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    setPropertyDetails((prev: any) => ({
      ...prev,
      image: newFiles,
      existingImages: existingImages,
    }));
    nextStep();
  };

  const totalImages = existingImages.length + newFiles.length;

  return (
    <div className="flex flex-col items-center mt-8 gap-8 w-full max-w-2xl mx-auto">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            document.getElementById("image-upload")?.click();
          }
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
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOver(false);
          }
        }}
        onDrop={onDrop}
        onClick={() => document.getElementById("image-upload")?.click()}
        className={`flex flex-col justify-center items-center w-full min-h-[14rem] border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50/80 border-solid"
            : "border-gray-300 bg-gray-50 hover:bg-gray-100"
        }`}
      >
        <AiOutlineCloudUpload size={48} className="text-gray-500" />
        <span className="text-sm text-gray-600 mt-2 text-center px-4">
          Drag & drop images or videos here, or click to browse
        </span>
        <span className="text-xs text-gray-500 text-center px-4 mt-1">
          Optional — add photos or videos for visibility. JPEG, PNG, WebP, GIF, MP4, MOV, WebM — max
          100MB each (Cloudinary on save)
        </span>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        {existingImages.map((image, index) => (
          <div
            key={`existing-${index}`}
            className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300 shadow-sm group"
          >
            <img src={image} alt={`existing ${index}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeExistingImage(index);
              }}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
            <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
              Existing
            </div>
          </div>
        ))}

        {newPreviews.map((preview, index) => {
          const file = newFiles[index];
          const isVid = file?.type.startsWith("video/");
          return (
            <div
              key={`new-${index}`}
              className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300 shadow-sm group bg-black"
            >
              {isVid ? (
                <video src={preview} className="w-full h-full object-cover" muted playsInline />
              ) : (
                <img src={preview} alt={`new ${index}`} className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeNewImage(index);
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
              <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                New
              </div>
            </div>
          );
        })}
      </div>

      <input
        id="image-upload"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="text-sm text-gray-600">
        Total images: {totalImages}
        {isEditMode && ` (${existingImages.length} existing, ${newFiles.length} new)`}
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <Button variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default UploadImage;
