
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  UserRound,
  LockKeyhole,
  Palette,
  Save,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
  const supabase = createClient();
  const { theme, setTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        setError("Unable to load your account. Please sign in again.");
        setLoadingProfile(false);
        return;
      }

      setEmail(data.user.email ?? "");
      setFullName(data.user.user_metadata?.full_name ?? "");
      setLoadingProfile(false);
    }

    loadProfile();
  }, []);

  async function handleProfileSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSavingProfile(true);

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName.trim() },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Your profile has been updated.");
    }

    setSavingProfile(false);
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (newPassword.length < 8) {
      setError("Your new password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setSavingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Your password has been changed successfully.");
      setNewPassword("");
      setConfirmPassword("");
    }

    setSavingPassword(false);
  }

  return (
    <main className="min-h-screen bg-surface text-ink dark:bg-gray-950 dark:text-gray-100">
      <header className="border-b border-gray-200 bg-white px-5 py-5 dark:border-gray-800 dark:bg-gray-900 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            className="rounded-lg border border-gray-200 p-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={19} />
          </Link>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Workspace / Settings
            </p>
            <h1 className="mt-1 text-2xl font-bold">Settings</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 p-5 sm:p-8">
        <div>
          <h2 className="text-xl font-bold">Manage your account</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Update your profile, security and appearance preferences.
          </p>
        </div>

        {message && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
          >
            <CheckCircle2 size={19} className="shrink-0" />
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            <AlertCircle size={19} className="shrink-0" />
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-brand dark:bg-emerald-950">
              <UserRound size={22} />
            </div>
            <div>
              <h3 className="font-bold">Profile information</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your display name and account email.
              </p>
            </div>
          </div>

          {loadingProfile ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
              <LoaderCircle size={18} className="animate-spin" />
              Loading your account...
            </div>
          ) : (
            <form onSubmit={handleProfileSave} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium"
                >
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Enter your name"
                  required
                  maxLength={100}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-950 dark:focus:ring-emerald-950"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 outline-none dark:border-gray-700 dark:bg-gray-800"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Email changes require a separate verification flow.
                </p>
              </div>

              <button
                type="submit"
                disabled={savingProfile || loadingProfile}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingProfile ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}
                {savingProfile ? "Saving..." : "Save profile"}
              </button>
            </form>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-brand dark:bg-emerald-950">
              <LockKeyhole size={22} />
            </div>
            <div>
              <h3 className="font-bold">Change password</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose a strong password for your account.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-medium"
              >
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-950 dark:focus:ring-emerald-950"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium"
              >
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Enter the password again"
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-950 dark:focus:ring-emerald-950"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingPassword ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <LockKeyhole size={17} />
              )}
              {savingPassword ? "Updating..." : "Update password"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-brand dark:bg-emerald-950">
              <Palette size={22} />
            </div>
            <div>
              <h3 className="font-bold">Appearance</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose how Voxorah looks on your device.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium">Color theme</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Switch between light and dark mode.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                aria-pressed={theme === "light"}
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${
                  theme === "light"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                    : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                }`}
              >
                Light
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                aria-pressed={theme === "dark"}
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${
                  theme === "dark"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                    : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
