
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Eye,
  Settings2,
  MessageSquare,
  Check,
  LoaderCircle,
  GripVertical,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ExternalLink,
  Copy,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import FormEmbedButton from "@/components/form-embed-button";

type QuestionType = "text" | "email" | "multiple_choice" | "yes_no";

type Question = {
  id: string;
  question_text: string;
  question_type: QuestionType;
  options: string[];
  is_required: boolean;
  position: number;
};

type FormRecord = {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published";
  welcome_message: string;
  primary_color: string;
};

const questionTypes: { label: string; value: QuestionType }[] = [
  { label: "Short text", value: "text" },
  { label: "Email", value: "email" },
  { label: "Multiple choice", value: "multiple_choice" },
  { label: "Yes / No", value: "yes_no" },
];

const colors = [
  "#059669",
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#EA580C",
  "#111827",
];

function createQuestion(position: number): Question {
  return {
    id: crypto.randomUUID(),
    question_text: "",
    question_type: "text",
    options: ["Option 1", "Option 2"],
    is_required: false,
    position,
  };
}

export default function QuestionEditorPage() {
  const params = useParams<{ id: string }>();
  const formId = params.id;

  const [form, setForm] = useState<FormRecord | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState<"builder" | "settings">(
    "builder"
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const [previewIndex, setPreviewIndex] = useState(-1);
  const [previewValue, setPreviewValue] = useState("");
  const [previewAnswers, setPreviewAnswers] = useState<string[]>([]);
  const [previewError, setPreviewError] = useState("");
  const [previewComplete, setPreviewComplete] = useState(false);

  const selectedQuestion =
    questions.find((question) => question.id === selectedId) ?? null;

  const loadEditor = useCallback(async () => {
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

      const { data: formData, error: formError } = await supabase
        .from("forms")
        .select(
          "id, title, description, status, welcome_message, primary_color"
        )
        .eq("id", formId)
        .eq("user_id", user.id)
        .single();

      if (formError || !formData) {
        setError(
          "Could not load this form. Check that it exists and belongs to your account."
        );
        return;
      }

      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .select(
          "id, question_text, question_type, options, is_required, position"
        )
        .eq("form_id", formId)
        .order("position", { ascending: true });

      if (questionError) {
        setError(questionError.message);
        return;
      }

      const loadedQuestions = (questionData ?? []).map((question) => ({
        ...question,
        options: Array.isArray(question.options) ? question.options : [],
      })) as Question[];

      setForm(formData as FormRecord);
      setQuestions(loadedQuestions);
      setSelectedId((current) =>
        loadedQuestions.some((question) => question.id === current)
          ? current
          : loadedQuestions[0]?.id ?? ""
      );
    } catch {
      setError("Something went wrong while loading the editor.");
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    void loadEditor();
  }, [loadEditor]);

  function updateForm(updates: Partial<FormRecord>) {
    setForm((current) =>
      current ? { ...current, ...updates } : current
    );
    setNotice("");
  }

  function updateQuestion(id: string, updates: Partial<Question>) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === id ? { ...question, ...updates } : question
      )
    );
    setNotice("");
  }

  function addQuestion() {
    const question = createQuestion(questions.length);

    setQuestions((current) => [...current, question]);
    setSelectedId(question.id);
    setActiveTab("builder");
    setNotice("");
  }

  function deleteQuestion(id: string) {
    const remaining = questions
      .filter((question) => question.id !== id)
      .map((question, position) => ({ ...question, position }));

    setQuestions(remaining);

    if (selectedId === id) {
      const deletedIndex = questions.findIndex(
        (question) => question.id === id
      );

      setSelectedId(
        remaining[Math.min(deletedIndex, remaining.length - 1)]?.id ?? ""
      );
    }

    setNotice("");
  }

  function moveQuestion(id: string, direction: -1 | 1) {
    const updated = [...questions];
    const index = updated.findIndex((question) => question.id === id);
    const nextIndex = index + direction;

    if (index < 0 || nextIndex < 0 || nextIndex >= updated.length) {
      return;
    }

    [updated[index], updated[nextIndex]] = [
      updated[nextIndex],
      updated[index],
    ];

    setQuestions(
      updated.map((question, position) => ({ ...question, position }))
    );
    setNotice("");
  }

  function reorderQuestion(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;

    const updated = [...questions];
    const sourceIndex = updated.findIndex((q) => q.id === sourceId);
    const targetIndex = updated.findIndex((q) => q.id === targetId);

    if (sourceIndex < 0 || targetIndex < 0) return;

    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, moved);

    setQuestions(
      updated.map((question, position) => ({ ...question, position }))
    );
    setNotice("");
  }

  async function saveEverything(): Promise<boolean> {
    setError("");
    setNotice("");

    if (!form) return false;

    if (!form.title.trim()) {
      setError("Please enter a form title.");
      setActiveTab("settings");
      return false;
    }

    if (questions.some((question) => !question.question_text.trim())) {
      setError("Please enter text for every question before saving.");
      return false;
    }

    if (
      questions.some(
        (question) =>
          question.question_type === "multiple_choice" &&
          question.options.filter((option) => option.trim()).length < 2
      )
    ) {
      setError("Each multiple-choice question needs at least two options.");
      return false;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        window.location.href = "/login";
        return false;
      }

      const { data: ownedForm, error: ownershipError } = await supabase
        .from("forms")
        .select("id")
        .eq("id", formId)
        .eq("user_id", user.id)
        .single();

      if (ownershipError || !ownedForm) {
        setError("You do not have permission to edit this form.");
        return false;
      }

      const { error: formUpdateError } = await supabase
        .from("forms")
        .update({
          title: form.title.trim(),
          description: form.description.trim(),
          welcome_message: form.welcome_message.trim(),
          primary_color: form.primary_color,
          updated_at: new Date().toISOString(),
        })
        .eq("id", formId)
        .eq("user_id", user.id);

      if (formUpdateError) {
        setError(formUpdateError.message);
        return false;
      }

      const { data: existingQuestions, error: existingError } =
        await supabase
          .from("questions")
          .select("id")
          .eq("form_id", formId);

      if (existingError) {
        setError(existingError.message);
        return false;
      }

      const existingIds = new Set(
        (existingQuestions ?? []).map((question) => question.id)
      );

      const questionsToSave = questions.map((question, position) => ({
        id: question.id,
        form_id: formId,
        question_text: question.question_text.trim(),
        question_type: question.question_type,
        options:
          question.question_type === "multiple_choice"
            ? question.options.map((option) => option.trim()).filter(Boolean)
            : [],
        is_required: question.is_required,
        position,
      }));

      if (questionsToSave.length > 0) {
        const { error: upsertError } = await supabase
          .from("questions")
          .upsert(questionsToSave, { onConflict: "id" });

        if (upsertError) {
          setError(upsertError.message);
          return false;
        }
      }

      const retainedIds = new Set(
        questionsToSave.map((question) => question.id)
      );

      const removedIds = [...existingIds].filter(
        (id) => !retainedIds.has(id)
      );

      if (removedIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("questions")
          .delete()
          .eq("form_id", formId)
          .in("id", removedIds);

        if (deleteError) {
          setError(deleteError.message);
          return false;
        }
      }

      setNotice("All changes saved successfully.");
      await loadEditor();

      return true;
    } catch {
      setError("Unable to save your changes. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish() {
    if (!form || publishing || saving) return;

    setError("");
    setNotice("");

    const nextStatus =
      form.status === "published" ? "draft" : "published";

    if (nextStatus === "published") {
      if (questions.length === 0) {
        setError("Add at least one question before publishing.");
        setActiveTab("builder");
        return;
      }

      if (
        questions.some((question) => !question.question_text.trim())
      ) {
        setError("Please enter text for every question before publishing.");
        setActiveTab("builder");
        return;
      }

      if (
        questions.some(
          (question) =>
            question.question_type === "multiple_choice" &&
            question.options.filter((option) => option.trim()).length < 2
        )
      ) {
        setError(
          "Each multiple-choice question needs at least two options before publishing."
        );
        setActiveTab("builder");
        return;
      }
    }

    setPublishing(true);

    try {
      // Save all pending edits before changing the publishing status.
      const saved = await saveEverything();

      if (!saved) return;

      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("Your session has expired. Please log in again.");
        window.location.href = "/login";
        return;
      }

      // Only the owner can publish or unpublish this form.
      const { data: updatedForm, error: publishError } = await supabase
        .from("forms")
        .update({
          status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", formId)
        .eq("user_id", user.id)
        .select("id, status")
        .single();

      if (publishError || !updatedForm) {
        setError(
          publishError?.message ||
            "Could not update the publishing status."
        );
        return;
      }

      setForm((current) =>
        current
          ? {
              ...current,
              status: updatedForm.status as "draft" | "published",
            }
          : current
      );

      setNotice(
        nextStatus === "published"
          ? "Your form is published and ready to share."
          : "Your form has been unpublished."
      );
    } catch {
      setError("Something went wrong while updating publishing status.");
    } finally {
      setPublishing(false);
    }
  }

  async function copyPublicLink() {
    const publicUrl = `${window.location.origin}/f/${formId}`;

    try {
      await navigator.clipboard.writeText(publicUrl);
      setError("");
      setNotice("Public link copied to clipboard.");
    } catch {
      setError(
        "Could not copy the link automatically. Open the form and copy its address from your browser."
      );
    }
  }

  function resetPreview() {
    setPreviewIndex(-1);
    setPreviewValue("");
    setPreviewAnswers([]);
    setPreviewError("");
    setPreviewComplete(false);
  }

  function advancePreview() {
    if (previewIndex === -1) {
      if (questions.length === 0) {
        setPreviewError("Add at least one question to preview this form.");
        return;
      }

      setPreviewIndex(0);
      setPreviewValue("");
      setPreviewError("");
      return;
    }

    const question = questions[previewIndex];

    if (!question) return;

    const answer = previewValue.trim();

    if (question.is_required && !answer) {
      setPreviewError("Please provide an answer to continue.");
      return;
    }

    if (
      answer &&
      question.question_type === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer)
    ) {
      setPreviewError("Enter a valid email address.");
      return;
    }

    const updatedAnswers = [...previewAnswers];
    updatedAnswers[previewIndex] = answer;
    setPreviewAnswers(updatedAnswers);
    setPreviewError("");

    if (previewIndex + 1 >= questions.length) {
      setPreviewComplete(true);
    } else {
      setPreviewIndex(previewIndex + 1);
      setPreviewValue("");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface dark:bg-gray-950">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <LoaderCircle size={20} className="animate-spin" />
          Loading Form Studio...
        </div>
      </main>
    );
  }

  if (!form) {
    return (
      <main className="min-h-screen bg-surface px-5 py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-xl font-bold">Unable to open this form</h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {error || "This form could not be found."}
          </p>
          <Link
            href="/dashboard/forms"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand"
          >
            <ArrowLeft size={16} />
            Back to my forms
          </Link>
        </div>
      </main>
    );
  }

  const currentPreviewQuestion = questions[previewIndex];

  return (
    <main className="min-h-screen bg-surface text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard/forms"
              aria-label="Back to forms"
              className="rounded-lg border border-gray-200 p-2 transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
                Voxorah Studio
              </p>
              <p className="max-w-57.5 truncate text-sm font-semibold">
                {form.title}
              </p>
            </div>

            <span
              className={`hidden rounded-full px-3 py-1 text-xs font-medium sm:inline-flex ${
                form.status === "published"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {form.status === "published" ? "Published" : "Draft"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                resetPreview();
                document.getElementById("live-preview")?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <Eye size={16} />
              <span className="hidden sm:inline">Preview</span>
            </button>

            {form.status === "published" && (
              <>
                <button
                  type="button"
                  onClick={() => void copyPublicLink()}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <Copy size={16} />
                  <span className="hidden sm:inline">Copy link</span>
                </button>

                <Link
                  href={`/f/${formId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <ExternalLink size={16} />
                  <span className="hidden sm:inline">Open form</span>
                </Link>
              </>
            )}
            {form.status === "published" && (
              <FormEmbedButton
                formId={formId}
                published={form.status === "published"}
              />
            )}
            <button
              type="button"
              onClick={() => void togglePublish()}
              disabled={saving || publishing}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                form.status === "published"
                  ? "bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500"
                  : "bg-brand hover:bg-brand-dark"
              }`}
            >
              {publishing ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : form.status === "published" ? (
                <RotateCcw size={16} />
              ) : (
                <ExternalLink size={16} />
              )}
              {publishing
                ? "Updating..."
                : form.status === "published"
                  ? "Unpublish"
                  : "Publish"}
            </button>

            <button
              type="button"
              onClick={() => void saveEverything()}
              disabled={saving || publishing}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : notice ? (
                <Check size={16} />
              ) : (
                <Save size={16} />
              )}
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        {(error || notice) && (
          <div
            role={error ? "alert" : "status"}
            className={`mb-5 flex items-start gap-3 rounded-xl border p-4 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
            }`}
          >
            <div className="flex-1">{error || notice}</div>
            <button
              type="button"
              onClick={() => {
                setError("");
                setNotice("");
              }}
              aria-label="Dismiss message"
              className="font-semibold"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid items-start gap-5 xl:grid-cols-[245px_minmax(320px,1fr)_350px]">
          <aside className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 p-4 dark:border-gray-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Workspace
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("builder")}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    activeTab === "builder"
                      ? "bg-emerald-50 text-brand dark:bg-emerald-950"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  <MessageSquare size={16} />
                  Builder
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("settings")}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    activeTab === "settings"
                      ? "bg-emerald-50 text-brand dark:bg-emerald-950"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  <Settings2 size={16} />
                  Settings
                </button>
              </div>
            </div>

            {activeTab === "builder" ? (
              <div className="p-3">
                <div className="flex items-center justify-between px-1 py-2">
                  <div>
                    <h2 className="text-sm font-semibold">Questions</h2>
                    <p className="mt-1 text-xs text-gray-500">
                      {questions.length} total
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addQuestion}
                    aria-label="Add a question"
                    className="rounded-lg bg-brand p-2 text-white transition hover:bg-brand-dark"
                  >
                    <Plus size={17} />
                  </button>
                </div>

                <div className="mt-2 space-y-2">
                  {questions.map((question, index) => (
                    <button
                      key={question.id}
                      type="button"
                      draggable
                      onDragStart={() => setDraggingId(question.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (draggingId) {
                          reorderQuestion(draggingId, question.id);
                        }
                        setDraggingId(null);
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      onClick={() => {
                        setSelectedId(question.id);
                        setActiveTab("builder");
                      }}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        selectedId === question.id
                          ? "border-emerald-600 bg-emerald-50/70 dark:border-emerald-700 dark:bg-emerald-950/50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                      } ${draggingId === question.id ? "opacity-40" : ""}`}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical
                          size={16}
                          className="mt-0.5 shrink-0 text-gray-400"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                            Question {index + 1}
                          </p>
                          <p className="mt-1 wrap-break-words text-sm font-medium">
                            {question.question_text || "Untitled question"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {
                              questionTypes.find(
                                (type) =>
                                  type.value === question.question_type
                              )?.label
                            }
                            {question.is_required ? " · Required" : ""}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addQuestion}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-600 px-3 py-3 text-sm font-semibold text-brand transition hover:bg-emerald-50 dark:hover:bg-emerald-950"
                >
                  <Plus size={16} />
                  Add question
                </button>

                <p className="mt-3 px-1 text-[11px] leading-5 text-gray-500">
                  Drag a question onto another question to change its order.
                </p>
              </div>
            ) : (
              <div className="space-y-5 p-4">
                <div>
                  <h2 className="text-sm font-semibold">Form details</h2>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Set the information respondents see before answering.
                  </p>
                </div>

                <label className="block text-sm font-medium">
                  Form title
                  <input
                    value={form.title}
                    onChange={(event) =>
                      updateForm({ title: event.target.value })
                    }
                    maxLength={100}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand dark:border-gray-700 dark:bg-gray-950"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Description
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateForm({ description: event.target.value })
                    }
                    rows={3}
                    maxLength={500}
                    className="mt-2 w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand dark:border-gray-700 dark:bg-gray-950"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Welcome message
                  <textarea
                    value={form.welcome_message}
                    onChange={(event) =>
                      updateForm({ welcome_message: event.target.value })
                    }
                    rows={3}
                    maxLength={500}
                    className="mt-2 w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand dark:border-gray-700 dark:bg-gray-950"
                  />
                </label>

                <div>
                  <p className="text-sm font-medium">Brand color</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateForm({ primary_color: color })}
                        aria-label={`Choose ${color}`}
                        aria-pressed={form.primary_color === color}
                        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                          form.primary_color === color
                            ? "border-gray-900 ring-2 ring-gray-300 dark:border-white"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {form.primary_color === color && (
                          <Check size={16} className="text-white" />
                        )}
                      </button>
                    ))}
                  </div>

                  <label className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    Custom color
                    <input
                      type="color"
                      value={form.primary_color}
                      onChange={(event) =>
                        updateForm({ primary_color: event.target.value })
                      }
                      className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent"
                    />
                  </label>
                </div>

                <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Current status
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    {form.status === "published" ? "Published" : "Draft"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    {form.status === "published"
                      ? "Your form is live. Anyone with the public link can respond."
                      : "Your form is still a draft. Publish it when it is ready for responses."}
                  </p>
                </div>
              </div>
            )}
          </aside>

          <section className="min-w-0 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                {activeTab === "builder" ? "Question editor" : "Form settings"}
              </p>
              <h1 className="mt-1 text-xl font-bold tracking-tight">
                {activeTab === "builder"
                  ? selectedQuestion
                    ? "Configure question"
                    : "Build your conversation"
                  : "Customize your form"}
              </h1>
              <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                {activeTab === "builder"
                  ? "Choose a question, edit its content, and configure how respondents answer."
                  : "Your title, introduction, and brand color appear in the chatbot preview."}
              </p>
            </div>

            {activeTab === "settings" ? (
              <div className="space-y-5 p-5 sm:p-6">
                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/60">
                  <p className="text-sm font-semibold">Form title</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {form.title || "Your form title"}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/60">
                  <p className="text-sm font-semibold">Introduction</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-500">
                    {form.description ||
                      "Your form description will appear here."}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/60">
                  <p className="text-sm font-semibold">Welcome message</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-500">
                    {form.welcome_message ||
                      "Your welcome message will appear here."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("builder")}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <MessageSquare size={16} />
                  Return to questions
                </button>
              </div>
            ) : selectedQuestion ? (
              <div className="space-y-6 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-brand dark:bg-emerald-950">
                    Question{" "}
                    {questions.findIndex(
                      (question) => question.id === selectedId
                    ) + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => deleteQuestion(selectedQuestion.id)}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>

                <label className="block text-sm font-semibold">
                  Question text
                  <textarea
                    autoFocus
                    value={selectedQuestion.question_text}
                    onChange={(event) =>
                      updateQuestion(selectedQuestion.id, {
                        question_text: event.target.value,
                      })
                    }
                    rows={3}
                    maxLength={500}
                    placeholder="e.g. What would you like to tell us?"
                    className="mt-2 w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-brand focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-950 dark:focus:ring-emerald-950"
                  />
                  <span className="mt-1 block text-right text-xs font-normal text-gray-400">
                    {selectedQuestion.question_text.length}/500
                  </span>
                </label>

                <label className="block text-sm font-semibold">
                  Answer type
                  <select
                    value={selectedQuestion.question_type}
                    onChange={(event) =>
                      updateQuestion(selectedQuestion.id, {
                        question_type: event.target.value as QuestionType,
                        options:
                          event.target.value === "multiple_choice"
                            ? selectedQuestion.options.length >= 2
                              ? selectedQuestion.options
                              : ["Option 1", "Option 2"]
                            : selectedQuestion.options,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand dark:border-gray-700 dark:bg-gray-950"
                  >
                    {questionTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedQuestion.question_type === "multiple_choice" && (
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold">
                          Answer options
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          Add the choices respondents can select.
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {selectedQuestion.options.length} options
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      {selectedQuestion.options.map((option, index) => (
                        <div
                          key={`${selectedQuestion.id}-${index}`}
                          className="flex items-center gap-2"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 text-xs text-gray-500 dark:border-gray-700">
                            {String.fromCharCode(65 + (index % 26))}
                          </span>

                          <input
                            value={option}
                            onChange={(event) => {
                              const options = [...selectedQuestion.options];
                              options[index] = event.target.value;
                              updateQuestion(selectedQuestion.id, {
                                options,
                              });
                            }}
                            maxLength={200}
                            placeholder={`Option ${index + 1}`}
                            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand dark:border-gray-700 dark:bg-gray-950"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              updateQuestion(selectedQuestion.id, {
                                options: selectedQuestion.options.filter(
                                  (_, i) => i !== index
                                ),
                              })
                            }
                            disabled={selectedQuestion.options.length <= 2}
                            aria-label={`Remove option ${index + 1}`}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-950"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuestion(selectedQuestion.id, {
                          options: [
                            ...selectedQuestion.options,
                            `Option ${selectedQuestion.options.length + 1}`,
                          ],
                        })
                      }
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"
                    >
                      <Plus size={16} />
                      Add option
                    </button>
                  </div>
                )}

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedQuestion.is_required}
                      onChange={(event) =>
                        updateQuestion(selectedQuestion.id, {
                          is_required: event.target.checked,
                        })
                      }
                      className="mt-0.5 h-4 w-4 accent-emerald-600"
                    />
                    <span>
                      <span className="block text-sm font-semibold">
                        Required question
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-gray-500">
                        Respondents must answer this question before
                        continuing.
                      </span>
                    </span>
                  </label>
                </div>

                <div className="border-t border-gray-100 pt-5 dark:border-gray-800">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Reorder question
                  </p>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => moveQuestion(selectedQuestion.id, -1)}
                      disabled={
                        questions.findIndex(
                          (question) => question.id === selectedId
                        ) === 0
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      <ChevronUp size={16} />
                      Move up
                    </button>

                    <button
                      type="button"
                      onClick={() => moveQuestion(selectedQuestion.id, 1)}
                      disabled={
                        questions.findIndex(
                          (question) => question.id === selectedId
                        ) ===
                        questions.length - 1
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      <ChevronDown size={16} />
                      Move down
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center sm:p-12">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-brand dark:bg-emerald-950">
                  <Plus size={23} />
                </div>
                <h2 className="mt-4 text-lg font-semibold">
                  Start your conversation
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                  Add your first question, then choose how respondents should
                  answer it.
                </p>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  <Plus size={16} />
                  Add first question
                </button>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-3 dark:border-gray-800 dark:bg-gray-800/30 sm:px-6">
              <span className="text-xs text-gray-500">
                Changes are saved when you click Save changes.
              </span>
              <button
                type="button"
                onClick={() => void saveEverything()}
                disabled={saving || publishing}
                className="shrink-0 text-sm font-semibold text-brand hover:text-brand-dark disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save now"}
              </button>
            </div>
          </section>

          <aside
            id="live-preview"
            className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 xl:sticky xl:top-22.5"
          >
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 dark:border-gray-800">
              <div>
                <h2 className="text-sm font-semibold">Live preview</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Try the conversation
                </p>
              </div>
              <button
                type="button"
                onClick={resetPreview}
                aria-label="Reset preview"
                className="rounded-lg border border-gray-200 p-2 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <RotateCcw size={15} />
              </button>
            </div>

            <div className="p-4">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#F8FAF9] dark:border-gray-700 dark:bg-gray-950">
                <div
                  className="px-4 py-4 text-white"
                  style={{ backgroundColor: form.primary_color }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 bg-white/15">
                      <MessageSquare size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {form.title || "Your form"}
                      </p>
                      <p className="mt-0.5 text-xs text-white/80">
                        Interactive form
                      </p>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-green-300" />
                  </div>
                </div>

                <div className="flex min-h-85 flex-col p-3 sm:p-4">
                  {previewIndex === -1 && !previewComplete ? (
                    <>
                      <div className="flex items-start gap-2">
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white"
                          style={{ backgroundColor: form.primary_color }}
                        >
                          <MessageSquare size={14} />
                        </div>
                        <div className="max-w-[90%] rounded-xl rounded-tl-sm border border-gray-200 bg-white p-3 text-sm leading-6 dark:border-gray-800 dark:bg-gray-900">
                          {form.welcome_message ||
                            "Welcome! Let's get started."}
                        </div>
                      </div>

                      {form.description && (
                        <p className="ml-9 mt-2 text-xs leading-5 text-gray-500">
                          {form.description}
                        </p>
                      )}

                      <div className="mt-auto pt-6">
                        <button
                          type="button"
                          onClick={advancePreview}
                          className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                          style={{ backgroundColor: form.primary_color }}
                        >
                          Start conversation
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </>
                  ) : previewComplete ? (
                    <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full text-white"
                        style={{ backgroundColor: form.primary_color }}
                      >
                        <Check size={24} />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold">
                        Thank you!
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        You've completed this preview.
                      </p>
                      <p className="mt-4 text-xs text-gray-400">
                        Preview answers are not submitted or saved.
                      </p>
                      <button
                        type="button"
                        onClick={resetPreview}
                        className="mt-5 text-sm font-semibold text-brand"
                      >
                        Try again
                      </button>
                    </div>
                  ) : currentPreviewQuestion ? (
                    <>
                      <div className="flex items-start gap-2">
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white"
                          style={{ backgroundColor: form.primary_color }}
                        >
                          <MessageSquare size={14} />
                        </div>
                        <div className="max-w-[90%] rounded-xl rounded-tl-sm border border-gray-200 bg-white p-3 text-sm leading-6 dark:border-gray-800 dark:bg-gray-900">
                          {currentPreviewQuestion.question_text ||
                            "Enter your question in the editor."}
                          {currentPreviewQuestion.is_required && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        {currentPreviewQuestion.question_type ===
                        "multiple_choice" ? (
                          <div className="space-y-2">
                            {currentPreviewQuestion.options
                              .filter((option) => option.trim())
                              .map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => setPreviewValue(option)}
                                  className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                                    previewValue === option
                                      ? "border-2 bg-white dark:bg-gray-900"
                                      : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900"
                                  }`}
                                  style={
                                    previewValue === option
                                      ? {
                                          borderColor: form.primary_color,
                                          color: form.primary_color,
                                        }
                                      : undefined
                                  }
                                >
                                  {option}
                                </button>
                              ))}
                          </div>
                        ) : currentPreviewQuestion.question_type ===
                          "yes_no" ? (
                          <div className="grid grid-cols-2 gap-2">
                            {["Yes", "No"].map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => setPreviewValue(option)}
                                className={`rounded-lg border px-3 py-3 text-sm font-medium transition ${
                                  previewValue === option
                                    ? "border-2 bg-white dark:bg-gray-900"
                                    : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                                }`}
                                style={
                                  previewValue === option
                                    ? {
                                        borderColor: form.primary_color,
                                        color: form.primary_color,
                                      }
                                    : undefined
                                }
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <input
                            type={
                              currentPreviewQuestion.question_type === "email"
                                ? "email"
                                : "text"
                            }
                            value={previewValue}
                            onChange={(event) =>
                              setPreviewValue(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") advancePreview();
                            }}
                            placeholder={
                              currentPreviewQuestion.question_type === "email"
                                ? "name@example.com"
                                : "Type your answer..."
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:ring-2 dark:border-gray-800 dark:bg-gray-900"
                            style={
                              {
                                "--tw-ring-color": `${form.primary_color}40`,
                              } as React.CSSProperties
                            }
                          />
                        )}

                        {previewError && (
                          <p role="alert" className="mt-2 text-xs text-red-600">
                            {previewError}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={advancePreview}
                          className="mt-3 w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                          style={{ backgroundColor: form.primary_color }}
                        >
                          {previewIndex === questions.length - 1
                            ? "Finish"
                            : "Continue"}
                        </button>

                        <p className="mt-3 text-center text-xs text-gray-400">
                          Question {previewIndex + 1} of {questions.length}
                        </p>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              <p className="mt-3 text-center text-xs leading-5 text-gray-500">
                Preview changes as you edit. Test answers stay in this preview
                and are not stored.
              </p>
            </div>
          </aside>
        </div>

        <footer className="mt-6 flex flex-col justify-between gap-2 border-t border-gray-200 py-5 text-xs text-gray-500 dark:border-gray-800 sm:flex-row sm:items-center">
          <p>Voxorah Studio · Turn questions into conversations.</p>
          <p>
            {questions.length}{" "}
            {questions.length === 1 ? "question" : "questions"} ·{" "}
            {form.status === "published" ? "Published form" : "Draft form"}
          </p>
        </footer>
      </div>
    </main>
  );
}
