// Security headers applied to every response returned by the Worker.
// CSP is intentionally pragmatic: TanStack Start emits an inline hydration
// script and Tailwind/shadcn ship inline styles, so 'unsafe-inline' is
// required for scripts and styles until we introduce nonces.

const SUPABASE_URL = process.env.SUPABASE_URL ?? "https://khqllersodsosalsipdj.supabase.co";
const SUPABASE_WS = SUPABASE_URL.replace(/^https?:/, "wss:");

const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co",
  `connect-src 'self' ${SUPABASE_URL} ${SUPABASE_WS} https://*.lovable.app https://*.lovable.dev`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": CSP,
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "X-DNS-Prefetch-Control": "off",
  "X-Permitted-Cross-Domain-Policies": "none",
};

export function applySecurityHeaders(response: Response): Response {
  // Preserve streaming responses by mutating headers on a cloned Response.
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(key)) headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
