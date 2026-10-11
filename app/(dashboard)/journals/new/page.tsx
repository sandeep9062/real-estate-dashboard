"use client";

import JournalForm from "@/components/JournalForm";

/**
 * Admin: standalone "New Journal" page.
 * Delegates to the shared JournalForm component (mode="create").
 */
export default function NewJournalPage() {
  return <JournalForm mode="create" />;
}
