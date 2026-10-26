
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  ClipboardList,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type FormRecord = {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published";
  created_at: string;
};

export default function MyFormsPage() {
  const [forms, setForms] = useState<FormRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadForms = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        window.location.href = "/login";
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("forms")
        .select("id, title, description, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setForms((data ?? []) as FormRecord[]);
    } catch {
      setError("Unable to load your forms. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadForms();
  }, [loadForms]);

  async function handleDelete(form: FormRecord) {
    const confirmed = window.confirm(
      `Delete "${form.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(form.id);
    setError("");

    try {
      const supabase = createClient();

      const { error: deleteError } = await supabase
        .from("forms")
        .delete()
        .eq("id", form.id);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }

      setForms((currentForms) =>
        currentForms.filter((item) => item.id !== form.id)
      );
    } catch {
      setError("Unable to delete this form. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-surface px-5 py-10 dark:bg-gray-950 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-brand dark:text-gray-400"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand">
              YOUR WORKSPACE
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              My forms
            </h1>

            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Create and manage your conversational forms.
            </p>
          </div>

          <Link
            href="/dashboard/forms/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            <Plus size={18} />
            Create new form
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {loading
              ? "Loading your forms..."
              : `${forms.length} ${forms.length === 1 ? "form" : "forms"}`}
          </p>

          <button
            type="button"
            onClick={() => void loadForms()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            {error}
            <button
              type="button"
              onClick={() => void loadForms()}
              className="ml-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-gray-500">
              Loading your forms...
            </p>
          </div>
        ) : forms.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-brand dark:bg-emerald-950">
              <FileText size={27} />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              No forms yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600 dark:text-gray-400">
              Your forms will appear here once you create them.
              Start with your first conversational form.
            </p>

            <Link
              href="/dashboard/forms/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              <Plus size={18} />
              Create your first form
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {forms.map((form) => (
              <article
                key={form.id}
                className="flex min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-emerald-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-emerald-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-brand dark:bg-emerald-950">
                    <FileText size={21} />
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      form.status === "published"
                        ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {form.status === "published"
                      ? "Published"
                      : "Draft"}
                  </span>
                </div>

                <h2 className="mt-5 wrap-break-words text-lg font-semibold">
                  {form.title}
                </h2>

                <p className="mt-2 min-h-12 wrap-break-words text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {form.description || "No description added."}
                </p>

                <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
                  Created{" "}
                  {new Date(form.created_at).toLocaleDateString(
                    "en-GB",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </p>

                
        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
          <Link
            href={`/dashboard/forms/${form.id}/edit`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-3 py-2.5 text-sm font-semibold transition hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            Edit form
            <ExternalLink size={15} />
          </Link>

          <Link
            href={`/dashboard/forms/${form.id}/responses`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900"
          >
            <ClipboardList size={16} />
            Responses
          </Link>

          <button
            type="button"
            onClick={() => void handleDelete(form)}
            disabled={deletingId === form.id}
            className="col-span-2 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            <Trash2 size={16} />
            {deletingId === form.id ? "Deleting..." : "Delete form"}
          </button>
        </div>

              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
