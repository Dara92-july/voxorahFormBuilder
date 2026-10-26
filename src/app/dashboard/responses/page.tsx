
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  ArrowUpRight,
  FileText,
  MessageSquare,
} from "lucide-react";

type ResponseRecord = {
  id: string;
  form_id: string;
  answers: unknown;
  submitted_at: string;
};

export default async function ResponsesPage() {
  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    redirect("/login");
  }

  const userId = authData.claims.sub;

  if (typeof userId !== "string") {
    redirect("/login");
  }

  const { data: forms, error: formsError } = await supabase
    .from("forms")
    .select("id, title, status")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (formsError) {
    console.error("Failed to load forms:", formsError.message);
  }

  const userForms = forms ?? [];
  const formIds = userForms.map((form) => form.id);
  const formTitles = new Map(
    userForms.map((form) => [form.id, form.title])
  );

  let responses: ResponseRecord[] = [];
  let responsesError = false;

  if (formIds.length > 0) {
    const result = await supabase
      .from("responses")
      .select("id, form_id, answers, submitted_at")
      .in("form_id", formIds)
      .order("submitted_at", { ascending: false });

    if (result.error) {
      console.error("Failed to load responses:", result.error.message);
      responsesError = true;
    } else {
      responses = (result.data ?? []) as ResponseRecord[];
    }
  }

  return (
    <main className="min-h-screen bg-surface text-ink dark:bg-gray-950 dark:text-gray-100">
      <header className="border-b border-gray-200 bg-white px-5 py-5 dark:border-gray-800 dark:bg-gray-900 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            className="rounded-lg border border-gray-200 p-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={19} />
          </Link>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Workspace / Responses
            </p>
            <h1 className="mt-1 text-2xl font-bold">All responses</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 p-5 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total responses
              </p>
              <MessageSquare className="text-emerald-600" size={21} />
            </div>
            <p className="mt-4 text-3xl font-bold">{responses.length}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your forms
              </p>
              <FileText className="text-emerald-600" size={21} />
            </div>
            <p className="mt-4 text-3xl font-bold">{userForms.length}</p>
          </div>
        </div>

        {formsError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            We couldn't load your forms. Please refresh the page and try again.
          </div>
        ) : responsesError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            Your forms loaded, but we couldn't load their responses. Check your
            Supabase permissions and try again.
          </div>
        ) : responses.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <MessageSquare size={26} />
            </div>

            <h2 className="mt-5 text-xl font-bold">No responses yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
              Once someone completes one of your published conversational
              forms, their submission will appear here.
            </p>

            <Link
              href="/dashboard/forms"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              View my forms
              <ArrowUpRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 p-5 dark:border-gray-800">
              <h2 className="font-bold">Recent submissions</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Responses received across all your forms.
              </p>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {responses.map((response, index) => {
                const answerCount = Array.isArray(response.answers)
                  ? response.answers.length
                  : 0;

                return (
                  <div
                    key={response.id}
                    className="flex flex-wrap items-center justify-between gap-4 p-5"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <MessageSquare size={19} />
                      </span>

                      <div className="min-w-0">
                        <p className="font-semibold">
                          {formTitles.get(response.form_id) ?? "Untitled form"}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Submission {responses.length - index} ·{" "}
                          {answerCount} {answerCount === 1 ? "answer" : "answers"}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(response.submitted_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/forms/${response.form_id}/responses`}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      View form responses
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
