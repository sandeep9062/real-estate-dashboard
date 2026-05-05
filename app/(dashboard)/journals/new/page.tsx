"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Image as ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
// RTK Query hook import
import { useCreateJournalMutation } from "@/services/journalApi";

export default function NewJournalPage() {
  const router = useRouter();

  // 1. Initialize the mutation hook
  const [createJournal, { isLoading: loading }] = useCreateJournalMutation();

  const [formData, setFormData] = useState<{
    title: string;
    category: string;
    targetSector: string;
    excerpt: string;
    content: string;
    coverImage: string | File;
  }>({
    title: "",
    category: "Investment",
    targetSector: "",
    excerpt: "",
    content: "",
    coverImage: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (!formData.title || !formData.content) {
      toast({ variant: "destructive", title: "Please fill required fields" });
      return;
    }

    try {
      // 2. Call the mutation to save data to MongoDB
      await createJournal(formData).unwrap();

      toast({ title: "Journal published successfully! 🚀" });

      // 3. Redirect back to the journals list
      router.push("/journals");
    } catch (error) {
      console.error("Failed to save journal:", error);
      toast({
        variant: "destructive",
        title: "Error creating journal",
        description: "Please check your network or try again.",
      });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/journals"
          className="flex items-center gap-2 text-slate-600 hover:text-[#4161df] transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Back to Journals</span>
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Create New Journal</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Journal Title
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Best Residential Societies in Sector 82, Mohali"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#4161df]/20 outline-none transition-all"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Excerpt (Meta Description)
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe what this guide is about for SEO..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#4161df]/20 outline-none resize-none transition-all"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Content
              </label>
              <textarea
                required
                rows={15}
                placeholder="Write your full guide content here..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#4161df]/20 outline-none font-sans text-sm leading-relaxed"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-[#4161df] transition-colors cursor-pointer"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="Investment">Investment Guide</option>
                <option value="Market News">Market News</option>
                <option value="Legal">Legal & Documentation</option>
                <option value="Lifestyle">Tricity Lifestyle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Target Sector/City (Tricity)
              </label>
              <input
                type="text"
                placeholder="e.g. Mohali Sector 115"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none transition-all"
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
                        : "Choose Image"}
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
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none text-sm"
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
              disabled={loading}
              type="submit"
              className="w-full bg-[#4161df] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#3551c0] disabled:opacity-50 transition-all shadow-lg shadow-[#4161df]/20"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              {loading ? "Publishing..." : "Publish Journal"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
