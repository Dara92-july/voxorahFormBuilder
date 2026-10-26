
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  FileText,
  MessageSquare,
  Plus,
  Settings,
  BarChart3,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import LogoutButton from "@/components/logout-button";


const navigation = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My forms", href: "/dashboard/forms", icon: FileText },
  { label: "Responses", href: "/dashboard/responses", icon: MessageSquare },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login");
  }

  const userId = data.claims.sub;

  if (typeof userId !== "string") {
    redirect("/login");
  }

  const { data: forms, error: formsError } = await supabase
    .from("forms")
    .select("id, title, description, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (formsError) {
    console.error("Could not load dashboard forms:", formsError.message);
  }

  const userForms = forms ?? [];
  const formIds = userForms.map((form) => form.id);
  const publishedCount = userForms.filter(
    (form) => form.status === "published"
  ).length;

  let responseCount = 0;

  if (formIds.length > 0) {
    const { count, error: responsesError } = await supabase
      .from("responses")
      .select("id", { count: "exact", head: true })
      .in("form_id", formIds);

    if (responsesError) {
      console.error(
        "Could not load dashboard responses:",
        responsesError.message
      );
    } else {
      responseCount = count ?? 0;
    }
  }

  const stats = [
    {
      title: "Total forms",
      value: String(userForms.length),
      note: "Forms you've created",
      icon: FileText,
    },
    {
      title: "Total responses",
      value: String(responseCount),
      note: "Responses collected",
      icon: MessageSquare,
    },
    {
      title: "Published forms",
      value: String(publishedCount),
      note: "Forms currently live",
      icon: BarChart3,
    },
  ];

  return (
    <main className="min-h-screen bg-surface text-ink dark:bg-gray-950 dark:text-gray-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:flex md:flex-col">
          <Link href="/" className="flex items-center gap-3 px-2 py-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
              <MessageSquare size={22} />
            </span>
            <span className="text-xl font-bold tracking-tight">Voxorah</span>
          </Link>

          <div className="mt-10">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Workspace
            </p>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = item.label === "Overview";

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-emerald-50 text-brand dark:bg-emerald-950"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon size={19} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
            <p className="text-sm font-semibold">Build better forms</p>
            <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
              Create conversational experiences that make every response count.
            </p>
            <Link
              href="/dashboard/forms/new"
              className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-brand px-3 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              <Plus size={16} />
              Create a form
            </Link>
          </div>
          <LogoutButton />
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-900 sm:px-8">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Workspace / Overview
              </p>
              <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                Dashboard
              </h1>
            </div>

            <Link
              href="/dashboard/forms/new"
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              <Plus size={17} />
              <span className="hidden sm:inline">Create form</span>
              <span className="sm:hidden">Create</span>
            </Link>
          </header>

          <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
            <div>
              <p className="text-sm font-semibold text-brand">
                YOUR WORKSPACE
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Welcome to Voxorah
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-gray-600 dark:text-gray-400">
                Create your first conversational form, share it with your
                audience, and manage every response in one place.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.title}
                    className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-brand dark:bg-emerald-950">
                        <Icon size={20} />
                      </span>
                    </div>
                    <p className="mt-5 text-3xl font-bold">{stat.value}</p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {stat.note}
                    </p>
                  </div>
                );
              })}
            </div>

            {userForms.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900 sm:p-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-brand dark:bg-emerald-950">
                  <FileText size={30} />
                </div>

                <h3 className="mt-6 text-xl font-bold">
                  Your first form starts here
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600 dark:text-gray-400">
                  Start with a few questions. Voxorah will turn them into a
                  guided conversation your audience can complete.
                </p>

                <Link
                  href="/dashboard/forms/new"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 font-semibold text-white transition hover:bg-brand-dark"
                >
                  Create your first form
                  <ArrowUpRight size={18} />
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">Your recent forms</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Continue building or review your forms.
                    </p>
                  </div>

                  <Link
                    href="/dashboard/forms"
                    className="text-sm font-semibold text-brand hover:underline"
                  >
                    View all forms
                  </Link>
                </div>

                <div className="mt-5 divide-y divide-gray-100 dark:divide-gray-800">
                  {userForms.slice(0, 5).map((form) => (
                    <div
                      key={form.id}
                      className="flex flex-wrap items-center justify-between gap-4 py-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{form.title}</p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {form.description || "No description added"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            form.status === "published"
                              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {form.status === "published" ? "Published" : "Draft"}
                        </span>

                        <Link
                          href={`/dashboard/forms/${form.id}/edit`}
                          aria-label={`Edit ${form.title}`}
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          <ArrowUpRight size={17} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-bold">Getting started</h3>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {[
                  {
                    number: "01",
                    title: "Build your form",
                    description:
                      "Add questions and choose how people will answer.",
                    href: "/dashboard/forms",
                  },
                  {
                    number: "02",
                    title: "Customize your chatbot",
                    description:
                      "Set your welcome message and brand colors.",
                    href: "/dashboard/forms",
                  },
                  {
                    number: "03",
                    title: "Share and collect",
                    description:
                      "Publish your form and review the responses.",
                    href: "/dashboard/responses",
                  },
                ].map((step) => (
                  <Link
                    key={step.number}
                    href={step.href}
                    className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-emerald-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-emerald-800"
                  >
                    <p className="text-sm font-bold text-brand">
                      {step.number}
                    </p>
                    <h4 className="mt-3 font-semibold">{step.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                      {step.description}
                    </p>
                    <ChevronRight size={18} className="mt-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
