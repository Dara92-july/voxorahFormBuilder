
"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type LandingWidgetDemoProps = {
  formId: string;
};

export default function LandingWidgetDemo({
  formId,
}: LandingWidgetDemoProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!formId) return;

    const existingScript = document.querySelector(
      'script[data-voxorah-landing-widget="true"]'
    );

    if (existingScript) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");

    script.src = `${window.location.origin}/voxorah-widget.js`;
    script.dataset.formId = formId;
    script.dataset.voxorahLandingWidget = "true";
    script.defer = true;

    script.onload = () => setScriptLoaded(true);

    script.onerror = () => {
      console.error("Unable to load the Voxorah chatbot widget.");
    };

    document.body.appendChild(script);

    return () => {
      // Keep the widget script installed for the current page session.
      // This avoids accidentally removing a working launcher.
    };
  }, [formId]);

  if (!formId) {
    return (
      <div className="mt-5 flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        <AlertCircle className="mt-1 shrink-0" size={18} />
        <p>
          The live demo needs a published form ID. Set
          NEXT_PUBLIC_DEMO_FORM_ID in your environment variables to enable it.
        </p>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="mt-5 flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm dark:border-gray-800 dark:bg-gray-900"
    >
      {scriptLoaded ? (
        <CheckCircle2 className="shrink-0 text-brand" size={19} />
      ) : (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      )}

      <p className="text-gray-600 dark:text-gray-300">
        {scriptLoaded
          ? "The chatbot launcher has been loaded. Look at the bottom-right corner of this page."
          : "Loading the chatbot demo..."}
      </p>
    </div>
  );
}
