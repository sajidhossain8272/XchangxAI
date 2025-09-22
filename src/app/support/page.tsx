/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";

export default function Page() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    issue: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(
    null
  );

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email.";
    if (!form.phone.trim()) return "Please enter your phone number.";
    if (form.issue.trim().length < 10)
      return "Please describe your issue (at least 10 characters).";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    const err = validate();
    if (err) {
      setStatus({ ok: false, msg: err });
      return;
    }

    setSubmitting(true);
    try {
      // Try your API first (create this endpoint on your side)
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus({ ok: true, msg: "Thanks! We’ll get back to you shortly." });
        setForm({ name: "", email: "", phone: "", issue: "" });
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      // Fallback to mailto if API isn’t set up yet
      const subject = encodeURIComponent("XchangxAI Support Request");
      const body = encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\nIssue:\n${form.issue}`
      );
      window.location.href = `mailto:support@xchangxai.com?subject=${subject}&body=${body}`;
      setStatus({
        ok: true,
        msg: "Opening your email client… If it didn’t open, please email support@xchangxai.com.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto w-full max-w-3xl px-6 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Contact Support
          </h1>
          <p className="mt-2 text-gray-600">
            Having trouble with a trade or payment method? Fill out the form
            and our team will reach you as soon as possible.
          </p>
        </header>

        <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-gray-200">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-sm font-medium text-gray-800"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-gray-800"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-1 block text-sm font-medium text-gray-800"
              >
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="+8801XXXXXXXXX"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                We’ll use this if we need quick clarification.
              </p>
            </div>

            <div>
              <label
                htmlFor="issue"
                className="mb-1 block text-sm font-medium text-gray-800"
              >
                What’s the issue?
              </label>
              <textarea
                id="issue"
                name="issue"
                value={form.issue}
                onChange={onChange}
                placeholder="Describe your problem in detail…"
                rows={6}
                className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                required
              />
            </div>

            {status && (
              <div
                className={`rounded-lg px-3 py-2 text-sm ${
                  status.ok
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                    : "bg-amber-50 text-amber-800 ring-1 ring-amber-100"
                }`}
              >
                {status.msg}
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Prefer phone? Call us:{" "}
                <a
                  href="tel:+8801234567890"
                  className="font-semibold text-gray-900 underline decoration-gray-300 underline-offset-2 hover:decoration-gray-500"
                >
                  +880 1234-567-890
                </a>
              </p>

              <button
                type="submit"
                disabled={submitting}
                className={`rounded-xl px-5 py-2 text-sm font-semibold text-white shadow ${
                  submitting ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-black"
                }`}
                aria-disabled={submitting}
              >
                {submitting ? "Sending…" : "Send Message"}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          By submitting, you agree that XchangxAI may contact you about this
          request.
        </p>
      </section>
    </main>
  );
}
