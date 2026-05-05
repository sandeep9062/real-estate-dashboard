"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
// Importing the RTK Query hooks
import {
  useGetJournalByIdQuery,
  useUpdateJournalMutation,
} from "@/services/journalApi";

export default function EditJournalPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  // 1. Fetch real journal data using RTK Query
  const {
    data: journal,
    isLoading: fetching,
    isError,
  } = useGetJournalByIdQuery(id);

  // 2. Initialize the update mutation hook
  const [updateJournal, { isLoading: isUpdating }] = useUpdateJournalMutation();

  const [formData, setFormData] = useState<{
    title: string;
    category: string;
    targetSector: string;
    excerpt: string;
    content: string;
    coverImage: string | File;
  }>({
    title: "",
    category: "",
    targetSector: "",
    excerpt: "",
    content: "",
    coverImage: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 3. Sync fetched data with local form state
  useEffect(() => {
    if (journal) {
      setFormData({
        title: journal.title || "",
        category: journal.category || "Investment",
        targetSector: journal.targetSector || "",
        excerpt:
          (journal as any).excerpt || journal.content?.substring(0, 150) || "",
        content: journal.content || "",
        coverImage: journal.coverImage || "",
      });
      setImagePreview(journal.coverImage || null);
    }
  }, [journal]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, coverImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 4. Call the mutation from your Redux API
      await updateJournal({
        id,
        update: formData,
      }).unwrap();

      toast({ title: "Journal updated successfully! ✅" });
      router.push("/journals");
    } catch (error) {
      console.error("Update failed:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Something went wrong while saving.",
      });
    }
  };

  if (fetching)
    return (
      <div className="h-[70vh] flex flex-col gap-4 items-center justify-center">
        <Loader2 className="animate-spin text-[#4161df]" size={50} />
        <p className="text-slate-500 font-medium">
          Fetching Journal Details...
        </p>
      </div>
    );

  if (isError)
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading journal. Please try again.</p>
        <Link href="/journals" className="text-[#4161df] underline">
          Go Back
        </Link>
      </div>
    );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/journals"
          className="flex items-center gap-2 text-slate-600 hover:text-[#4161df] transition-all"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to List</span>
        </Link>
        <h1 className="text-xl font-bold text-slate-900">
          Edit Guide: {journal?.title}
        </h1>
      </div>

      <form
        onSubmit={handleUpdate}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Journal Title
              </label>
              <input
                required
                type="text"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#4161df]/20 outline-none transition-all"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Guide Content
              </label>
              <textarea
                required
                rows={18}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#4161df]/20 outline-none font-sans text-sm leading-relaxed"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="Investment">Investment Guide</option>
                <option value="Locality Guide">Locality Guide</option>
                <option value="Market News">Market News</option>
                <option value="Legal">Legal & Documentation</option>
                <option value="Lifestyle">Tricity Lifestyle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Target Sector (Tricity)
              </label>
              <input
                type="text"
                placeholder="e.g. Sector 115, Mohali"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none"
                value={formData.targetSector}
                onChange={(e) =>
                  setFormData({ ...formData, targetSector: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Cover Image
              </label>
              <div className="space-y-3">
                {imagePreview && (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="coverImage"
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor="coverImage"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-dashed border-slate-300 hover:border-[#4161df] hover:bg-[#4161df]/5 cursor-pointer transition-all text-sm text-slate-600"
                  >
                    <ImageIcon size={20} />
                    <span>
                      {formData.coverImage instanceof File
                        ? formData.coverImage.name
                        : "Change Image"}
                    </span>
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-100"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-400">
                      Or use URL
                    </span>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none"
                  value={
                    typeof formData.coverImage === "string"
                      ? formData.coverImage
                      : ""
                  }
                  onChange={(e) => {
                    setFormData({ ...formData, coverImage: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            <button
              disabled={isUpdating}
              type="submit"
              className="w-full bg-[#4161df] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#3551c0] disabled:opacity-50 transition-all shadow-lg shadow-[#4161df]/20"
            >
              {isUpdating ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              {isUpdating ? "Saving Changes..." : "Save Journal"}
            </button>

            <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-medium">
              ID: {id}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
