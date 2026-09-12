"use client";
import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  useGetJournalsQuery,
  useDeleteJournalMutation,
  useUpdateJournalMutation,
} from "@/services/journalApi";

export default function JournalsDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 100;

  const { data, isLoading, isError } = useGetJournalsQuery({ page, limit });
  const journals = data?.journals ?? [];
  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;
  const [deleteJournal] = useDeleteJournalMutation();
  const [updateJournal] = useUpdateJournalMutation();

  const handleToggleField = async (
    journal: (typeof journals)[number],
    field: "isActive" | "isFeatured",
  ) => {
    const newValue = !journal[field];
    const label =
      field === "isActive"
        ? newValue
          ? "activated"
          : "deactivated"
        : newValue
          ? "featured"
          : "unfeatured";
    try {
      await updateJournal({
        id: journal._id,
        update: { [field]: newValue },
      }).unwrap();
      toast.success(`Journal ${label} successfully`);
    } catch (error) {
      toast.error(`Failed to update journal`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this journal?")) {
      try {
        await deleteJournal(id).unwrap();
        toast.success("Journal deleted successfully");
      } catch (error) {
        toast.error("Failed to delete journal");
      }
    }
  };

  const filteredJournals = useMemo(
    () =>
      journals.filter(
        (j) =>
          j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          j.targetSector.toLowerCase().includes(searchTerm.toLowerCase()) ||
          j.category.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [journals, searchTerm],
  );

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  return (
    <div className="space-y-8 p-4 md:p-6 animate-fade-in">
      {/* Header Section */}
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

      {/* Filter & Search Section */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <input
            type="text"
            placeholder="Search by title or sector..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4161df]/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Journals Table/List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex justify-center items-center">
            <Loader2 className="animate-spin text-[#4161df]" size={40} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    Journal
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    Sector/Category
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...filteredJournals]
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map((journal) => (
                    <tr
                      key={journal._id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <a
                            href={`https://propertybulbul.com/journal/${journal.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative size-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0"
                            title="View Live"
                          >
                            <Image
                              src={journal.coverImage}
                              alt={journal.title}
                              fill
                              className="object-cover"
                            />
                          </a>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate max-w-[200px] md:max-w-xs">
                              {journal.title}
                            </p>
                            <p className="text-xs text-slate-500 truncate italic">
                              /{journal.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                        {journal.views ?? 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 w-fit">
                            {journal.category}
                          </span>
                          <span className="text-xs text-slate-600 font-medium">
                            {journal.targetSector}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(journal.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/journals/edit/${journal._id}`}
                            className="p-2 text-slate-400 hover:text-amber-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </Link>
                          <Switch
                            checked={journal.isActive}
                            onCheckedChange={() =>
                              handleToggleField(journal, "isActive")
                            }
                            title={journal.isActive ? "Deactivate" : "Activate"}
                            aria-label={
                              journal.isActive
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
                              checked={journal.isFeatured}
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
                if (Math.abs(p - page) <= 1) return true;
                return false;
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
      {!isLoading && filteredJournals.length === 0 && (
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
