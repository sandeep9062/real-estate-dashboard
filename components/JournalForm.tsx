"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Loader2,
  X,
  Eye,
  PenLine,
  Lock,
  Unlock,
  Search,
  AlertCircle,
  CheckCircle2,
  FileText,
  Link2,
  ChevronDown,
  MapPin,
  Tags,
  UserRound,
  Share2,
  Upload,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  useCreateJournalMutation,
  useUpdateJournalMutation,
  useGetJournalByIdQuery,
} from "@/services/journalApi";
import dynamic from "next/dynamic";
import type { RichTextEditorRef } from "@/components/RichTextEditor";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  ssr: false,
});

const DRAFT_STORAGE_KEY = "journal_new_draft";

const CATEGORIES: [string, string][] = [
  ["Investment", "Investment Guide"],
  ["Investment Analysis", "Investment Analysis"],
  ["Locality Guide", "Locality Guide"],
  ["City Guide", "City Guide"],
  ["Market News", "Market News"],
  ["Market Insights", "Market Insights"],
  ["Market Updates", "Market Updates"],
  ["Market Trends", "Market Trends"],
  ["Market Outlook", "Market Outlook"],
  ["Legal", "Legal & Documentation"],
  ["Lifestyle", "Tricity Lifestyle"],
  ["RERA Updates", "RERA Updates"],
  ["Home Buying Guide", "Home Buying Guide"],
  ["Buyer Guide", "Buyer Guide"],
  ["Property Guide", "Property Guide"],
  ["Real Estate Guide", "Real Estate Guide"],
  ["Real Estate News", "Real Estate News"],
  ["NRI Guide", "NRI Guide"],
  ["Rental Guide", "Rental Guide"],
  ["Tenant Guides", "Tenant Guides"],
  ["Owner Guide", "Owner Guide"],
  ["Owner Onboarding", "Owner Onboarding"],
  ["Property Management", "Property Management"],
  ["Construction", "Construction & Development"],
  ["Interior & Design", "Interior & Design"],
  ["Property Tax", "Property Tax & Finance"],
  ["Home Loans", "Home Loans & Mortgages"],
  ["Vastu", "Vastu & Feng Shui"],
  ["Commercial Real Estate", "Commercial Real Estate"],
  ["Plot & Land", "Plots & Land Buying"],
  ["Affordable Housing", "Affordable Housing"],
  ["Luxury Homes", "Luxury Homes"],
  ["Builder Spotlight", "Builder Spotlight"],
  ["Builder Reviews", "Builder & Project Reviews"],
  ["Selling Guide", "Property Selling Guide"],
  ["Government Schemes", "Government Schemes"],
  ["Infrastructure", "Infrastructure & Connectivity"],
  ["Smart Homes", "Smart Homes & Technology"],
  ["PG & Co Living", "PG & Co-Living"],
  ["Student Housing", "Student Housing"],
  ["Real Estate Tips", "Tips & FAQs"],
  ["News & Events", "News & Events"],
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function estimateReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/* ------------------------------------------------------------------ */
/* Small presentational helpers                                        */
/* ------------------------------------------------------------------ */

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-300 focus:border-[#4161df] focus:outline-none focus:ring-2 focus:ring-[#4161df]/15";

function Field({
  label,
  htmlFor,
  counter,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  counter?: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label
          htmlFor={htmlFor}
          className="text-[13px] font-medium text-slate-700"
        >
          {label}
        </label>
        {counter}
      </div>
      {children}
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/** Length meter: grey when empty, amber outside the ideal range, green inside it. */
function Meter({
  value,
  idealMin,
  idealMax,
  limit,
}: {
  value: number;
  idealMin: number;
  idealMax: number;
  limit: number;
}) {
  const pct = Math.min(100, (value / limit) * 100);
  const tone =
    value === 0
      ? "bg-slate-300"
      : value >= idealMin && value <= idealMax
        ? "bg-emerald-500"
        : "bg-amber-500";
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs tabular-nums text-slate-500">
        {value}/{limit}
      </span>
      <span className="h-1 w-12 overflow-hidden rounded-full bg-slate-100">
        <span
          className={`block h-full rounded-full transition-all ${tone}`}
          style={{ width: `${pct}%` }}
        />
      </span>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  summary,
  defaultOpen = false,
  children,
}: {
  icon: LucideIcon;
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 select-none hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4161df]/40 [&::-webkit-details-marker]:hidden">
        <Icon size={16} className="shrink-0 text-slate-400" />
        <span className="text-sm font-semibold text-slate-900">{title}</span>
        {summary && (
          <span className="ml-auto max-w-[45%] truncate text-xs text-slate-500">
            {summary}
          </span>
        )}
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform group-open:rotate-180 ${
            summary ? "" : "ml-auto"
          }`}
        />
      </summary>
      <div className="space-y-4 border-t border-slate-100 px-4 py-4">
        {children}
      </div>
    </details>
  );
}

/* ------------------------------------------------------------------ */

interface JournalFormProps {
  /** "create" renders an empty form that publishes a new journal.
   *  "edit" loads the existing journal by id and updates it. */
  mode: "create" | "edit";
  /** Required in "edit" mode — the journal id to load & update. */
  journalId?: string;
}

interface FormState {
  title: string;
  slug: string;
  category: string;
  targetCity: string;
  targetSector: string;
  status: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  noIndex: boolean;
  content: string;
  coverImage: string | File;
  altText: string;
  coverImageWidth?: number;
  coverImageHeight?: number;
  authorName: string;
  authorRole: string;
  authorAvatar: string | File;
  relatedSlugs: string[];
}

export default function JournalForm({ mode, journalId }: JournalFormProps) {
  const isEdit = mode === "edit";
  const router = useRouter();
  const editorRef = useRef<RichTextEditorRef>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const contentInitializedRef = useRef(false);

  // Only fetch in edit mode; skip otherwise so create mode never hits the API.
  const {
    data: journal,
    isLoading: fetching,
    isError,
  } = useGetJournalByIdQuery(journalId as string, {
    skip: !isEdit || !journalId,
  });

  const [createJournal, { isLoading: creating }] = useCreateJournalMutation();
  const [updateJournal, { isLoading: updating }] = useUpdateJournalMutation();

  const loading = isEdit ? updating : creating;

  const [formData, setFormData] = useState<FormState>({
    title: "",
    slug: "",
    category: "Investment",
    targetCity: "",
    targetSector: "",
    status: "published",
    excerpt: "",
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    canonicalUrl: "",
    noIndex: false,
    content: "",
    coverImage: "",
    altText: "",
    coverImageWidth: undefined,
    coverImageHeight: undefined,
    authorName: "",
    authorRole: "",
    authorAvatar: "",
    relatedSlugs: [],
  });

  const [keywordInput, setKeywordInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [authorAvatarPreview, setAuthorAvatarPreview] = useState<string | null>(
    null,
  );
  const [slugLocked, setSlugLocked] = useState(isEdit);
  const [showPreview, setShowPreview] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved",
  );
  const [contentStats, setContentStats] = useState({
    words: 0,
    chars: 0,
    readingTime: "1 min read",
  });
  const [isDirty, setIsDirty] = useState(false);

  // Marks the form dirty — only meaningful in edit mode (create mode relies on
  // the localStorage draft auto-save indicator instead).
  const markDirty = useCallback(() => {
    if (isEdit) setIsDirty(true);
  }, [isEdit]);

  /** Update one field and mark the form dirty. */
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    markDirty();
  };

  // Load draft from localStorage on mount (create mode only)
  useEffect(() => {
    if (isEdit) return;
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
        if (parsed.coverImage && typeof parsed.coverImage === "string") {
          setImagePreview(parsed.coverImage);
        }
        if (parsed.authorAvatar && typeof parsed.authorAvatar === "string") {
          setAuthorAvatarPreview(parsed.authorAvatar);
        }
      }
    } catch {}
  }, [isEdit]);

  // Auto-save draft to localStorage (create mode only)
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (isEdit) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      try {
        const toSave = {
          ...formData,
          coverImage:
            typeof formData.coverImage === "string" ? formData.coverImage : "",
          authorAvatar:
            typeof formData.authorAvatar === "string"
              ? formData.authorAvatar
              : "",
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(toSave));
        setSaveStatus("saved");
      } catch {}
    }, 2000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [formData, isEdit]);

  // Hydrate the form + editor from the fetched journal (edit mode only)
  useEffect(() => {
    if (!isEdit || !journal || contentInitializedRef.current) return;
    const content = journal.content || "";
    setFormData({
      title: journal.title || "",
      slug: journal.slug || "",
      category: journal.category || "Investment",
      targetSector: journal.targetSector || "",
      excerpt: journal.excerpt || content.substring(0, 150) || "",
      metaTitle: journal.metaTitle || "",
      metaDescription: journal.metaDescription || "",
      targetCity: journal.targetCity || "",
      status: journal.status || "published",
      keywords: journal.keywords || [],
      canonicalUrl: journal.canonicalUrl || "",
      noIndex: journal.noIndex ?? false,
      content,
      coverImage: journal.coverImage || "",
      authorName: journal.author?.name || "",
      authorRole: journal.author?.role || "",
      authorAvatar: journal.author?.avatar || "",
      relatedSlugs: journal.relatedSlugs || [],
      altText: journal.altText || "",
      coverImageWidth: journal.coverImageWidth,
      coverImageHeight: journal.coverImageHeight,
    });
    setImagePreview(journal.coverImage || null);
    if (journal.author?.avatar) setAuthorAvatarPreview(journal.author.avatar);

    // The editor is loaded dynamically, so its ref may not exist yet. Content is
    // also passed through the `content` prop and kept in formData as fallback.
    if (editorRef.current && content) {
      editorRef.current.setContent(content);
    }
    contentInitializedRef.current = true;

    setContentStats({
      words: countWords(content),
      chars: content.length,
      readingTime: estimateReadingTime(content),
    });
  }, [journal, isEdit]);

  // Update content stats when editor content changes
  const updateContentStats = useCallback(() => {
    const content = editorRef.current?.getCurrentContent() || "";
    setContentStats({
      words: countWords(content),
      chars: content.length,
      readingTime: estimateReadingTime(content),
    });
    if (isEdit) setIsDirty(true);
  }, [isEdit]);

  // Warn before leaving with unsaved edits
  useEffect(() => {
    if (!isEdit || !isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isEdit, isDirty]);

  // Ctrl/Cmd + S submits the form
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
  };

  const addKeywords = () => {
    const newKeywords = keywordInput
      .split(",")
      .map((kw) => kw.trim())
      .filter((kw) => kw.length > 0);
    if (newKeywords.length > 0) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...new Set([...prev.keywords, ...newKeywords])],
      }));
      markDirty();
    }
    setKeywordInput("");
  };

  const removeKeyword = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index),
    }));
    markDirty();
  };

  const readPreview = (file: File, setter: (v: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      update("coverImage", file);
      readPreview(file, setImagePreview);
    }
  };

  const handleAuthorAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      update("authorAvatar", file);
      readPreview(file, setAuthorAvatarPreview);
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      update("coverImage", file);
      readPreview(file, setImagePreview);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Fall back to the loaded content if the editor ref isn't ready, so saving
    // an untouched journal never fails with "Content cannot be empty".
    const editorContent =
      editorRef.current?.getCurrentContent() || formData.content || "";

    if (isEdit) {
      if (!editorContent) {
        toast.error("Content cannot be empty");
        return;
      }
      const { authorName, authorRole, authorAvatar, ...rest } = formData;
      const author =
        authorName || authorRole
          ? { name: authorName || undefined, role: authorRole || undefined }
          : undefined;
      // Tell the server about explicit removals (empty strings are ignored).
      const removeCover = !rest.coverImage && !!journal?.coverImage;
      const removeAuthorAvatar = !authorAvatar && !!journal?.author?.avatar;
      try {
        await updateJournal({
          id: journalId as string,
          update: {
            ...rest,
            author,
            authorAvatar,
            content: editorContent,
            ...(removeCover ? { removeCover: true } : {}),
            ...(removeAuthorAvatar ? { removeAuthorAvatar: true } : {}),
          },
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
      return;
    }

    if (!formData.title.trim() || !editorContent) {
      toast.error("Missing required fields", {
        description: "Title and content are required to publish a journal.",
      });
      return;
    }

    const { authorName, authorRole, authorAvatar, ...rest } = formData;
    const author =
      authorName || authorRole
        ? { name: authorName || undefined, role: authorRole || undefined }
        : undefined;

    setSaveStatus("saving");

    try {
      await createJournal({
        ...rest,
        author,
        authorAvatar,
        content: editorContent,
      }).unwrap();
      clearDraft();
      toast.success("Journal published successfully! 🚀");
      router.push("/journals");
    } catch (error: any) {
      console.error("Failed to save journal:", error);
      setSaveStatus("unsaved");
      toast.error("Error creating journal", {
        description:
          error?.data?.message || "Please check your network or try again.",
      });
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug:
        !isEdit && !slugLocked && prev.slug === ""
          ? slugify(newTitle)
          : prev.slug,
    }));
    markDirty();
  };

  // Edit-mode loading & error states
  if (isEdit && fetching)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2
            className="mx-auto mb-3 animate-spin text-[#4161df]"
            size={32}
          />
          <p className="text-sm font-medium text-slate-500">Loading journal…</p>
        </div>
      </div>
    );

  if (isEdit && isError)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">
        <AlertCircle size={40} className="text-red-400" />
        <p className="font-medium text-slate-900">
          This journal couldn’t be loaded.
        </p>
        <p className="text-sm text-slate-500">
          Check your connection and try again.
        </p>
        <Link
          href="/journals"
          className="mt-1 text-sm font-medium text-[#4161df] hover:underline"
        >
          Back to journals
        </Link>
      </div>
    );

  const publishLabel = isEdit
    ? loading
      ? "Saving…"
      : "Save changes"
    : loading
      ? "Publishing…"
      : "Publish";

  const serpTitle = formData.metaTitle || formData.title || "Journal title";
  const serpDescription =
    formData.metaDescription ||
    formData.excerpt ||
    "Add a meta description to control how this article appears in search results.";
  const draftText = isEdit
    ? isDirty
      ? "Unsaved changes"
      : "All changes saved"
    : saveStatus === "saving"
      ? "Saving draft…"
      : saveStatus === "unsaved"
        ? "Not saved"
        : "Draft saved";
  const draftTone = isEdit
    ? isDirty
      ? "amber"
      : "green"
    : saveStatus === "saved"
      ? "green"
      : saveStatus === "saving"
        ? "amber"
        : "red";

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="min-h-screen bg-slate-50 text-slate-900"
    >
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
          <Link
            href="/journals"
            className="-ml-2 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Journals</span>
          </Link>

          <span className="hidden h-5 w-px bg-slate-200 sm:block" />
          <p className="hidden min-w-0 flex-1 truncate text-sm text-slate-500 sm:block">
            {isEdit
              ? journal?.title || "Edit journal"
              : formData.title || "New journal"}
          </p>

          <div className="ml-auto flex items-center gap-3">
            <span
              className={`hidden items-center gap-1.5 text-xs font-medium sm:flex ${
                draftTone === "green"
                  ? "text-emerald-600"
                  : draftTone === "amber"
                    ? "text-amber-600"
                    : "text-red-600"
              }`}
            >
              {draftTone === "green" ? (
                <CheckCircle2 size={14} />
              ) : saveStatus === "saving" && !isEdit ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <AlertCircle size={14} />
              )}
              {draftText}
            </span>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#4161df] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3551c0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4161df]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              title="Ctrl/Cmd + S"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Save size={16} />
              )}
              {publishLabel}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:py-8">
        {/* ============ Writing column ============ */}
        <main className="min-w-0 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="px-5 pt-5 sm:px-8 sm:pt-7">
              <label htmlFor="title" className="sr-only">
                Title
              </label>
              <textarea
                id="title"
                required
                rows={2}
                maxLength={120}
                placeholder="Best residential societies in Sector 82, Mohali"
                value={formData.title}
                onChange={(e) =>
                  handleTitleChange(
                    e as unknown as React.ChangeEvent<HTMLInputElement>,
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
                className="w-full resize-none border-0 bg-transparent p-0 font-serif text-3xl font-bold leading-tight tracking-tight text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-4xl"
              />
              <div className="mt-1 flex items-center justify-between gap-3 pb-4">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-sm">
                  <Link2 size={14} className="shrink-0 text-slate-400" />
                  <span className="hidden shrink-0 font-mono text-xs text-slate-400 sm:inline">
                    /journal/
                  </span>
                  <input
                    type="text"
                    aria-label="Slug"
                    placeholder="generated-from-title"
                    value={formData.slug}
                    onChange={(e) => update("slug", e.target.value)}
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => setSlugLocked(!slugLocked)}
                    aria-pressed={slugLocked}
                    className={`shrink-0 rounded-md p-1 transition-colors ${
                      slugLocked
                        ? "bg-amber-100 text-amber-700"
                        : "text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                    }`}
                    title={
                      slugLocked
                        ? "Slug is locked. It won’t follow the title."
                        : "Slug follows the title until you edit it."
                    }
                  >
                    {slugLocked ? <Lock size={13} /> : <Unlock size={13} />}
                  </button>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-slate-400">
                  {formData.title.length}/120
                </span>
              </div>
            </div>

            {/* Editor toolbar: write / preview */}
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2 sm:px-6">
              <div
                role="tablist"
                aria-label="Editor mode"
                className="inline-flex rounded-lg bg-slate-100 p-0.5"
              >
                {[
                  { id: false, label: "Write", icon: PenLine },
                  { id: true, label: "Preview", icon: Eye },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    role="tab"
                    aria-selected={showPreview === id}
                    onClick={() => {
                      setShowPreview(id);
                      updateContentStats();
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      showPreview === id
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Icon size={13} />
                    {label}
                  </button>
                ))}
              </div>
              <span className="text-xs tabular-nums text-slate-500">
                {contentStats.words.toLocaleString()} words ·{" "}
                {contentStats.readingTime}
              </span>
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
              <div className="max-h-[70vh] overflow-y-auto px-5 py-8 sm:px-8">
                {editorRef.current?.getCurrentContent() ? (
                  <article className="mx-auto max-w-2xl">
                    <h2 className="font-serif text-3xl font-bold leading-tight text-slate-900">
                      {formData.title || "Untitled"}
                    </h2>
                    <p className="mt-2 border-b border-slate-200 pb-5 text-sm text-slate-500">
                      {contentStats.readingTime} ·{" "}
                      {contentStats.words.toLocaleString()} words
                    </p>
                    <div className="mt-6 whitespace-pre-wrap font-serif text-[17px] leading-8 text-slate-700">
                      {editorRef.current?.getCurrentContent()}
                    </div>
                  </article>
                ) : (
                  <div className="py-16 text-center text-slate-400">
                    <FileText size={40} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm">
                      {isEdit
                        ? "This journal has no content yet."
                        : "Write something to see it here."}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 border-t border-slate-100 px-4 py-2 text-xs tabular-nums text-slate-500 sm:px-6">
              <span>{contentStats.words.toLocaleString()} words</span>
              <span>{contentStats.chars.toLocaleString()} characters</span>
              {isEdit && journalId && (
                <span className="ml-auto font-mono text-[11px] text-slate-400">
                  ID {journalId.substring(0, 8)}
                </span>
              )}
            </div>
          </div>
        </main>

        {/* ============ Sidebar ============ */}
        <aside className="space-y-3 lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:pr-1">
          <Section
            icon={MapPin}
            title="Category and location"
            summary={formData.category}
            defaultOpen
          >
            <Field label="Category" htmlFor="category">
              <select
                id="category"
                value={formData.category}
                onChange={(e) => update("category", e.target.value)}
                className={`${inputCls} cursor-pointer`}
              >
                {CATEGORIES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" htmlFor="targetCity">
                <input
                  id="targetCity"
                  type="text"
                  placeholder="Chandigarh"
                  value={formData.targetCity}
                  onChange={(e) => update("targetCity", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Sector or area" htmlFor="targetSector">
                <input
                  id="targetSector"
                  type="text"
                  placeholder="Mohali Sector 115"
                  value={formData.targetSector}
                  onChange={(e) => update("targetSector", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Status" htmlFor="status">
              <select
                id="status"
                value={formData.status}
                onChange={(e) => update("status", e.target.value)}
                className={`${inputCls} cursor-pointer`}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
          </Section>

          <Section
            icon={ImageIcon}
            title="Cover image"
            summary={imagePreview ? "Added" : "None"}
            defaultOpen
          >
            {imagePreview ? (
              <div className="group/img relative aspect-video overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                <img
                  src={imagePreview}
                  alt={formData.altText || "Cover preview"}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    update("coverImage", "");
                  }}
                  className="absolute right-2 top-2 rounded-md bg-slate-900/70 p-1.5 text-white opacity-100 transition-opacity hover:bg-slate-900 focus-visible:opacity-100 sm:opacity-0 sm:group-hover/img:opacity-100"
                  aria-label="Remove cover image"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  id="coverImage"
                  onChange={handleImageChange}
                />
                <label
                  htmlFor="coverImage"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingImage(true);
                  }}
                  onDragLeave={() => setIsDraggingImage(false)}
                  onDrop={handleImageDrop}
                  className={`flex aspect-video cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed text-center transition-colors ${
                    isDraggingImage
                      ? "border-[#4161df] bg-[#4161df]/5"
                      : "border-slate-300 hover:border-[#4161df] hover:bg-slate-50"
                  }`}
                >
                  <Upload size={20} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">
                    Drop an image or browse
                  </span>
                  <span className="text-xs text-slate-500">
                    PNG, JPG or WebP
                  </span>
                </label>
              </>
            )}

            {formData.coverImage instanceof File && (
              <p className="truncate text-xs text-slate-500">
                {formData.coverImage.name}
              </p>
            )}

            <Field label="Or paste an image URL" htmlFor="coverUrl">
              <input
                id="coverUrl"
                type="text"
                placeholder="https://…"
                value={
                  typeof formData.coverImage === "string"
                    ? formData.coverImage
                    : ""
                }
                onChange={(e) => {
                  update("coverImage", e.target.value);
                  setImagePreview(e.target.value || null);
                }}
                className={inputCls}
              />
            </Field>

            <Field
              label="Alt text"
              htmlFor="altText"
              hint="Describe the image for screen readers and search engines."
            >
              <input
                id="altText"
                type="text"
                placeholder="Modern 3BHK apartment with balcony view"
                value={formData.altText}
                onChange={(e) => update("altText", e.target.value)}
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Width (px)" htmlFor="coverW">
                <input
                  id="coverW"
                  type="number"
                  placeholder="1200"
                  value={formData.coverImageWidth ?? ""}
                  onChange={(e) =>
                    update(
                      "coverImageWidth",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Height (px)" htmlFor="coverH">
                <input
                  id="coverH"
                  type="number"
                  placeholder="630"
                  value={formData.coverImageHeight ?? ""}
                  onChange={(e) =>
                    update(
                      "coverImageHeight",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>

          <Section
            icon={Search}
            title="Search appearance"
            summary={formData.noIndex ? "Hidden" : undefined}
            defaultOpen
          >
            {/* Live search result preview */}
            <div className="rounded-lg border border-slate-200 bg-white p-3.5">
              <p className="truncate text-xs text-slate-500">
                propertybulbul.com › journal › {formData.slug || "slug"}
              </p>
              <p className="mt-0.5 truncate text-[17px] leading-snug text-[#1a0dab]">
                {serpTitle} | PropertyBulbul Journal
              </p>
              <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-slate-600">
                {serpDescription}
              </p>
            </div>

            <Field
              label="Meta title"
              htmlFor="metaTitle"
              counter={
                <Meter
                  value={formData.metaTitle.length}
                  idealMin={30}
                  idealMax={60}
                  limit={120}
                />
              }
            >
              <input
                id="metaTitle"
                type="text"
                maxLength={120}
                placeholder="Best investment guide for Mohali"
                value={formData.metaTitle}
                onChange={(e) => update("metaTitle", e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field
              label="Meta description"
              htmlFor="metaDescription"
              counter={
                <Meter
                  value={formData.metaDescription.length}
                  idealMin={110}
                  idealMax={160}
                  limit={170}
                />
              }
            >
              <textarea
                id="metaDescription"
                rows={3}
                maxLength={170}
                placeholder="Summarise the article in one or two sentences."
                value={formData.metaDescription}
                onChange={(e) => update("metaDescription", e.target.value)}
                className={`${inputCls} resize-none`}
              />
            </Field>

            <Field
              label="Excerpt"
              htmlFor="excerpt"
              hint="Shown on journal cards and listings."
              counter={
                <span className="text-xs tabular-nums text-slate-500">
                  {formData.excerpt.length}/260
                </span>
              }
            >
              <textarea
                id="excerpt"
                rows={3}
                maxLength={260}
                placeholder="A short teaser for the article."
                value={formData.excerpt}
                onChange={(e) => update("excerpt", e.target.value)}
                className={`${inputCls} resize-none`}
              />
            </Field>

            <Field label="Canonical URL" htmlFor="canonicalUrl">
              <input
                id="canonicalUrl"
                type="text"
                placeholder="https://www.propertybulbul.com/journal/custom-slug"
                value={formData.canonicalUrl}
                onChange={(e) => update("canonicalUrl", e.target.value)}
                className={inputCls}
              />
            </Field>

            <label
              htmlFor="noIndex"
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50"
            >
              <input
                type="checkbox"
                id="noIndex"
                checked={formData.noIndex}
                onChange={(e) => update("noIndex", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#4161df] focus:ring-[#4161df]"
              />
              <span>
                <span className="block text-sm font-medium text-slate-800">
                  Hide from search engines
                </span>
                <span className="block text-xs text-slate-500">
                  Adds a noindex tag. Readers with the link can still open it.
                </span>
              </span>
            </label>
          </Section>

          <Section
            icon={UserRound}
            title="Author"
            summary={formData.authorName || undefined}
          >
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                {authorAvatarPreview ? (
                  <img
                    src={authorAvatarPreview}
                    alt="Author avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound
                    size={20}
                    className="absolute inset-0 m-auto text-slate-400"
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  id="authorAvatar"
                  onChange={handleAuthorAvatarChange}
                />
                <label
                  htmlFor="authorAvatar"
                  className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  {authorAvatarPreview ? "Change photo" : "Upload photo"}
                </label>
                {authorAvatarPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthorAvatarPreview(null);
                      update("authorAvatar", "");
                    }}
                    className="rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name" htmlFor="authorName">
                <input
                  id="authorName"
                  type="text"
                  placeholder="Sandeep Saini"
                  value={formData.authorName}
                  onChange={(e) => update("authorName", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Role" htmlFor="authorRole">
                <input
                  id="authorRole"
                  type="text"
                  placeholder="Real Estate Analyst"
                  value={formData.authorRole}
                  onChange={(e) => update("authorRole", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>

          <Section
            icon={Tags}
            title="Keywords"
            summary={
              formData.keywords.length
                ? `${formData.keywords.length}`
                : undefined
            }
          >
            <div className="flex gap-2">
              <input
                type="text"
                aria-label="Add keywords"
                placeholder="Type a keyword, then press Enter"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addKeywords();
                  }
                }}
                className={inputCls}
              />
              <button
                type="button"
                onClick={addKeywords}
                className="shrink-0 rounded-lg border border-slate-200 px-3.5 text-sm font-medium text-slate-700 transition-colors hover:border-[#4161df] hover:text-[#4161df]"
              >
                Add
              </button>
            </div>
            <p className="-mt-2 text-xs text-slate-500">
              Separate several keywords with commas.
            </p>
            {formData.keywords.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {formData.keywords.map((kw, idx) => (
                  <span
                    key={`${kw}-${idx}`}
                    className="inline-flex items-center gap-1 rounded-md bg-[#4161df]/10 py-1 pl-2.5 pr-1.5 text-xs font-medium text-[#3551c0]"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => removeKeyword(idx)}
                      className="rounded p-0.5 transition-colors hover:bg-[#4161df]/15 hover:text-red-600"
                      aria-label={`Remove ${kw}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No keywords yet.</p>
            )}
          </Section>

          <Section
            icon={Share2}
            title="Related articles"
            summary={
              formData.relatedSlugs.length
                ? `${formData.relatedSlugs.length}`
                : undefined
            }
          >
            <Field
              label="Slugs"
              htmlFor="relatedSlugs"
              hint="Comma-separated slugs of journals to link from this article."
            >
              <input
                id="relatedSlugs"
                type="text"
                placeholder="investment-guide-sector-115-mohali"
                value={formData.relatedSlugs.join(", ")}
                onChange={(e) =>
                  update(
                    "relatedSlugs",
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
                className={`${inputCls} font-mono text-xs`}
              />
            </Field>
            {formData.relatedSlugs.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {formData.relatedSlugs.map((slug, idx) => (
                  <span
                    key={`${slug}-${idx}`}
                    className="inline-flex items-center gap-1 rounded-md bg-slate-100 py-1 pl-2.5 pr-1.5 font-mono text-xs text-slate-700"
                  >
                    {slug}
                    <button
                      type="button"
                      onClick={() =>
                        update(
                          "relatedSlugs",
                          formData.relatedSlugs.filter((_, i) => i !== idx),
                        )
                      }
                      className="rounded p-0.5 transition-colors hover:bg-slate-200 hover:text-red-600"
                      aria-label={`Remove ${slug}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Section>
        </aside>
      </div>
    </form>
  );
}
