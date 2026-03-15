"use client";

import React, { useState, useEffect } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { X } from "lucide-react";
import { Button } from "./ui/button";

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
    propertyDetails.image ? propertyDetails.image.filter((img: any) => typeof img === 'string') : []
  );
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  // Update existing images when propertyDetails changes
  useEffect(() => {
    setExistingImages(
      propertyDetails.image ? propertyDetails.image.filter((img: any) => typeof img === 'string') : []
    );
  }, [propertyDetails.image]);

  // Determine if we're in edit mode by checking if there are existing images
  const isEditing = existingImages.length > 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setNewFiles((prevFiles) => [...prevFiles, ...selectedFiles]);

    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPreviews((prevPreviews) => [...prevPreviews, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
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
      image: newFiles, // New files for upload
      existingImages: existingImages, // Existing images to keep
    }));
    nextStep();
  };

  const totalImages = existingImages.length + newFiles.length;

  return (
    <div className="flex flex-col items-center mt-8 gap-8">
      <label
        htmlFor="image-upload"
        className="flex flex-col justify-center items-center w-full h-[18rem] border-2 border-dashed border-gray-300 cursor-pointer rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <AiOutlineCloudUpload size={48} className="text-gray-500" />
        <span className="text-sm text-gray-600 mt-2">Drag & drop files here or click to browse</span>
        <span className="text-xs text-gray-500">PNG, JPG up to 10MB each</span>
      </label>

      <div className="flex flex-wrap gap-4 justify-center">
        {/* Existing Images */}
        {existingImages.map((image, index) => (
          <div key={`existing-${index}`} className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300 shadow-sm group">
            <img
              src={image}
              alt={`existing ${index}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => removeExistingImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
            <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
              Existing
            </div>
          </div>
        ))}

        {/* New Uploaded Images */}
        {newPreviews.map((preview, index) => (
          <div key={`new-${index}`} className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300 shadow-sm group">
            <img
              src={preview}
              alt={`new ${index}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => removeNewImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
            <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
              New
            </div>
          </div>
        ))}
      </div>

      <input
        id="image-upload"
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="text-sm text-gray-600">
        Total images: {totalImages}
        {isEditing && ` (${existingImages.length} existing, ${newFiles.length} new)`}
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <Button variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={totalImages === 0}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default UploadImage;
