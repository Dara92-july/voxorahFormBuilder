
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  Clock3,
  FileText,
  Inbox,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type SavedAnswer = {
  question_id?: string;
  question_text?: string;
  answer?: string | string[] | boolean | null;
};

type FormData = {
  id: string;
  title: string;
  status: "draft" | "published";
};

type ResponseData = {
  id: string;
  form_id: string;
  answers: SavedAnswer[];
  submitted_at: string;
};

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatAnswer(answer: SavedAnswer["answer"]) {
  if (answer === null || answer === undefined || answer === "") {
    return "No answer provided";
  }

  if (Array.isArray(answer)) {
    return answer.join(", ");
  }

  if (typeof answer === "boolean") {
    return answer ? "Yes" : "No";
  }

  return String(answer);
}

export default function ResponsesPage() {
  const params = useParams<{ id: string }>();
  const formId = params.id;
  const supabase = createClient();

  const [form, setForm] = useState<FormData | null>(null);
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [selectedResponse, setSelectedResponse] =
    useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadResponses() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setError("Please log in to view your responses.");
          return;
        }

        const { data: formData, error: formError } = await supabase
          .from("forms")
          .select("id, title, status")
          .eq("id", formId)
          .eq("user_id", user.id)
          .single();

        if (formError || !formData) {
          setError("We couldn't find this form or you don't have access to it.");
          return;
        }

        setForm(formData as FormData);

        const { data: responseData, error: responseError } =
          await supabase
            .from("responses")
            .select("id, form_id, answers, submitted_at")
            .eq("form_id", formId)
            .order("submitted_at", { ascending: false });

        if (responseError) {
          throw responseError;
        }

        const formattedResponses = (responseData ?? []).map((item) => ({
          ...item,
          answers: (item.answers ?? []) as unknown as SavedAnswer[],
        }));

        setResponses(formattedResponses as ResponseData[]);
      } catch (err) {
        console.error("Failed to load responses:", err);
        setError("Something went wrong while loading responses. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadResponses();
  }, [formId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-(--background) p-6">
        <div className="mx-auto max-w-6xl animate-pulse space-y-5">
          <div className="h-8 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-32 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-56 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </main>
    );
  }

  if (error || !form) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--background) p-6">
        <div className="max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <Inbox className="mx-auto mb-4 h-10 w-10 text-zinc-400" />
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Unable to load responses
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {error || "This form could not be found."}
          </p>
          <Link
            href="/dashboard/forms"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            <ArrowLeft size={16} />
            Back to My Forms
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-var(--background) px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/dashboard/forms/${formId}/edit`}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-emerald-600 dark:text-zinc-400"
        >
          <ArrowLeft size={16} />
          Back to Form Studio
        </Link>

        <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
              <ClipboardList size={17} />
              Form responses
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {form.title}
            </h1>

            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Review and manage the answers people have submitted.
            </p>
          </div>

          <Link
            href={`/dashboard/forms/${formId}/edit`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <FileText size={16} />
            Edit form
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Total responses
              </p>
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <ClipboardList size={20} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold text-zinc-900 dark:text-white">
              {responses.length}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Submissions received for this form
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Form status
              </p>
              <div className="rounded-xl bg-zinc-100 p-2.5 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <FileText size={20} />
              </div>
            </div>

            <p className="mt-4 text-2xl font-bold capitalize text-zinc-900 dark:text-white">
              {form.status}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {form.status === "published"
                ? "Your form is available for submissions"
                : "Publish your form to collect new responses"}
            </p>
          </div>
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 px-5 py-5 dark:border-zinc-800 sm:px-6">
            <h2 className="font-semibold text-zinc-900 dark:text-white">
              All submissions
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Select a submission to view its complete answers.
            </p>
          </div>

          {responses.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                <Inbox size={26} />
              </div>

              <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">
                No responses yet
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
                When someone completes your chatbot form, their submission will appear here.
              </p>
              {form.status === "published" && (
                <Link
                  href={`/f/${formId}`}
                  target="_blank"
                  className="mt-5 inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  Open published form
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {responses.map((response, index) => (
                <button
                  key={response.id}
                  type="button"
                  onClick={() => setSelectedResponse(response)}
                  className="flex w-full flex-col gap-3 px-5 py-5 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                      {String(responses.length - index).padStart(2, "0")}
                    </div>

                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900 dark:text-white">
                        Submission {responses.length - index}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {response.answers.length}{" "}
                        {response.answers.length === 1 ? "answer" : "answers"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <Clock3 size={15} />
                    {formatDate(response.submitted_at)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedResponse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedResponse(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="response-detail-title"
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-zinc-200 bg-white px-5 py-5 dark:border-zinc-800 dark:bg-zinc-900 sm:px-6">
              <div>
                <h2
                  id="response-detail-title"
                  className="text-xl font-bold text-zinc-900 dark:text-white"
                >
                  Submission details
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Submitted {formatDate(selectedResponse.submitted_at)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedResponse(null)}
                aria-label="Close submission details"
                className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              {selectedResponse.answers.map((answer, index) => (
                <div
                  key={answer.question_id || index}
                  className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Question {index + 1}
                  </p>
                  <h3 className="mt-1 font-semibold text-zinc-900 dark:text-white">
                    {answer.question_text || "Untitled question"}
                  </h3>
                  <p className="mt-3 whitespace-pre-wrap wrap-break-words text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                    {formatAnswer(answer.answer)}
                  </p>
                </div>
              ))}

              {selectedResponse.answers.length === 0 && (
                <p className="py-8 text-center text-sm text-zinc-500">
                  This submission contains no answers.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
