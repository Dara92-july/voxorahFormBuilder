
"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Check, LoaderCircle, MessageSquare, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

export default function EmbeddedWidgetPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const [form, setForm] = useState<FormRecord | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(-1);
  const [value, setValue] = useState("");
  const [answers, setAnswers] = useState<
    { question_text: string; answer: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);

  const requestedColor = searchParams.get("color");
  const color = /^#[0-9a-fA-F]{6}$/.test(requestedColor || "")
    ? requestedColor!
    : form?.primary_color || "#059669";

  useEffect(() => {
    let cancelled = false;

    async function loadWidget() {
      setLoading(true);
      setError("");

      try {
        const supabase = createClient();

        const { data: formData, error: formError } = await supabase
          .from("forms")
          .select(
            "id, title, description, status, welcome_message, primary_color"
          )
          .eq("id", params.id)
          .eq("status", "published")
          .single();

        if (formError || !formData) {
          throw new Error("This chatbot is unavailable or unpublished.");
        }

        const { data: questionData, error: questionError } = await supabase
          .from("questions")
          .select(
            "id, question_text, question_type, options, is_required, position"
          )
          .eq("form_id", params.id)
          .order("position", { ascending: true });

        if (questionError) throw questionError;

        if (cancelled) return;

        setForm(formData as FormRecord);
        setQuestions(
          (questionData ?? []).map((question) => ({
            ...question,
            options: Array.isArray(question.options)
              ? question.options
              : [],
          })) as Question[]
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load this chatbot."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadWidget();

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const currentQuestion = questions[index];

  async function continueConversation() {
    if (submitting || complete) return;

    setError("");

    if (index === -1) {
      if (questions.length === 0) {
        setError("This form does not have any questions yet.");
        return;
      }

      setIndex(0);
      return;
    }

    if (!currentQuestion) return;

    const answer = value.trim();

    if (currentQuestion.is_required && !answer) {
      setError("Please answer this question to continue.");
      return;
    }

    if (
      answer &&
      currentQuestion.question_type === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer)
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    const updatedAnswers = [
      ...answers,
      {
        question_text: currentQuestion.question_text,
        answer,
      },
    ];

    setAnswers(updatedAnswers);
    setValue("");

    if (index + 1 < questions.length) {
      setIndex(index + 1);
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();

      const { error: responseError } = await supabase
        .from("responses")
        .insert({
          form_id: params.id,
          answers: updatedAnswers,
        });

      if (responseError) throw responseError;

      setComplete(true);
    } catch {
      setError(
        "Your answers could not be submitted. Please try again."
      );
      // Keep the answers so the visitor does not lose their progress.
    } finally {
      setSubmitting(false);
    }
  }

  function closeWidget() {
    window.parent.postMessage(
      { type: "voxorah:close" },
      window.location.origin
    );
  }

  if (loading) {
    return (
      <main className="flex h-dvh items-center justify-center bg-white text-gray-600">
        <LoaderCircle size={22} className="animate-spin" />
        <span className="ml-2 text-sm">Loading chat...</span>
      </main>
    );
  }

  if (!form || error && !currentQuestion && index === -1) {
    return (
      <main className="flex h-dvh flex-col items-center justify-center bg-white px-6 text-center text-gray-700">
        <MessageSquare size={28} className="text-gray-400" />
        <p className="mt-3 text-sm font-semibold">
          Chat unavailable
        </p>
        <p className="mt-2 text-sm text-gray-500">
          {error || "This form is not available right now."}
        </p>
      </main>
    );
  }

  return (
    <main className="flex h-dvh flex-col bg-[#F8FAF9] text-gray-900">
      <header
        className="flex shrink-0 items-center gap-3 px-4 py-4 text-white"
        style={{ backgroundColor: color }}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
          <MessageSquare size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold">
            {form.title}
          </h1>
          <p className="mt-0.5 text-xs text-white/80">
            Interactive form
          </p>
        </div>

        <button
          type="button"
          onClick={closeWidget}
          aria-label="Close chat"
          className="rounded-lg px-2 py-1 text-xl leading-none hover:bg-white/15"
        >
          ×
        </button>
      </header>

      <section
        aria-live="polite"
        className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4"
      >
        {complete ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: color }}
            >
              <Check size={24} />
            </div>

            <h2 className="mt-4 text-lg font-semibold">
              Thank you!
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Your answers have been submitted successfully.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: color }}
              >
                <MessageSquare size={14} />
              </div>

              <div className="max-w-[90%] whitespace-pre-wrap rounded-xl rounded-tl-sm border border-gray-200 bg-white p-3 text-sm leading-6">
                {index === -1
                  ? form.welcome_message || "Welcome! Let's get started."
                  : currentQuestion?.question_text}
                {index >= 0 && currentQuestion?.is_required && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </div>
            </div>

            {index === -1 && form.description && (
              <p className="ml-9 mt-2 text-xs leading-5 text-gray-500">
                {form.description}
              </p>
            )}

            {index >= 0 && currentQuestion && (
              <div className="mt-4">
                {currentQuestion.question_type === "multiple_choice" ? (
                  <div className="space-y-2">
                    {currentQuestion.options
                      .filter((option) => option.trim())
                      .map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setValue(option)}
                          className="w-full rounded-lg border bg-white px-3 py-2.5 text-left text-sm transition"
                          style={
                            value === option
                              ? { borderColor: color, color }
                              : { borderColor: "#e5e7eb" }
                          }
                        >
                          {option}
                        </button>
                      ))}
                  </div>
                ) : currentQuestion.question_type === "yes_no" ? (
                  <div className="grid grid-cols-2 gap-2">
                    {["Yes", "No"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setValue(option)}
                        className="rounded-lg border bg-white px-3 py-3 text-sm font-medium"
                        style={
                          value === option
                            ? { borderColor: color, color }
                            : { borderColor: "#e5e7eb" }
                        }
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type={
                      currentQuestion.question_type === "email"
                        ? "email"
                        : "text"
                    }
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void continueConversation();
                      }
                    }}
                    placeholder={
                      currentQuestion.question_type === "email"
                        ? "name@example.com"
                        : "Type your answer..."
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:ring-2"
                    style={
                      {
                        "--tw-ring-color": `${color}40`,
                      } as React.CSSProperties
                    }
                  />
                )}

                <p className="mt-3 text-center text-xs text-gray-400">
                  Question {index + 1} of {questions.length}
                </p>
              </div>
            )}
          </>
        )}

        {error && !complete && (
          <p role="alert" className="mt-3 text-xs text-red-600">
            {error}
          </p>
        )}
      </section>

      {!complete && (
        <footer className="shrink-0 border-t border-gray-200 bg-white p-4">
          <button
            type="button"
            onClick={() => void continueConversation()}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: color }}
          >
            {submitting ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : index === -1 ? (
              <MessageSquare size={16} />
            ) : index === questions.length - 1 ? (
              <Send size={16} />
            ) : (
              <Send size={16} />
            )}

            {submitting
              ? "Submitting..."
              : index === -1
                ? "Start conversation"
                : index === questions.length - 1
                  ? "Submit answers"
                  : "Continue"}
          </button>

          <p className="mt-3 text-center text-[10px] text-gray-400">
            Powered by Voxorah
          </p>
        </footer>
      )}
    </main>
  );
}
