"use client";
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Loader2,
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
  Star,
  Trash2,
  Tag,
  Layers,
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  useCreateJournalMutation,
  useUpdateJournalMutation,
  useGetJournalByIdQuery,
  type JournalInput,
} from "@/services/journalApi";
import dynamic from "next/dynamic";
import type { RichTextEditorRef } from "@/components/RichTextEditor";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  ssr: false,
});

const DRAFT_STORAGE_KEY = "journal_new_draft";

// Must match the limits in the backend Journal model.
const TITLE_MAX = 120;
const META_TITLE_MAX = 70;
const META_DESCRIPTION_MAX = 170;
const EXCERPT_MAX = 260; // backend allows 300; keep a safety margin

const CATEGORIES: { value: string; label: string }[] = [
  { value: "Investment", label: "Investment Guide" },
  { value: "Investment Analysis", label: "Investment Analysis" },
  { value: "Locality Guide", label: "Locality Guide" },
  { value: "City Guide", label: "City Guide" },
  { value: "Market News", label: "Market News" },
  { value: "Market Insights", label: "Market Insights" },
  { value: "Market Updates", label: "Market Updates" },
  { value: "Market Trends", label: "Market Trends" },
  { value: "Market Outlook", label: "Market Outlook" },
  { value: "Legal", label: "Legal & Documentation" },
  { value: "Lifestyle", label: "Tricity Lifestyle" },
  { value: "RERA Updates", label: "RERA Updates" },
  { value: "Home Buying Guide", label: "Home Buying Guide" },
  { value: "Buyer Guide", label: "Buyer Guide" },
  { value: "Property Guide", label: "Property Guide" },
  { value: "Real Estate Guide", label: "Real Estate Guide" },
  { value: "Real Estate News", label: "Real Estate News" },
  { value: "NRI Guide", label: "NRI Guide" },
  { value: "Rental Guide", label: "Rental Guide" },
  { value: "Tenant Guides", label: "Tenant Guides" },
  { value: "Owner Guide", label: "Owner Guide" },
  { value: "Owner Onboarding", label: "Owner Onboarding" },
  { value: "Property Management", label: "Property Management" },
  { value: "Construction", label: "Construction & Development" },
  { value: "Interior & Design", label: "Interior & Design" },
  { value: "Property Tax", label: "Property Tax & Finance" },
  { value: "Home Loans", label: "Home Loans & Mortgages" },
  { value: "Vastu", label: "Vastu & Feng Shui" },
  { value: "Commercial Real Estate", label: "Commercial Real Estate" },
  { value: "Plot & Land", label: "Plots & Land Buying" },
  { value: "Affordable Housing", label: "Affordable Housing" },
  { value: "Luxury Homes", label: "Luxury Homes" },
  { value: "Builder Spotlight", label: "Builder Spotlight" },
  { value: "Builder Reviews", label: "Builder & Project Reviews" },
  { value: "Selling Guide", label: "Property Selling Guide" },
  { value: "Government Schemes", label: "Government Schemes" },
  { value: "Infrastructure", label: "Infrastructure & Connectivity" },
  { value: "Smart Homes", label: "Smart Homes & Technology" },
  { value: "PG & Co Living", label: "PG & Co-Living" },
  { value: "Student Housing", label: "Student Housing" },
  { value: "Real Estate Tips", label: "Tips & FAQs" },
  { value: "News & Events", label: "News & Events" },
];

type JournalStatus = "draft" | "published" | "archived";

// UI state. Mirrors JournalInput, except:
//  - articleNumber is kept as a string while editing (converted on submit)
//  - publishedAt / lastReviewedAt hold "YYYY-MM-DDTHH:mm" (datetime-local)
type FormState = {
  title: string;
  slug: string;
  category: string;
  targetSector: string;
  targetCity: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  tags: string[];
  content: string;
  coverImage: string | File;
  altText: string;
  author: { name: string; role?: string; avatar?: string };
  status: JournalStatus;
  isFeatured: boolean;
  series: string;
  articleNumber: string;
  canonicalUrl: string;
  noIndex: boolean;
  relatedSlugs: string[];
  publishedAt: string;
  lastReviewedAt: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  category: "Investment",
  targetSector: "",
  targetCity: "",
  excerpt: "",
  metaTitle: "",
  metaDescription: "",
  keywords: [],
  tags: [],
  content: "",
  coverImage: "",
  altText: "",
  author: { name: "" },
  status: "published",
  isFeatured: false,
  series: "",
  articleNumber: "",
  canonicalUrl: "",
  noIndex: false,
  relatedSlugs: [],
  publishedAt: "",
  lastReviewedAt: "",
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function estimateReadingTime(content: string): string {
  const minutes = Math.max(1, Math.round(countWords(content) / 200));
  return `${minutes} min read`;
}

function parseList(input: string) {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ISO string (API) -> "YYYY-MM-DDTHH:mm" in local time (datetime-local input)
function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(
    d.getHours(),
  )}:${p(d.getMinutes())}`;
}

// datetime-local value -> ISO string (API). Empty/invalid -> undefined (omitted).
function toIso(local: string): string | undefined {
  if (!local) return undefined;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Small reusable pieces                                               */
/* ------------------------------------------------------------------ */

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#4161df]/20 focus:border-[#4161df]/40 outline-none transition-all text-sm bg-white";

function Card({
  icon,
  title,
  children,
  className = "",
}: {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}
    >
      <div className="px-5 pt-5 pb-3 flex items-center gap-2 text-slate-500">
        {icon}
        <h2 className="text-xs font-semibold uppercase tracking-wider">
          {title}
        </h2>
      </div>
      <div className="px-5 pb-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  counter,
  children,
}: {
  label: string;
  hint?: string;
  counter?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {counter && (
          <span className="text-[11px] text-slate-400">{counter}</span>
        )}
      </div>
      {children}
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function ChipInput({
  values,
  onAdd,
  onRemove,
  placeholder,
  prefix = "#",
}: {
  values: string[];
  onAdd: (items: string[]) => void;
  onRemove: (index: number) => void;
  placeholder: string;
  prefix?: string;
}) {
  const [input, setInput] = useState("");

  const commit = () => {
    const items = parseList(input);
    if (items.length) onAdd(items);
    setInput("");
  };

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder={placeholder}
          className={`${inputCls} flex-1`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            }
          }}
          onBlur={commit}
        />
        <button
          type="button"
          onClick={commit}
          className="px-4 py-2.5 bg-[#4161df] text-white rounded-xl text-sm font-medium hover:bg-[#3551c0] transition-all shrink-0"
        >
          Add
        </button>
      </div>
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v, idx) => (
            <span
              key={`${v}-${idx}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors break-all"
            >
              {prefix}
              {v}
              <button
                type="button"
                onClick={() => onRemove(idx)}
                aria-label={`Remove ${v}`}
                className="hover:text-red-500 transition-colors ml-0.5 shrink-0"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 py-1">Nothing added yet</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

interface JournalFormProps {
  /** "create" renders an empty form that publishes a new journal.
   *  "edit" loads the existing journal by id and updates it. */
  mode: "create" | "edit";
  /** Required in "edit" mode — the journal id to load & update. */
  journalId?: string;
}

export default function JournalForm({ mode, journalId }: JournalFormProps) {
  const isEdit = mode === "edit";
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const editorRef = useRef<RichTextEditorRef>(null);
  const contentInitializedRef = useRef(false);
  // Once the admin edits the slug by hand, stop auto-generating it from the title.
  const slugTouchedRef = useRef(false);
  const editorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const [formData, setFormData] = useState<FormState>(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [slugLocked, setSlugLocked] = useState(isEdit);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved",
  );
  const [hasDraft, setHasDraft] = useState(false);
  const [contentStats, setContentStats] = useState({
    words: 0,
    chars: 0,
    readingTime: "1 min read",
  });
  const [contentVersion, setContentVersion] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  const markDirty = useCallback(() => {
    if (isEdit) setIsDirty(true);
  }, [isEdit]);

  // Generic field updater: keeps handlers short and always marks dirty.
  const setField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      markDirty();
    },
    [markDirty],
  );

  // The editor is loaded dynamically, so its ref may not exist yet when we
  // want to push content into it. Retry for a few seconds until it is ready.
  const setEditorContentWhenReady = useCallback((content: string) => {
    if (editorTimerRef.current) clearTimeout(editorTimerRef.current);
    let tries = 0;
    const tick = () => {
      if (editorRef.current) {
        editorRef.current.setContent(content);
        return;
      }
      if (tries++ < 50) editorTimerRef.current = setTimeout(tick, 100);
    };
    tick();
  }, []);

  useEffect(
    () => () => {
      if (editorTimerRef.current) clearTimeout(editorTimerRef.current);
    },
    [],
  );

  // Load draft from localStorage on mount (create mode only)
  useEffect(() => {
    if (isEdit) return;
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      // Spread over EMPTY_FORM so drafts saved before new fields existed
      // still have safe defaults.
      setFormData({ ...EMPTY_FORM, ...parsed });
      setHasDraft(true);
      if (parsed.slug) slugTouchedRef.current = true;
      if (parsed.coverImage && typeof parsed.coverImage === "string") {
        setImagePreview(parsed.coverImage);
      }
      if (parsed.content) {
        setEditorContentWhenReady(parsed.content);
        setContentStats({
          words: countWords(parsed.content),
          chars: parsed.content.length,
          readingTime: estimateReadingTime(parsed.content),
        });
      }
    } catch {}
  }, [isEdit, setEditorContentWhenReady]);

  // Auto-save draft to localStorage (create mode only). Also reacts to editor
  // changes via contentVersion so the body is saved too.
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isEdit) return;
    setSaveStatus("saving");
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      try {
        const toSave = {
          ...formData,
          content: editorRef.current?.getCurrentContent() ?? formData.content,
          // File objects can't be serialised
          coverImage:
            typeof formData.coverImage === "string" ? formData.coverImage : "",
        };
        // Don't persist an empty form
        if (toSave.title || toSave.content) {
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(toSave));
          setHasDraft(true);
        }
        setSaveStatus("saved");
      } catch {
        setSaveStatus("unsaved");
      }
    }, 1500);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [formData, contentVersion, isEdit]);

  // Hydrate the form + editor from the fetched journal (edit mode only)
  useEffect(() => {
    if (!isEdit || !journal || contentInitializedRef.current) return;
    const content = journal.content || "";
    setFormData({
      title: journal.title || "",
      slug: journal.slug || "",
      category: journal.category || "Investment",
      targetSector: journal.targetSector || "",
      targetCity: journal.targetCity || "",
      excerpt: (journal.excerpt || "").slice(0, EXCERPT_MAX),
      metaTitle: (journal.metaTitle || "").slice(0, META_TITLE_MAX),
      metaDescription: (journal.metaDescription || "").slice(
        0,
        META_DESCRIPTION_MAX,
      ),
      keywords: journal.keywords || [],
      tags: journal.tags || [],
      content,
      coverImage: journal.coverImage || "",
      altText: journal.altText || "",
      status: journal.status || "published",
      isFeatured: Boolean(journal.isFeatured),
      author: journal.author
        ? {
            name: journal.author.name || "",
            role: journal.author.role,
            avatar: journal.author.avatar,
          }
        : { name: "" },
      series: journal.series || "",
      articleNumber:
        journal.articleNumber !== undefined && journal.articleNumber !== null
          ? String(journal.articleNumber)
          : "",
      canonicalUrl: journal.canonicalUrl || "",
      noIndex: Boolean(journal.noIndex),
      relatedSlugs: journal.relatedSlugs || [],
      publishedAt: toLocalInput(journal.publishedAt),
      lastReviewedAt: toLocalInput(journal.lastReviewedAt),
    });
    setImagePreview(journal.coverImage || null);
    if (content) setEditorContentWhenReady(content);
    contentInitializedRef.current = true;

    setContentStats({
      words: countWords(content),
      chars: content.length,
      readingTime: estimateReadingTime(content),
    });
  }, [journal, isEdit, setEditorContentWhenReady]);

  // Editor onChange: refresh stats + bump version (drives draft auto-save)
  const handleEditorChange = useCallback(() => {
    const content = editorRef.current?.getCurrentContent() || "";
    setContentStats({
      words: countWords(content),
      chars: content.length,
      readingTime: estimateReadingTime(content),
    });
    setContentVersion((v) => v + 1);
    if (isEdit) setIsDirty(true);
  }, [isEdit]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    setHasDraft(false);
  };

  const discardDraft = () => {
    if (!window.confirm("Discard the saved draft and start over?")) return;
    clearDraft();
    slugTouchedRef.current = false;
    setFormData(EMPTY_FORM);
    setImagePreview(null);
    setRemoveCover(false);
    setEditorContentWhenReady("");
    setContentStats({ words: 0, chars: 0, readingTime: "1 min read" });
    toast.success("Draft discarded");
  };

  // Warn before leaving the edit page with unsaved changes
  useEffect(() => {
    if (!isEdit || !isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isEdit, isDirty]);

  // Ctrl/Cmd + S saves
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ----------------------------- cover image ---------------------------- */

  const applyImageFile = (file: File) => {
    setFormData((prev) => ({ ...prev, coverImage: file }));
    setRemoveCover(false);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    markDirty();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large", { description: "Max size is 5 MB." });
      return;
    }
    applyImageFile(file);
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large", { description: "Max size is 5 MB." });
      return;
    }
    applyImageFile(file);
  };

  const clearCover = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, coverImage: "" }));
    setRemoveCover(true);
    markDirty();
  };

  /* -------------------------------- submit ------------------------------- */

  // Builds a payload that matches JournalInput exactly. Empty optional values
  // are left undefined so buildJournalFormData skips them instead of sending
  // empty strings the backend would try to validate.
  const buildPayload = (editorContent: string): JournalInput => {
    const articleNumber = formData.articleNumber.trim()
      ? Number(formData.articleNumber)
      : undefined;
    const authorName = formData.author.name.trim();

    return {
      title: formData.title.trim(),
      slug: slugify(formData.slug) || undefined,
      category: formData.category,
      tags: formData.tags,
      excerpt: formData.excerpt.slice(0, EXCERPT_MAX),
      content: editorContent,
      coverImage: formData.coverImage || undefined,
      altText: formData.altText,
      author: authorName
        ? {
            name: authorName,
            role: formData.author.role,
            avatar: formData.author.avatar,
          }
        : undefined,
      targetCity: formData.targetCity,
      targetSector: formData.targetSector,
      series: formData.series.trim(),
      articleNumber,
      metaTitle: formData.metaTitle.slice(0, META_TITLE_MAX),
      metaDescription: (formData.metaDescription || formData.excerpt).slice(
        0,
        META_DESCRIPTION_MAX,
      ),
      keywords: formData.keywords,
      canonicalUrl: formData.canonicalUrl.trim(),
      noIndex: formData.noIndex,
      relatedSlugs: formData.relatedSlugs,
      status: formData.status,
      isFeatured: formData.isFeatured,
      publishedAt: toIso(formData.publishedAt),
      lastReviewedAt: toIso(formData.lastReviewedAt),
      ...(removeCover ? { removeCover: true } : {}),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const editorContent = editorRef.current?.getCurrentContent() || "";

    if (!formData.title.trim() || !editorContent.trim()) {
      toast.error("Missing required fields", {
        description: "Title and content are required.",
      });
      return;
    }

    if (formData.articleNumber.trim()) {
      const n = Number(formData.articleNumber);
      if (!Number.isInteger(n) || n < 0) {
        toast.error("Invalid article number", {
          description: "Use a whole number, e.g. 1, 2, 3.",
        });
        return;
      }
    }

    if (
      formData.canonicalUrl.trim() &&
      !isValidUrl(formData.canonicalUrl.trim())
    ) {
      toast.error("Invalid canonical URL", {
        description: "It must start with http:// or https://",
      });
      return;
    }

    const payload = buildPayload(editorContent);

    if (isEdit) {
      try {
        await updateJournal({
          id: journalId as string,
          update: payload,
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

    setSaveStatus("saving");
    try {
      await createJournal(payload).unwrap();
      clearDraft();
      toast.success(
        formData.status === "published"
          ? "Journal published successfully! 🚀"
          : "Journal saved successfully!",
      );
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
      // Create mode: slug follows the title until edited by hand.
      // Edit mode: never touch the existing slug (SEO).
      slug: !isEdit && !slugTouchedRef.current ? slugify(newTitle) : prev.slug,
    }));
    markDirty();
  };

  const togglePreview = () => {
    if (!showPreview) {
      setPreviewContent(editorRef.current?.getCurrentContent() || "");
    }
    setShowPreview((s) => !s);
  };

  // Keep a legacy/unknown category selectable instead of silently changing it
  const categoryOptions = useMemo(() => {
    const known = CATEGORIES.some((c) => c.value === formData.category);
    return known || !formData.category
      ? CATEGORIES
      : [{ value: formData.category, label: formData.category }, ...CATEGORIES];
  }, [formData.category]);

  /* ------------------------- loading / error states ---------------------- */

  if (isEdit && fetching)
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

  if (isEdit && isError)
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

  const serpTitle = formData.metaTitle || formData.title || "Journal Title";
  const serpDescription =
    formData.metaDescription ||
    formData.excerpt ||
    "A comprehensive guide about real estate in Tricity...";

  const saveLabel = isEdit
    ? loading
      ? "Saving Changes..."
      : "Save Journal"
    : loading
      ? formData.status === "published"
        ? "Publishing..."
        : "Saving..."
      : formData.status === "published"
        ? "Publish Journal"
        : "Save Journal";

  /* --------------------------------- render ------------------------------ */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="py-3 px-6 flex items-center justify-between gap-4">
          <Link
            href="/journals"
            className="flex items-center gap-2 text-slate-600 hover:text-[#4161df] transition-colors font-medium group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span className="hidden sm:inline">Back to Journals</span>
          </Link>

          <div className="flex items-center gap-4 min-w-0">
            <div className="hidden sm:flex items-center gap-1.5 text-xs shrink-0">
              {isEdit ? (
                isDirty ? (
                  <>
                    <AlertCircle size={12} className="text-amber-500" />
                    <span className="text-amber-600 font-medium">
                      Unsaved changes
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span className="text-emerald-600 font-medium">Saved</span>
                  </>
                )
              ) : (
                <>
                  {saveStatus === "saving" && (
                    <>
                      <Loader2
                        size={12}
                        className="animate-spin text-amber-500"
                      />
                      <span className="text-amber-600 font-medium">
                        Saving draft...
                      </span>
                    </>
                  )}
                  {saveStatus === "saved" && (
                    <>
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      <span className="text-emerald-600 font-medium">
                        Draft saved
                      </span>
                    </>
                  )}
                  {saveStatus === "unsaved" && (
                    <>
                      <AlertCircle size={12} className="text-red-500" />
                      <span className="text-red-600 font-medium">
                        Couldn&apos;t save draft
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
            <h1 className="text-lg font-bold text-slate-900 hidden md:block truncate max-w-[280px]">
              {isEdit ? `Edit: ${journal?.title ?? ""}` : "New Journal"}
            </h1>
          </div>
        </div>
      </div>

      <div className="py-6 px-4 md:px-6">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start"
        >
          {/* ============================ MAIN COLUMN ============================ */}
          <div className="space-y-6 min-w-0">
            {/* Title + slug */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
                    placeholder={
                      isEdit
                        ? "Journal title"
                        : "e.g. Best Residential Societies in Sector 82, Mohali"
                    }
                    className="w-full text-xl md:text-2xl font-bold text-slate-900 pl-0 pr-16 py-2 border-0 border-b-2 border-transparent focus:border-[#4161df] focus:ring-0 outline-none bg-transparent placeholder:text-slate-300 transition-all"
                    value={formData.title}
                    onChange={handleTitleChange}
                    maxLength={TITLE_MAX}
                  />
                  <div className="absolute right-0 bottom-2 text-xs text-slate-400">
                    {formData.title.length}/{TITLE_MAX}
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 bg-slate-50/50 flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                  <Link2 size={14} />
                  <span className="text-xs font-medium">Slug</span>
                </div>
                <div className="relative flex-1 min-w-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                    /journal/
                  </span>
                  <input
                    type="text"
                    placeholder="auto-generated-from-title"
                    readOnly={isEdit && slugLocked}
                    className="w-full pl-[4.5rem] pr-3 py-1.5 text-sm font-mono bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#4161df]/20 outline-none transition-all read-only:bg-slate-100 read-only:text-slate-500"
                    value={formData.slug}
                    onChange={(e) => {
                      slugTouchedRef.current = true;
                      setField("slug", e.target.value);
                    }}
                    onBlur={() => {
                      const clean = slugify(formData.slug);
                      if (clean !== formData.slug) setField("slug", clean);
                    }}
                  />
                </div>
                {isEdit && (
                  <button
                    type="button"
                    onClick={() => setSlugLocked(!slugLocked)}
                    className={`p-1.5 rounded-lg transition-all ${
                      slugLocked
                        ? "bg-amber-50 text-amber-600 border border-amber-200"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    }`}
                    title={
                      slugLocked
                        ? "Unlock slug (changing it changes the live URL)"
                        : "Lock slug"
                    }
                  >
                    {slugLocked ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>
                )}
              </div>
              {isEdit && !slugLocked && (
                <p className="px-6 pb-3 bg-slate-50/50 text-[11px] text-amber-600">
                  Changing the slug changes the live URL of this article. The
                  old slug is saved in its history.
                </p>
              )}
            </section>

            {/* Content editor */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <BookOpen size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Content
                  </span>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    ({contentStats.words} words · {contentStats.readingTime})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={togglePreview}
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

              {/* Editor stays mounted (hidden) so content is never lost */}
              <div className={showPreview ? "hidden" : "block"}>
                <RichTextEditor
                  ref={editorRef}
                  content={formData.content}
                  isMarkdown={true}
                  onChange={handleEditorChange}
                />
              </div>

              {showPreview && (
                <div className="p-6 max-h-[640px] overflow-y-auto">
                  {previewContent.trim() ? (
                    <article className="prose prose-slate max-w-none">
                      <h2>{formData.title || "Untitled"}</h2>
                      <p className="text-sm text-slate-500">
                        {contentStats.readingTime} · {contentStats.words} words
                      </p>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {previewContent}
                      </ReactMarkdown>
                    </article>
                  ) : (
                    <div className="text-center py-16 text-slate-400">
                      <FileText size={48} className="mx-auto mb-3 opacity-50" />
                      <p>Nothing to preview yet</p>
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
            </section>

            {/* SEO */}
            <Card icon={<Search size={16} />} title="SEO & Metadata">
              <div className="space-y-4">
                <Field
                  label="Meta Title"
                  counter={`${formData.metaTitle.length}/${META_TITLE_MAX}`}
                  hint="Leave empty to use the article title."
                >
                  <input
                    type="text"
                    placeholder="e.g. Best Investment Guide for Mohali"
                    className={inputCls}
                    value={formData.metaTitle}
                    onChange={(e) => setField("metaTitle", e.target.value)}
                    maxLength={META_TITLE_MAX}
                  />
                </Field>

                <Field
                  label="Meta Description"
                  counter={`${formData.metaDescription.length}/${META_DESCRIPTION_MAX}`}
                  hint="Shown in Google results. Leave empty to use the excerpt."
                >
                  <textarea
                    rows={2}
                    placeholder="Short summary for search engines..."
                    className={`${inputCls} resize-none`}
                    value={formData.metaDescription}
                    onChange={(e) =>
                      setField("metaDescription", e.target.value)
                    }
                    maxLength={META_DESCRIPTION_MAX}
                  />
                </Field>

                <Field
                  label="Excerpt"
                  counter={`${formData.excerpt.length}/${EXCERPT_MAX}`}
                  hint="Shown on journal cards and listings."
                >
                  <textarea
                    rows={3}
                    placeholder="Briefly describe what this guide is about..."
                    className={`${inputCls} resize-none`}
                    value={formData.excerpt}
                    onChange={(e) => setField("excerpt", e.target.value)}
                    maxLength={EXCERPT_MAX}
                  />
                </Field>

                <Field
                  label="Canonical URL"
                  hint="Only set if this article duplicates content hosted elsewhere."
                >
                  <input
                    type="url"
                    placeholder="https://www.propertybulbul.com/journal/..."
                    className={inputCls}
                    value={formData.canonicalUrl}
                    onChange={(e) => setField("canonicalUrl", e.target.value)}
                  />
                </Field>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2.5">
                  <span className="text-sm text-slate-700">
                    Hide from search engines (noindex)
                  </span>
                  <Switch
                    checked={formData.noIndex}
                    onCheckedChange={(v) => setField("noIndex", Boolean(v))}
                    aria-label="Toggle noindex"
                  />
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200">
                  <div className="flex items-center gap-1.5 mb-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <Sparkles size={12} />
                    Search Result Preview
                  </div>
                  <div className="text-sm text-blue-700 font-medium truncate">
                    {serpTitle} | PropertyBulbul Journal
                  </div>
                  <div className="text-xs text-emerald-700 truncate mt-0.5">
                    {formData.canonicalUrl.trim() ||
                      `https://www.propertybulbul.com/journal/${
                        formData.slug || "slug"
                      }`}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {serpDescription}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* ============================== SIDEBAR ============================== */}
          <aside className="space-y-6 xl:sticky xl:top-20 min-w-0">
            {/* Publish */}
            <Card icon={<CheckCircle2 size={16} />} title="Publish">
              <div className="space-y-4">
                <Field label="Status">
                  <select
                    className={`${inputCls} cursor-pointer`}
                    value={formData.status}
                    onChange={(e) =>
                      setField("status", e.target.value as JournalStatus)
                    }
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </Field>

                <Field
                  label="Published At"
                  hint="Leave empty to use the time of publishing."
                >
                  <input
                    type="datetime-local"
                    className={inputCls}
                    value={formData.publishedAt}
                    onChange={(e) => setField("publishedAt", e.target.value)}
                  />
                </Field>

                <Field
                  label="Last Reviewed At"
                  hint="Shown as the 'last reviewed' date on the article."
                >
                  <input
                    type="datetime-local"
                    className={inputCls}
                    value={formData.lastReviewedAt}
                    onChange={(e) => setField("lastReviewedAt", e.target.value)}
                  />
                </Field>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2.5">
                  <span className="flex items-center gap-2 text-sm text-slate-700">
                    <Star
                      size={14}
                      className={
                        formData.isFeatured
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }
                    />
                    Featured
                  </span>
                  <Switch
                    checked={formData.isFeatured}
                    onCheckedChange={(v) => setField("isFeatured", Boolean(v))}
                    aria-label="Toggle featured"
                  />
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#4161df] to-[#3551c0] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-[#3551c0] hover:to-[#2a42a0] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#4161df]/20"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Save size={20} />
                  )}
                  {saveLabel}
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  Tip: press Ctrl/Cmd + S to save
                  {isEdit && journalId && (
                    <>
                      {" · "}
                      <span className="font-mono uppercase">
                        ID {journalId.substring(0, 8)}
                      </span>
                    </>
                  )}
                </p>

                {!isEdit && hasDraft && (
                  <button
                    type="button"
                    onClick={discardDraft}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={12} />
                    Discard saved draft
                  </button>
                )}
              </div>
            </Card>

            {/* Cover image */}
            <Card icon={<ImageIcon size={16} />} title="Cover Image">
              <div className="space-y-3">
                {imagePreview && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                    <img
                      src={imagePreview}
                      alt={formData.altText || "Cover preview"}
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={clearCover}
                      aria-label="Remove cover image"
                      className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="coverImage"
                  onChange={handleImageChange}
                />
                <label
                  htmlFor="coverImage"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleImageDrop}
                  className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-dashed border-slate-300 hover:border-[#4161df] hover:bg-[#4161df]/5 cursor-pointer transition-all text-xs text-slate-600"
                >
                  <ImageIcon size={16} />
                  <span className="truncate">
                    {formData.coverImage instanceof File
                      ? formData.coverImage.name
                      : "Click or drop an image (max 5 MB)"}
                  </span>
                </label>

                <input
                  type="text"
                  placeholder="Or paste an image URL"
                  className={`${inputCls} text-xs`}
                  value={
                    typeof formData.coverImage === "string"
                      ? formData.coverImage
                      : ""
                  }
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      coverImage: e.target.value,
                    }));
                    setImagePreview(e.target.value || null);
                    setRemoveCover(false);
                    markDirty();
                  }}
                />

                <Field
                  label="Alt Text"
                  hint="Describe the image for SEO and accessibility."
                >
                  <input
                    type="text"
                    placeholder="e.g. Aerial view of Sector 82 Mohali"
                    className={inputCls}
                    value={formData.altText}
                    onChange={(e) => setField("altText", e.target.value)}
                  />
                </Field>
              </div>
            </Card>

            {/* Details */}
            <Card icon={<FileText size={16} />} title="Details">
              <div className="space-y-4">
                <Field label="Category">
                  <select
                    className={`${inputCls} cursor-pointer`}
                    value={formData.category}
                    onChange={(e) => setField("category", e.target.value)}
                  >
                    {categoryOptions.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Target Sector">
                  <input
                    type="text"
                    placeholder="e.g. Mohali Sector 115"
                    className={inputCls}
                    value={formData.targetSector}
                    onChange={(e) => setField("targetSector", e.target.value)}
                  />
                </Field>

                <Field label="Target City">
                  <input
                    type="text"
                    placeholder="e.g. Mohali"
                    className={inputCls}
                    value={formData.targetCity}
                    onChange={(e) => setField("targetCity", e.target.value)}
                  />
                </Field>

                <Field label="Author">
                  <input
                    type="text"
                    placeholder="e.g. PropertyBulbul Editorial"
                    className={inputCls}
                    value={formData.author.name}
                    onChange={(e) =>
                      setField("author", {
                        ...formData.author,
                        name: e.target.value,
                      })
                    }
                  />
                </Field>
              </div>
            </Card>

            {/* Series & related */}
            <Card icon={<Layers size={16} />} title="Series & Related">
              <div className="space-y-4">
                <Field
                  label="Series"
                  hint="Group articles that belong together."
                >
                  <input
                    type="text"
                    placeholder="e.g. Mohali Sector Guides"
                    className={inputCls}
                    value={formData.series}
                    onChange={(e) => setField("series", e.target.value)}
                  />
                </Field>

                <Field
                  label="Article Number"
                  hint="Position within the series."
                >
                  <input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="e.g. 3"
                    className={inputCls}
                    value={formData.articleNumber}
                    onChange={(e) => setField("articleNumber", e.target.value)}
                  />
                </Field>

                <Field
                  label="Related Articles"
                  hint="Slugs of related journals, press Enter to add."
                >
                  <ChipInput
                    values={formData.relatedSlugs}
                    prefix="/"
                    placeholder="related-article-slug"
                    onAdd={(items) =>
                      setField("relatedSlugs", [
                        ...new Set([
                          ...formData.relatedSlugs,
                          ...items.map(slugify).filter(Boolean),
                        ]),
                      ])
                    }
                    onRemove={(i) =>
                      setField(
                        "relatedSlugs",
                        formData.relatedSlugs.filter((_, idx) => idx !== i),
                      )
                    }
                  />
                </Field>
              </div>
            </Card>

            {/* Keywords */}
            <Card icon={<Hash size={16} />} title="Keywords">
              <ChipInput
                values={formData.keywords}
                placeholder="Type keyword, press Enter"
                onAdd={(items) =>
                  setField("keywords", [
                    ...new Set([...formData.keywords, ...items]),
                  ])
                }
                onRemove={(i) =>
                  setField(
                    "keywords",
                    formData.keywords.filter((_, idx) => idx !== i),
                  )
                }
              />
            </Card>

            {/* Tags */}
            <Card icon={<Tag size={16} />} title="Tags">
              <ChipInput
                values={formData.tags}
                placeholder="Type tag, press Enter"
                onAdd={(items) =>
                  setField("tags", [
                    ...new Set([
                      ...formData.tags,
                      ...items.map((t) => t.toLowerCase()),
                    ]),
                  ])
                }
                onRemove={(i) =>
                  setField(
                    "tags",
                    formData.tags.filter((_, idx) => idx !== i),
                  )
                }
              />
            </Card>
          </aside>
        </form>
      </div>
    </div>
  );
}
