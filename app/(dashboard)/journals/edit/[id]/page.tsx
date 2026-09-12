"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  Image as ImageIcon,
  X,
  Eye,
  Edit3,
  Lock,
  Unlock,
  Clock,
  AlignLeft,
  Hash,
  Search,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  FileText,
  Type,
  BookOpen,
  Link2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  useGetJournalByIdQuery,
  useUpdateJournalMutation,
} from "@/services/journalApi";
import dynamic from "next/dynamic";
import type { RichTextEditorRef } from "@/components/RichTextEditor";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  ssr: false,
});

function estimateReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default function EditJournalPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const editorRef = useRef<RichTextEditorRef>(null);
  const contentInitializedRef = useRef(false);

  const {
    data: journal,
    isLoading: fetching,
    isError,
  } = useGetJournalByIdQuery(id);

  const [updateJournal, { isLoading: isUpdating }] = useUpdateJournalMutation();

  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    category: string;
    targetSector: string;
    excerpt: string;
    metaTitle: string;
    keywords: string[];
    content: string;
    coverImage: string | File;
  }>({
    title: "",
    slug: "",
    category: "",
    targetSector: "",
    excerpt: "",
    metaTitle: "",
    keywords: [],
    content: "",
    coverImage: "",
  });

  const [keywordInput, setKeywordInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [slugLocked, setSlugLocked] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [contentStats, setContentStats] = useState({
    words: 0,
    chars: 0,
    readingTime: "1 min read",
  });
  const [isDirty, setIsDirty] = useState(false);

  const parseKeywords = (input: string) => {
    return input
      .split(",")
      .map((kw) => kw.trim())
      .filter((kw) => kw.length > 0);
  };

  const addKeywords = () => {
    const newKeywords = parseKeywords(keywordInput);
    if (newKeywords.length > 0) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...new Set([...prev.keywords, ...newKeywords])],
      }));
      setIsDirty(true);
    }
    setKeywordInput("");
  };

  const removeKeyword = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index),
    }));
    setIsDirty(true);
  };

  useEffect(() => {
    if (journal && !contentInitializedRef.current) {
      const content = journal.content || "";
      setFormData({
        title: journal.title || "",
        slug: journal.slug || "",
        category: journal.category || "Investment",
        targetSector: journal.targetSector || "",
        excerpt: journal.excerpt || content.substring(0, 150) || "",
        metaTitle: journal.metaTitle || "",
        keywords: journal.keywords || [],
        content,
        coverImage: journal.coverImage || "",
      });
      setImagePreview(journal.coverImage || null);

      if (editorRef.current && content) {
        editorRef.current.setContent(content);
      }
      contentInitializedRef.current = true;

      setContentStats({
        words: countWords(content),
        chars: content.length,
        readingTime: estimateReadingTime(content),
      });
    }
  }, [journal]);

  const updateContentStats = useCallback(() => {
    const content = editorRef.current?.getCurrentContent() || "";
    const words = countWords(content);
    const chars = content.length;
    setContentStats({
      words,
      chars,
      readingTime: estimateReadingTime(content),
    });
    setIsDirty(true);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, coverImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setIsDirty(true);
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setFormData({ ...formData, coverImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setIsDirty(true);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const editorContent = editorRef.current?.getCurrentContent() || "";

    if (!editorContent) {
      toast.error("Content cannot be empty");
      return;
    }

    try {
      await updateJournal({
        id,
        update: { ...formData, content: editorContent },
      }).unwrap();

      toast.success("Journal updated successfully! ✅");
      setIsDirty(false);
      router.push("/journals");
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error("Update failed", {
        description:
          error?.data?.message || "Something went wrong while saving.",
      });
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, title: e.target.value }));
    setIsDirty(true);
  };

  if (fetching)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="animate-spin text-[#4161df] mx-auto mb-4"
            size={40}
          />
          <p className="text-slate-500 font-medium">Loading journal...</p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col items-center justify-center gap-4">
        <AlertCircle size={48} className="text-red-400" />
        <p className="text-red-500 font-medium">Error loading journal.</p>
        <Link
          href="/journals"
          className="text-[#4161df] hover:underline font-medium"
        >
          Go Back to Journals
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="py-3 px-6 flex items-center justify-between">
          <Link
            href="/journals"
            className="flex items-center gap-2 text-slate-600 hover:text-[#4161df] transition-colors font-medium group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span className="hidden sm:inline">Back to List</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              {isDirty && (
                <>
                  <AlertCircle size={12} className="text-amber-500" />
                  <span className="text-amber-600 font-medium">
                    Unsaved changes
                  </span>
                </>
              )}
              {!isDirty && (
                <>
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <span className="text-emerald-600 font-medium">Saved</span>
                </>
              )}
            </div>
            <h1 className="text-lg font-bold text-slate-900 truncate max-w-[200px] hidden md:block">
              Edit: {journal?.title?.substring(0, 30)}...
            </h1>
          </div>
        </div>
      </div>

      <div className="py-6 px-6">
        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Title Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="p-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-4">
                <Type size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Article Details
                </span>
              </div>
              <div className="relative">
                <input
                  required
                  type="text"
                  placeholder="Journal title"
                  className="w-full text-xl md:text-2xl font-bold text-slate-900 px-0 py-2 border-0 border-b-2 border-transparent focus:border-[#4161df] focus:ring-0 outline-none bg-transparent placeholder:text-slate-300 transition-all"
                  value={formData.title}
                  onChange={handleTitleChange}
                  maxLength={120}
                />
                <div className="absolute right-0 bottom-2 text-xs text-slate-400">
                  {formData.title.length}/120
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50/50 flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                <Link2 size={14} />
                <span className="text-xs font-medium">Slug</span>
              </div>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                  /journal/
                </span>
                <input
                  type="text"
                  placeholder="auto-generated-from-title"
                  className="w-full pl-[4.5rem] pr-8 py-1.5 text-sm font-mono bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#4161df]/20 outline-none transition-all"
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData({ ...formData, slug: e.target.value });
                    setIsDirty(true);
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setSlugLocked(!slugLocked)}
                className={`p-1.5 rounded-lg transition-all ${
                  slugLocked
                    ? "bg-amber-50 text-amber-600 border border-amber-200"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                }`}
                title={slugLocked ? "Unlock slug" : "Lock slug"}
              >
                {slugLocked ? <Lock size={14} /> : <Unlock size={14} />}
              </button>
            </div>
          </div>

          {/* Content Editor Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="p-6 pb-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <BookOpen size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Content
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  ({contentStats.words} words · {contentStats.readingTime})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPreview(!showPreview);
                    updateContentStats();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    showPreview
                      ? "bg-[#4161df] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {showPreview ? <Edit3 size={14} /> : <Eye size={14} />}
                  {showPreview ? "Edit" : "Preview"}
                </button>
              </div>
            </div>

            <div className={showPreview ? "hidden" : "block"}>
              <RichTextEditor
                ref={editorRef}
                content={formData.content}
                isMarkdown={true}
                onChange={updateContentStats}
              />
            </div>

            {showPreview && (
              <div className="p-6 max-h-[600px] overflow-y-auto prose prose-slate max-w-none">
                {editorRef.current?.getCurrentContent() ? (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-slate-900">
                      {formData.title || "Untitled"}
                    </h2>
                    <div className="text-sm text-slate-500 border-b border-slate-200 pb-4">
                      {contentStats.readingTime} · {contentStats.words} words
                    </div>
                    <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {editorRef.current?.getCurrentContent()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-400">
                    <FileText size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No content yet</p>
                  </div>
                )}
              </div>
            )}

            <div className="px-6 py-2.5 bg-slate-50/50 border-t border-slate-100 flex items-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <AlignLeft size={12} />
                {contentStats.words} words
              </span>
              <span className="flex items-center gap-1">
                <Hash size={12} />
                {contentStats.chars} characters
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {contentStats.readingTime}
              </span>
            </div>
          </div>

          {/* SEO Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="p-6 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-4">
                <Search size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  SEO & Metadata
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Meta Title
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {formData.metaTitle.length}/120
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Best Investment Guide for Mohali - PropertyBulbul"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#4161df]/20 outline-none transition-all text-sm"
                  value={formData.metaTitle}
                  onChange={(e) => {
                    setFormData({ ...formData, metaTitle: e.target.value });
                    setIsDirty(true);
                  }}
                  maxLength={120}
                />
              </div>
            </div>

            <div className="p-6 pt-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Meta Description (Excerpt)
                </label>
                <span className="text-[11px] text-slate-400">
                  {formData.excerpt.length}/260
                </span>
              </div>
              <textarea
                rows={3}
                placeholder="Briefly describe what this guide is about for SEO..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#4161df]/20 outline-none resize-none transition-all text-sm"
                value={formData.excerpt}
                onChange={(e) => {
                  setFormData({ ...formData, excerpt: e.target.value });
                  setIsDirty(true);
                }}
                maxLength={260}
              />

              {(formData.metaTitle || formData.excerpt) && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200">
                  <div className="flex items-center gap-1.5 mb-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <Sparkles size={12} />
                    Search Result Preview
                  </div>
                  <div className="text-sm text-blue-700 font-medium truncate">
                    {formData.metaTitle || formData.title || "Journal Title"} |
                    PropertyBulbul Journal
                  </div>
                  <div className="text-xs text-emerald-700 truncate mt-0.5">
                    https://www.propertybulbul.com/journal/
                    {formData.slug || "slug"}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {formData.excerpt ||
                      "A comprehensive guide about real estate in Tricity..."}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Settings - Inline horizontal fields */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">
                Settings
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#4161df]/20 transition-all text-sm bg-white cursor-pointer appearance-none"
                    value={formData.category}
                    onChange={(e) => {
                      setFormData({ ...formData, category: e.target.value });
                      setIsDirty(true);
                    }}
                  >
                    <option value="Investment">Investment Guide</option>
                    <option value="Investment Analysis">
                      Investment Analysis
                    </option>
                    <option value="Locality Guide">Locality Guide</option>
                    <option value="City Guide">City Guide</option>
                    <option value="Market News">Market News</option>
                    <option value="Market Insights">Market Insights</option>
                    <option value="Market Updates">Market Updates</option>
                    <option value="Market Trends">Market Trends</option>
                    <option value="Market Outlook">Market Outlook</option>
                    <option value="Legal">Legal & Documentation</option>
                    <option value="Lifestyle">Tricity Lifestyle</option>
                    <option value="RERA Updates">RERA Updates</option>
                    <option value="Home Buying Guide">Home Buying Guide</option>
                    <option value="Buyer Guide">Buyer Guide</option>
                    <option value="Property Guide">Property Guide</option>
                    <option value="Real Estate Guide">Real Estate Guide</option>
                    <option value="Real Estate News">Real Estate News</option>
                    <option value="NRI Guide">NRI Guide</option>
                    <option value="Rental Guide">Rental Guide</option>
                    <option value="Tenant Guides">Tenant Guides</option>
                    <option value="Owner Guide">Owner Guide</option>
                    <option value="Owner Onboarding">Owner Onboarding</option>
                    <option value="Property Management">
                      Property Management
                    </option>
                    <option value="Construction">
                      Construction & Development
                    </option>
                    <option value="Interior & Design">Interior & Design</option>
                    <option value="Property Tax">Property Tax & Finance</option>
                    <option value="Home Loans">Home Loans & Mortgages</option>
                    <option value="Vastu">Vastu & Feng Shui</option>
                    <option value="Commercial Real Estate">
                      Commercial Real Estate
                    </option>
                    <option value="Plot & Land">Plots & Land Buying</option>
                    <option value="Affordable Housing">
                      Affordable Housing
                    </option>
                    <option value="Luxury Homes">Luxury Homes</option>
                    <option value="Builder Spotlight">Builder Spotlight</option>
                    <option value="Builder Reviews">
                      Builder & Project Reviews
                    </option>
                    <option value="Selling Guide">
                      Property Selling Guide
                    </option>
                    <option value="Government Schemes">
                      Government Schemes
                    </option>
                    <option value="Infrastructure">
                      Infrastructure & Connectivity
                    </option>
                    <option value="Smart Homes">
                      Smart Homes & Technology
                    </option>
                    <option value="PG & Co Living">PG & Co-Living</option>
                    <option value="Student Housing">Student Housing</option>
                    <option value="Real Estate Tips">Tips & FAQs</option>
                    <option value="News & Events">News & Events</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Target Sector/City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mohali Sector 115"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#4161df]/20 outline-none transition-all text-sm"
                    value={formData.targetSector}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        targetSector: e.target.value,
                      });
                      setIsDirty(true);
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Cover Image
                  </label>
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
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-[#4161df] hover:bg-[#4161df]/5 cursor-pointer transition-all text-xs text-slate-600"
                    >
                      <ImageIcon size={16} />
                      <span className="truncate">
                        {formData.coverImage instanceof File
                          ? formData.coverImage.name
                          : "Change"}
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Or image URL"
                      className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-xs focus:ring-2 focus:ring-[#4161df]/20 transition-all"
                      value={
                        typeof formData.coverImage === "string"
                          ? formData.coverImage
                          : ""
                      }
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          coverImage: e.target.value,
                        });
                        setImagePreview(e.target.value);
                        setIsDirty(true);
                      }}
                    />
                  </div>
                </div>
              </div>
              {imagePreview && (
                <div className="mt-3 relative aspect-video max-h-48 rounded-xl overflow-hidden border border-slate-200 group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData({ ...formData, coverImage: "" });
                      setIsDirty(true);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Keywords Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">
                Keywords
              </h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Type keyword, press Add"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#4161df]/20 outline-none transition-all text-sm"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addKeywords();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addKeywords}
                  className="px-5 py-2.5 bg-[#4161df] text-white rounded-xl text-sm font-medium hover:bg-[#3551c0] transition-all shrink-0"
                >
                  Add
                </button>
              </div>
              {formData.keywords.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {formData.keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium transition-all hover:bg-blue-100"
                    >
                      #{kw}
                      <button
                        type="button"
                        onClick={() => removeKeyword(idx)}
                        className="hover:text-red-500 transition-colors ml-0.5"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-2">
                  No keywords added yet
                </p>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  {isDirty ? "Unsaved changes" : "All saved"}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {contentStats.readingTime}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <AlignLeft size={12} />
                  {contentStats.words} words
                </span>
                <span>·</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                  ID: {id?.substring(0, 8)}...
                </span>
              </div>
              <button
                disabled={isUpdating}
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-[#4161df] to-[#3551c0] text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-[#3551c0] hover:to-[#2a42a0] disabled:opacity-50 transition-all shadow-lg shadow-[#4161df]/20"
              >
                {isUpdating ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Save size={20} />
                )}
                {isUpdating ? "Saving Changes..." : "Save Journal"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
