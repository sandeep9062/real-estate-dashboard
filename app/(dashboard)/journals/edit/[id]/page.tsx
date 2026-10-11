"use client";

import { useParams } from "next/navigation";
import JournalForm from "@/components/JournalForm";

/**
 * Admin: standalone "Edit Journal" page.
 * Delegates to the shared JournalForm component (mode="edit"), passing the
 * journal id from the route so the same form handles both create & update.
 */
export default function EditJournalPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  return <JournalForm mode="edit" journalId={id} />;
}
