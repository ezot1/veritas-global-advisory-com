import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign In | Veritas Global Advisory" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
      }
      navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4 py-16">
      <div className="card-elevated w-full max-w-md p-8 md:p-10">
        <div className="text-center mb-6">
          <span className="eyebrow">Admin Console</span>
          <h1 className="display-3 mt-3">{mode === "signin" ? "Sign in" : "Create account"}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Restricted access for Veritas Global Advisory staff.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 border border-border bg-background text-sm focus:outline-none focus:border-[var(--navy-deep)]" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Password</label>
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 border border-border bg-background text-sm focus:outline-none focus:border-[var(--navy-deep)]" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? (
            <button onClick={() => setMode("signup")} className="underline hover:text-[var(--navy-deep)]">
              Need an account? Sign up
            </button>
          ) : (
            <button onClick={() => setMode("signin")} className="underline hover:text-[var(--navy-deep)]">
              Already have an account? Sign in
            </button>
          )}
        </div>
        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-[var(--navy-deep)]">← Back to site</Link>
        </div>
      </div>
    </div>
  );
}
