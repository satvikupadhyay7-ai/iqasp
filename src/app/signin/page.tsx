"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const supabase = createClient();

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <Link href="/" className="brand auth-brand">
        <span className="brand-icon">IQ</span>
        <span>ASPIRANTS</span>
      </Link>

      <section className="auth-card">
        <span className="eyebrow">WELCOME TO IQ ASPIRANTS</span>

        <h1>Welcome back</h1>
        <p>Sign in to continue your preparation.</p>

        <form onSubmit={submitForm}>
          <label className="field-label">Email address</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <label className="field-label">Password</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button
            className="button-primary full-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          New to IQ Aspirants?{" "}
          <Link href="/signup">Create an account</Link>
        </p>

        <Link href="/" className="back-home">
          ← Back to homepage
        </Link>
      </section>
    </main>
  );
}