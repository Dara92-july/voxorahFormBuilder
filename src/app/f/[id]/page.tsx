
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check, LoaderCircle, MessageSquare, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Question = {
  id: string;
  question_text: string;
  question_type: "text" | "email" | "multiple_choice" | "yes_no";
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

export default function PublicChatbotPage() {
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<FormRecord | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const loadForm = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { data: formData, error: formError } = await supabase
        .from("forms")
        .select(
          "id, title, description, status, welcome_message, primary_color"
        )
        .eq("id", id)
        .single();

      if (formError || !formData) {
        setError("This form is unavailable or has not been published.");
        return;
      }

      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .select(
          "id, question_text, question_type, options, is_required, position"
        )
        .eq("form_id", id)
        .order("position", { ascending: true });

      if (questionError) {
        setError("We couldn't load the questions. Please try again later.");
        return;
      }

      setForm(formData as FormRecord);
      setQuestions(
        (questionData ?? []).map((question) => ({
          ...question,
          options: Array.isArray(question.options) ? question.options : [],
        })) as Question[]
      );
    } catch {
      setError("Something went wrong while loading this conversation.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadForm();
  }, [loadForm]);

  async function continueConversation() {
    if (!form || submitting) return;

    if (!started) {
      if (questions.length === 0) {
        setError("This form has no questions yet.");
        return;
      }

      setStarted(true);
      setError("");
      return;
    }

    const question = questions[currentIndex];
    if (!question) return;

    const value = answer.trim();

    if (question.is_required && !value) {
      setError("Please answer this question before continuing.");
      return;
    }

    if (
      value &&
      question.question_type === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    const updatedAnswers = { ...answers, [question.id]: value };
    setAnswers(updatedAnswers);
    setError("");

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((current) => current + 1);
      setAnswer("");
      return;
    }

    if (form.status === "draft") {
      setCompleted(true);
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();

      const submission = questions.map((item) => ({
        question_id: item.id,
        question_text: item.question_text,
        answer: updatedAnswers[item.id] ?? "",
      }));

      const { error: submitError } = await supabase
        .from("responses")
        .insert({
          form_id: form.id,
          answers: submission,
        });

      if (submitError) {
        setError("We couldn't submit your answers. Please try again.");
        return;
      }

      setCompleted(true);
    } catch {
      setError("A connection error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface px-5 dark:bg-gray-950">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <LoaderCircle className="animate-spin" size={20} />
          Loading conversation...
        </div>
      </main>
    );
  }

  if (!form) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface px-5 dark:bg-gray-950">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7 text-center dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
            <MessageSquare size={22} />
          </div>
          <h1 className="mt-4 text-xl font-bold">Conversation unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">{error}</p>
          <p className="mt-5 text-xs text-gray-400">
            If you created this form, sign in and check its publishing status.
          </p>
        </div>
      </main>
    );
  }

  const question = questions[currentIndex];
  const progress = started
    ? ((currentIndex + (completed ? 1 : 0)) / questions.length) * 100
    : 0;

  return (
    <main className="flex min-h-screen flex-col bg-surface text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-4">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: form.primary_color }}
          >
            <MessageSquare size={19} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-bold">{form.title}</h1>
            <p className="mt-0.5 text-xs text-gray-500">
              Powered by Voxorah
            </p>
          </div>
          {form.status === "draft" && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Preview
            </span>
          )}
        </div>
        {started && !completed && (
          <div className="h-1 bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: form.primary_color,
              }}
            />
          </div>
        )}
      </header>

      <section className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          {!started && !completed && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-9 dark:border-gray-800 dark:bg-gray-900">
              <p
                className="text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: form.primary_color }}
              >
                Let's get started
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                {form.title}
              </h2>
              {form.description && (
                <p className="mt-3 text-sm leading-7 text-gray-500 dark:text-gray-400">
                  {form.description}
                </p>
              )}

              <div className="mt-7 flex items-start gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: form.primary_color }}
                >
                  <MessageSquare size={17} />
                </div>
                <div className="rounded-xl rounded-tl-sm bg-gray-100 px-4 py-3 text-sm leading-6 dark:bg-gray-800">
                  {form.welcome_message || "Welcome! Let's get started."}
                </div>
              </div>

              <button
                type="button"
                onClick={() => void continueConversation()}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: form.primary_color }}
              >
                Start conversation
                <Send size={16} />
              </button>
            </div>
          )}

          {started && !completed && question && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-9 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-xs text-gray-500">
                  {question.is_required ? "Required" : "Optional"}
                </span>
              </div>

              <h2 className="mt-5 text-xl font-bold leading-8 sm:text-2xl">
                {question.question_text}
                {question.is_required && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </h2>

              <div className="mt-6">
                {question.question_type === "multiple_choice" && (
                  <div className="space-y-3">
                    {question.options
                      .filter((option) => option.trim())
                      .map((option) => (
                        <button
                          type="button"
                          key={option}
                          onClick={() => setAnswer(option)}
                          className="flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition"
                          style={
                            answer === option
                              ? {
                                  borderColor: form.primary_color,
                                  backgroundColor: `${form.primary_color}12`,
                                }
                              : undefined
                          }
                        >
                          <span
                            className="flex h-5 w-5 items-center justify-center rounded-full border"
                            style={{
                              borderColor:
                                answer === option
                                  ? form.primary_color
                                  : "#D1D5DB",
                            }}
                          >
                            {answer === option && (
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                  backgroundColor: form.primary_color,
                                }}
                              />
                            )}
                          </span>
                          {option}
                        </button>
                      ))}
                  </div>
                )}

                {question.question_type === "yes_no" && (
                  <div className="grid grid-cols-2 gap-3">
                    {["Yes", "No"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setAnswer(option)}
                        className="rounded-xl border px-4 py-4 text-sm font-semibold transition"
                        style={
                          answer === option
                            ? {
                                borderColor: form.primary_color,
                                color: form.primary_color,
                                backgroundColor: `${form.primary_color}12`,
                              }
                            : undefined
                        }
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {(question.question_type === "text" ||
                  question.question_type === "email") && (
                  <input
                    type={
                      question.question_type === "email" ? "email" : "text"
                    }
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !submitting) {
                        void continueConversation();
                      }
                    }}
                    placeholder={
                      question.question_type === "email"
                        ? "name@example.com"
                        : "Type your answer..."
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-950"
                    style={{
                      outlineColor: form.primary_color,
                    }}
                  />
                )}
              </div>

              {error && (
                <p role="alert" className="mt-4 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={() => void continueConversation()}
                disabled={submitting}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: form.primary_color }}
              >
                {submitting ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {submitting
                  ? "Submitting..."
                  : currentIndex === questions.length - 1
                    ? form.status === "draft"
                      ? "Finish preview"
                      : "Submit answers"
                    : "Continue"}
              </button>

              {form.status === "draft" && (
                <p className="mt-4 text-center text-xs text-gray-500">
                  Preview mode: answers will not be saved.
                </p>
              )}
            </div>
          )}

          {completed && (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-10 dark:border-gray-800 dark:bg-gray-900">
              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: form.primary_color }}
              >
                <Check size={27} />
              </div>
              <h2 className="mt-5 text-2xl font-bold">
                {form.status === "draft" ? "Preview complete" : "Thank you!"}
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500 dark:text-gray-400">
                {form.status === "draft"
                  ? "You've tested the conversation. Answers from draft previews are not saved."
                  : "Your answers have been submitted successfully."}
              </p>
            </div>
          )}
        </div>
      </section>

      <footer className="py-5 text-center text-xs text-gray-500">
        Built with Voxorah · Turn questions into conversations.
      </footer>
    </main>
  );
}
