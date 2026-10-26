
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function NewFormPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Let us get started."
  );
  const [primaryColor, setPrimaryColor] = useState("#059669");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const { data, error: insertError } = await supabase
        .from("forms")
        .insert({
          user_id: user.id,
          title,
          description,
          welcome_message: welcomeMessage,
          primary_color: primaryColor,
        })
        .select("id")
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }

      router.push("/dashboard/forms");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface px-5 py-10 dark:bg-gray-950 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand dark:text-gray-400"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold text-brand">
            FORM BUILDER
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Create a new form
          </h1>

          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Set up your form details and conversational welcome message.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
        >
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium"
            >
              Form title
            </label>

            <input
              id="title"
              type="text"
              required
              maxLength={100}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Customer feedback"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-950"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="description"
              rows={3}
              maxLength={500}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this form for?"
              className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-950"
            />
          </div>

          <div>
            <label
              htmlFor="welcomeMessage"
              className="mb-2 block text-sm font-medium"
            >
              Chatbot welcome message
            </label>

            <textarea
              id="welcomeMessage"
              rows={3}
              required
              maxLength={500}
              value={welcomeMessage}
              onChange={(event) => setWelcomeMessage(event.target.value)}
              className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-950"
            />
          </div>

          <div>
            <label
              htmlFor="primaryColor"
              className="mb-2 block text-sm font-medium"
            >
              Chatbot primary color
            </label>

            <div className="flex items-center gap-4">
              <input
                id="primaryColor"
                type="color"
                value={primaryColor}
                onChange={(event) => setPrimaryColor(event.target.value)}
                className="h-12 w-16 cursor-pointer rounded-lg border border-gray-300 bg-white p-1 dark:border-gray-700 dark:bg-gray-950"
              />

              <span className="text-sm text-gray-600 dark:text-gray-400">
                {primaryColor.toUpperCase()}
              </span>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 dark:border-gray-800 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard"
              className="rounded-lg border border-gray-300 px-5 py-3 text-center text-sm font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />
              {loading ? "Saving form..." : "Save form"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
