import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password | Veritas Global Advisory" },
      { name: "description", content: "Set a new password for your Veritas Global Advisory admin account." },
      { property: "og:title", content: "Reset Password | Veritas Global Advisory" },
      { property: "og:description", content: "Set a new password for your Veritas Global Advisory admin account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [recoveryType, setRecoveryType] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    setRecoveryType(params.get("type") === "recovery");
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4 py-16">
      <div className="card-elevated w-full max-w-md p-8 md:p-10">
        <div className="text-center mb-6">
          <span className="eyebrow">Admin Console</span>
          <h1 className="display-3 mt-3">Reset password</h1>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <p className="text-green-600">Your password has been updated.</p>
            <Link to="/auth" className="btn-primary w-full inline-block">Sign in</Link>
          </div>
        ) : !recoveryType ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              This page only works from a password-reset email link. Request a new reset link from the sign-in page.
            </p>
            <Link to="/auth" className="btn-primary w-full inline-block">Back to sign in</Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">New password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 border border-border bg-background text-sm focus:outline-none focus:border-[var(--navy-deep)]"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Confirm password</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full h-12 px-4 border border-border bg-background text-sm focus:outline-none focus:border-[var(--navy-deep)]"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
              {busy ? "Please wait…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
