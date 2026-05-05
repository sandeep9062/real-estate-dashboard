"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { Label } from "./ui/label";
import { toast } from "sonner";

const MAX_BYTES = 20 * 1024 * 1024;
const IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

function filterImages(fileList: File[]): File[] {
  const out: File[] = [];
  for (const file of fileList) {
    if (file.size > MAX_BYTES) {
      toast.error(`${file.name}: exceeds 20MB limit`);
      continue;
    }
    if (IMAGE_MIME.has(file.type) || /\.(jpe?g|png|webp|gif)$/i.test(file.name)) {
      out.push(file);
      continue;
    }
    toast.error(`${file.name}: use JPEG, PNG, WebP, or GIF`);
  }
  return out;
}

interface FloorPlanUploadSectionProps {
  urls: string[];
  files: File[];
  onUrlsChange: (urls: string[]) => void;
  onFilesChange: (files: File[]) => void;
}

export default function FloorPlanUploadSection({
  urls,
  files,
  onUrlsChange,
  onFilesChange,
}: FloorPlanUploadSectionProps) {
  const [dragOver, setDragOver] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const addFiles = useCallback(
    (incoming: File[]) => {
      const next = filterImages(incoming);
      if (!next.length) return;
      onFilesChange([...files, ...next]);
    },
    [files, onFilesChange],
  );

  useEffect(() => {
    let cancelled = false;
    if (!files.length) {
      setPreviews([]);
      return;
    }
    const next: string[] = new Array(files.length);
    let left = files.length;
    files.forEach((file, i) => {
      const r = new FileReader();
      r.onloadend = () => {
        if (cancelled) return;
        next[i] = r.result as string;
        left -= 1;
        if (left === 0) setPreviews([...next]);
      };
      r.readAsDataURL(file);
    });
    return () => {
      cancelled = true;
    };
  }, [files]);

  return (
    <div className="space-y-3">
      <div>
        <Label>Floor plans</Label>
        <p className="text-xs text-gray-500 mt-1">
          Drag and drop images or browse. Files upload to Cloudinary when you save.
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            document.getElementById("floor-plan-input-dash")?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(Array.from(e.dataTransfer.files));
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 cursor-pointer transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:bg-gray-100"
        }`}
        onClick={() => document.getElementById("floor-plan-input-dash")?.click()}
      >
        <AiOutlineCloudUpload className="text-4xl text-gray-400" />
        <span className="text-sm text-gray-600">Drop floor plan images here</span>
        <input
          id="floor-plan-input-dash"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            const list = e.target.files ? Array.from(e.target.files) : [];
            addFiles(list);
            e.target.value = "";
          }}
        />
      </div>

      {(urls.length > 0 || files.length > 0) && (
        <div className="flex flex-wrap gap-3 mt-2">
          {urls.map((url, index) => (
            <div
              key={`u-${index}-${url.slice(-20)}`}
              className="relative w-28 h-28 rounded-lg overflow-hidden border bg-gray-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                onClick={() => onUrlsChange(urls.filter((_, i) => i !== index))}
              >
                ×
              </button>
            </div>
          ))}
          {files.map((file, index) => (
            <div
              key={`f-${file.name}-${file.size}-${index}`}
              className="relative w-28 h-28 rounded-lg overflow-hidden border bg-gray-100"
            >
              {previews[index] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previews[index]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center p-1 text-[10px] text-center text-gray-500">
                  {file.name}
                </div>
              )}
              <button
                type="button"
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                onClick={() =>
                  onFilesChange(files.filter((_, i) => i !== index))
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
