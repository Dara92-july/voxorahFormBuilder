
import {
  ArrowRight,
  MessageCircle,
  ListChecks,
  MessagesSquare,
  Palette,
  BarChart3,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Workflow,
  MousePointerClick,
  ExternalLink,
  Mail,
} from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import LandingWidgetDemo from "@/components/landing-widget-demo";

const features = [
  {
    icon: ListChecks,
    title: "Build flexible forms",
    description:
      "Create text, email, multiple-choice and yes-or-no questions. Reorder questions and mark the ones that are required.",
  },
  {
    icon: MessagesSquare,
    title: "Conversational experiences",
    description:
      "Ask one question at a time in a chat-style interface that feels natural and easy to complete.",
  },
  {
    icon: Share2,
    title: "Share anywhere",
    description:
      "Publish a unique form link or embed a floating chatbot on your existing website with a simple JavaScript snippet.",
  },
  {
    icon: BarChart3,
    title: "Manage every response",
    description:
      "Review submissions, inspect individual answers and see when each response was received from your dashboard.",
  },
  {
    icon: Palette,
    title: "Make it yours",
    description:
      "Customize your form's welcome message and primary color to better match your brand.",
  },
  {
    icon: ShieldCheck,
    title: "Stay in control",
    description:
      "Manage your forms from one place and publish or unpublish them whenever you need to.",
  },
];

const steps = [
  {
    number: "01",
    icon: ListChecks,
    title: "Create your form",
    description:
      "Add your questions, choose their types, configure required fields and preview the experience.",
  },
  {
    number: "02",
    icon: MousePointerClick,
    title: "Publish and share",
    description:
      "Publish your form to generate a public link, or copy the embed snippet to add the chatbot to your website.",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Collect and review",
    description:
      "Let people answer through the conversation and review their saved submissions in your dashboard.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-surface text-ink dark:bg-gray-950 dark:text-gray-100">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
        <a href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
            <MessageCircle size={22} />
          </span>
          <span className="text-xl font-bold tracking-tight">Voxorah</span>
        </a>

        <div className="hidden items-center gap-7 text-sm font-medium text-gray-600 dark:text-gray-300 md:flex">
          <a href="#features" className="transition hover:text-brand">
            Features
          </a>
          <a href="#how-it-works" className="transition hover:text-brand">
            How it works
          </a>
          <a href="#live-demo" className="transition hover:text-brand">
            Live demo
          </a>
          <a href="#contact" className="transition hover:text-brand">
            Contact
          </a>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <ThemeToggle />

          <a
            href="/login"
            className="rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark sm:px-5"
          >
            Get started
            <ArrowRight className="ml-1 inline" size={16} />
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-brand">
            Conversational forms, reimagined
          </p>

          <h1 className="max-w-xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            Turn questions into{" "}
            <span className="text-brand">conversations.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-gray-600 dark:text-gray-300">
            Create interactive forms, guide people through one question at a
            time, and collect meaningful responses without the boring forms.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/register"
              className="rounded-xl bg-brand px-6 py-4 font-semibold text-white transition hover:bg-brand-dark"
            >
              Create your first form
              <ArrowRight className="ml-2 inline" size={18} />
            </a>

            <a
              href="#live-demo"
              className="rounded-xl border border-gray-300 bg-white px-6 py-4 font-semibold text-gray-800 transition hover:border-brand hover:text-brand dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              Try the live demo
            </a>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-brand" />
              Easy form creation
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-brand" />
              Shareable forms
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-brand" />
              Centralized responses
            </span>
          </div>
        </div>

        {/* Product preview */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-4xl bg-emerald-500/10 blur-2xl" />

          <div className="relative rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/20 md:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5 dark:border-gray-800">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-brand dark:bg-emerald-950">
                <MessageCircle size={23} />
              </div>

              <div>
                <h2 className="font-bold">Quick feedback</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  A conversational form preview
                </p>
              </div>

              <span className="ml-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-brand dark:bg-emerald-950">
                Preview
              </span>
            </div>

            <div className="space-y-5 py-7">
              <div className="max-w-xs rounded-2xl rounded-bl-sm bg-gray-100 p-4 text-sm leading-6 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                Hi there! We&apos;d love to hear from you. What&apos;s your name?
              </div>

              <div className="ml-auto max-w-xs rounded-2xl rounded-br-sm bg-brand p-4 text-sm text-white">
                Gbemisola Omodara
              </div>

              <div className="max-w-xs rounded-2xl rounded-bl-sm bg-gray-100 p-4 text-sm leading-6 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                How was your experience today?
              </div>

              <div className="flex flex-wrap gap-2">
                {["Excellent", "Good", "Average"].map((option) => (
                  <span
                    key={option}
                    className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  >
                    {option}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 text-center text-xs text-gray-400 dark:border-gray-800">
              An example of a conversational experience
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="scroll-mt-8 border-y border-gray-200 bg-white px-6 py-20 dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand">
              Built for better responses
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need to start a conversation
            </h2>

            <p className="mt-4 leading-7 text-gray-600 dark:text-gray-300">
              Build your forms, share your chatbot and manage every submission
              from one straightforward workspace.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-gray-200 bg-surface p-6 transition hover:-translate-y-1 hover:border-emerald-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-emerald-800"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-brand dark:bg-emerald-950">
                    <Icon size={23} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold">{feature.title}</h3>

                  <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-8 px-6 py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand">
              A simple workflow
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              From your first question to useful insights
            </h2>

            <p className="mt-4 leading-7 text-gray-600 dark:text-gray-300">
              Everything is designed to help you build, publish and collect
              responses without a complicated setup.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <article key={step.number} className="relative">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold tracking-widest text-brand">
                      {step.number}
                    </span>

                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                  </div>

                  <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-brand dark:bg-emerald-950">
                    <Icon size={23} />
                  </div>

                  <h3 className="mt-5 text-xl font-bold">{step.title}</h3>

                  <p className="mt-3 leading-7 text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <a
              href="/register"
              className="inline-flex items-center rounded-xl bg-brand px-6 py-4 font-semibold text-white transition hover:bg-brand-dark"
            >
              Start building
              <ArrowRight className="ml-2" size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Live widget demo */}
      <section
        id="live-demo"
        className="scroll-mt-8 border-y border-gray-200 bg-white px-6 py-20 dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand">
              Try it yourself
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              See a conversational form in action
            </h2>

            <p className="mt-5 leading-7 text-gray-600 dark:text-gray-300">
              Experience the same floating chatbot visitors can use on a
              website. Open the chat, answer the questions and submit a
              response.
            </p>

            <div className="mt-6 flex items-start gap-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
              <CheckCircle2 className="mt-1 shrink-0 text-brand" size={18} />
              <p>Questions are presented in a conversational flow.</p>
            </div>

            <div className="mt-3 flex items-start gap-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
              <CheckCircle2 className="mt-1 shrink-0 text-brand" size={18} />
              <p>Responses can be saved and reviewed in the dashboard.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-surface p-6 dark:border-gray-800 dark:bg-gray-950 md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white">
                <MessageCircle size={24} />
              </div>

              <div>
                <h3 className="font-bold">Live chatbot demo</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Powered by your published Voxorah form
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-brand dark:bg-emerald-950">
                  <MessagesSquare size={17} />
                </span>

                <div>
                  <p className="font-medium">Ready to start?</p>
                  <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                    Use the floating chat button in the bottom-right corner
                    to begin the conversation.
                  </p>
                </div>
              </div>
            </div>

            <LandingWidgetDemo
              formId={process.env.NEXT_PUBLIC_DEMO_FORM_ID ?? ""}
            />

            <p className="mt-4 text-xs leading-5 text-gray-500 dark:text-gray-400">
              The demo uses a published form. Responses submitted here are
              stored with that form&apos;s responses.
            </p>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-3xl bg-gray-950 px-6 py-12 text-center text-white dark:bg-gray-900 md:px-12 md:py-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600">
            <Workflow size={27} />
          </div>

          <h2 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl">
            Ready to build a better form?
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-300">
            Create a form, publish it and start collecting responses through
            a more conversational experience.
          </p>

          <a
            href="/register"
            className="mt-8 inline-flex items-center rounded-xl bg-brand px-6 py-4 font-semibold text-white transition hover:bg-brand-dark"
          >
            Create your first form
            <ArrowRight className="ml-2" size={18} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="border-t border-gray-200 bg-white px-6 py-10 dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <a href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
                <MessageCircle size={20} />
              </span>
              <span className="text-lg font-bold">Voxorah</span>
            </a>

            <p className="mt-4 max-w-xs text-sm leading-6 text-gray-500 dark:text-gray-400">
              Turn questions into conversations. Create, share and manage
              conversational forms in one place.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Explore</h3>
            <div className="mt-4 flex flex-col items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
              <a href="#features" className="hover:text-brand">Features</a>
              <a href="#how-it-works" className="hover:text-brand">How it works</a>
              <a href="#live-demo" className="hover:text-brand">Live demo</a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Your workspace</h3>
            <div className="mt-4 flex flex-col items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
              <a href="/register" className="hover:text-brand">Create an account</a>
              <a href="/login" className="hover:text-brand">Sign in</a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Contact</h3>
            <p className="mt-4 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Questions about Voxorah? Get in touch with the project team.
            </p>

            <a
              href="mailto:salamigbemisola2016@gmail.com"
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
            >
              <Mail size={16} />
              Email us
              <ExternalLink size={14} />
            </a>

          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-gray-200 pt-6 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Voxorah. All rights reserved.</p>
          <p>Turn questions into conversations.</p>
        </div>
      </footer>
    </main>
  );
}
