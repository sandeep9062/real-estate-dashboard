"use client";
import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  FileText,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import {
  useGetJournalsQuery,
  useDeleteJournalMutation,
} from "@/services/journalApi";

export default function JournalsDashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: journals = [], isLoading, isError } = useGetJournalsQuery({});
  const [deleteJournal] = useDeleteJournalMutation();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this journal?")) {
      try {
        await deleteJournal(id).unwrap();
        toast({ title: "Journal deleted successfully" });
      } catch (error) {
        toast({ variant: "destructive", title: "Failed to delete journal" });
      }
    }
  };

  const filteredJournals = journals.filter(
    (j) =>
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.targetSector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
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
                {filteredJournals.map((journal) => (
                  <tr
                    key={journal._id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative size-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                          <Image
                            src={journal.coverImage}
                            alt={journal.title}
                            fill
                            className="object-cover"
                          />
                        </div>
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
                          href={`/journals/${journal.slug}`}
                          className="p-2 text-slate-400 hover:text-[#4161df] transition-colors"
                          title="View Live"
                        >
                          <ExternalLink size={18} />
                        </Link>
                        <Link
                          href={`/journals/edit/${journal._id}`}
                          className="p-2 text-slate-400 hover:text-amber-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </Link>
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
