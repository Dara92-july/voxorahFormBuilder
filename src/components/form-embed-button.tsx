
"use client";

import { useState } from "react";
import { Code2, Copy, Check, X } from "lucide-react";

type Props = {
  formId: string;
  published: boolean;
};

export default function FormEmbedButton({ formId, published }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // Generate the script URL from the current Voxorah domain.
  const [origin] = useState(() =>
    typeof window !== "undefined" ? window.location.origin : ""
  );

  const snippet = origin
    ? `<script src="${origin}/voxorah-widget.js" data-form-id="${formId}" defer></script>`
    : "";

  async function copySnippet() {
    if (!published) return;

    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setError("");
    } catch {
      setCopied(false);
      setError("Copy failed. Select the code above and copy it manually.");
    }
  }

  function closeModal() {
    setOpen(false);
    setCopied(false);
    setError("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-semibold transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
      >
        <Code2 size={16} />
        <span className="hidden sm:inline">Embed widget</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="embed-title"
            className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-900 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="embed-title" className="text-lg font-bold">
                  Embed your chatbot
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Add your published Voxorah form to your website as a
                  floating chat widget.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close embed instructions"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            {!published && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
                Publish this form before installing the widget. Website
                visitors can only use published forms.
              </div>
            )}

            <label
              htmlFor="voxorah-embed-code"
              className="mt-5 block text-sm font-semibold"
            >
              Embed code
            </label>

            <textarea
              id="voxorah-embed-code"
              readOnly
              value={snippet}
              onFocus={(event) => event.currentTarget.select()}
              rows={3}
              className="mt-2 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-3 font-mono text-xs leading-6 outline-none dark:border-gray-700 dark:bg-gray-950"
            />

            <button
              type="button"
              onClick={() => void copySnippet()}
              disabled={!published || !snippet}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied to clipboard" : "Copy embed code"}
            </button>

            {error && (
              <p role="alert" className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="mt-5 rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <p className="font-semibold text-gray-900 dark:text-white">
                How to use your widget
              </p>

              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Copy the embed code above.</li>
                <li>
                  Add it to your website using your website builder's custom
                  code or embed feature. The steps depend on your platform.
                </li>
                <li>Publish your website to show the chatbot to visitors.</li>
                <li>
                  Visit your website and click the floating chat button to
                  test it.
                </li>
              </ol>

              <p className="mt-3">
                Don't have a website? Share your published form link instead.
              </p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
