"use client";
import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  useGetJournalsQuery,
  useDeleteJournalMutation,
  useUpdateJournalMutation,
  type Journal,
} from "@/services/journalApi";

export default function JournalsDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 100;

  const { data, isLoading, isError, refetch } = useGetJournalsQuery({
    page,
    limit,
  });
  const journals: Journal[] = data?.journals ?? [];
  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;
  const [deleteJournal] = useDeleteJournalMutation();
  const [updateJournal] = useUpdateJournalMutation();

  const handleToggleField = async (
    journal: Journal,
    field: "status" | "isFeatured",
  ) => {
    let update: { status?: "published" | "draft"; isFeatured?: boolean };
    let label: string;

    if (field === "status") {
      const next = journal.status === "published" ? "draft" : "published";
      update = { status: next };
      label = next === "published" ? "activated" : "deactivated";
    } else {
      const next = !journal.isFeatured;
      update = { isFeatured: next };
      label = next ? "featured" : "unfeatured";
    }

    try {
      await updateJournal({ id: journal._id, update }).unwrap();
      toast.success(`Journal ${label} successfully`);
    } catch (error: any) {
      toast.error("Failed to update journal", {
        description: error?.data?.message,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this journal?"))
      return;
    try {
      await deleteJournal(id).unwrap();
      toast.success("Journal deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete journal", {
        description: error?.data?.message,
      });
    }
  };

  const filteredJournals = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const list = q
      ? journals.filter(
          (j) =>
            (j.title ?? "").toLowerCase().includes(q) ||
            (j.targetSector ?? "").toLowerCase().includes(q) ||
            (j.category ?? "").toLowerCase().includes(q),
        )
      : journals;
    return [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [journals, searchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  return (
    <div className="space-y-8 p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Journal Management
          </h1>
          <p className="text-slate-500">
            Create and manage investment guides for PropertyBulbul
          </p>
        </div>
        <Link
          href="/journals/new"
          className="flex items-center justify-center gap-2 bg-[#4161df] text-white px-4 py-2 rounded-lg hover:bg-[#3551c0] transition-colors shadow-sm font-medium"
        >
          <Plus size={18} />
          Add New Journal
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <input
            type="text"
            placeholder="Search by title, sector or category..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4161df]/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center justify-between">
          <span>Failed to load journals.</span>
          <button
            onClick={() => refetch()}
            className="font-medium underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex justify-center items-center">
            <Loader2 className="animate-spin text-[#4161df]" size={40} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="w-[38%] px-4 py-3 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    Journal
                  </th>
                  <th className="w-[10%] px-4 py-3 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    Views
                  </th>
                  <th className="w-[18%] px-4 py-3 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    Sector/Category
                  </th>
                  <th className="w-[14%] px-4 py-3 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    Date
                  </th>
                  <th className="w-[20%] px-4 py-3 text-xs font-semibold uppercase text-slate-500 tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJournals.map((journal) => (
                  <tr
                    key={journal._id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-4 py-3 overflow-hidden">
                      <div className="flex items-center gap-3">
                        <a
                          href={`https://propertybulbul.com/journal/${journal.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative size-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 flex items-center justify-center"
                          title="View Live"
                        >
                          {journal.coverImage ? (
                            // plain <img>: avoids next/image crashing on an
                            // empty src or an unconfigured remote domain
                            <img
                              src={journal.coverImage}
                              alt={journal.altText || journal.title}
                              className="object-cover w-full h-full"
                              loading="lazy"
                            />
                          ) : (
                            <FileText size={18} className="text-slate-400" />
                          )}
                        </a>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {journal.title}
                          </p>
                          <p className="text-xs text-slate-500 truncate italic">
                            /{journal.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 font-medium whitespace-nowrap">
                      {journal.views ?? 0}
                    </td>
                    <td className="px-4 py-3 overflow-hidden">
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 w-fit max-w-full truncate">
                          {journal.category || "—"}
                        </span>
                        <span className="text-xs text-slate-600 font-medium truncate">
                          {journal.targetSector || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                      {new Date(journal.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/journals/edit/${journal._id}`}
                          className="p-2 text-slate-400 hover:text-amber-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <Switch
                          checked={journal.status === "published"}
                          onCheckedChange={() =>
                            handleToggleField(journal, "status")
                          }
                          title={
                            journal.status === "published"
                              ? "Deactivate"
                              : "Activate"
                          }
                          aria-label={
                            journal.status === "published"
                              ? "Deactivate journal"
                              : "Activate journal"
                          }
                        />
                        <span
                          className="flex items-center gap-1"
                          title={journal.isFeatured ? "Unfeature" : "Feature"}
                        >
                          <Star
                            size={14}
                            className={
                              journal.isFeatured
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }
                          />
                          <Switch
                            checked={Boolean(journal.isFeatured)}
                            onCheckedChange={() =>
                              handleToggleField(journal, "isFeatured")
                            }
                            aria-label={
                              journal.isFeatured
                                ? "Unfeature journal"
                                : "Feature journal"
                            }
                          />
                        </span>
                        <button
                          onClick={() => handleDelete(journal._id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <p className="text-sm text-slate-500">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of{" "}
            {total} journals
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (totalPages <= 7) return true;
                if (p === 1 || p === totalPages) return true;
                return Math.abs(p - page) <= 1;
              })
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && p - arr[idx - 1] > 1 && (
                    <span className="px-2 py-2 text-sm text-slate-400">
                      ...
                    </span>
                  )}
                  <button
                    onClick={() => handlePageChange(p)}
                    className={`inline-flex items-center justify-center size-9 text-sm font-medium rounded-lg border transition-colors ${
                      p === page
                        ? "bg-[#4161df] text-white border-[#4161df]"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredJournals.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <FileText className="mx-auto size-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">
            No journals found
          </h3>
          <p className="text-slate-500 mb-6">
            Start by creating your first real estate guide.
          </p>
          <Link
            href="/journals/new"
            className="bg-[#4161df] text-white px-6 py-2 rounded-lg hover:bg-[#3551c0]"
          >
            Create Journal
          </Link>
        </div>
      )}
    </div>
  );
}
