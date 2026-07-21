import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "../components/site/SiteHeader";
import { SiteFooter } from "../components/site/SiteFooter";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1 grid place-items-center px-6 py-32">
        <div className="max-w-md text-center">
          <span className="eyebrow">Error 404</span>
          <h1 className="display-2 mt-5">Page not found</h1>
          <p className="mt-4 text-muted-foreground">
            The page you're looking for has moved or never existed.
          </p>
          <Link to="/" className="btn-primary mt-8">Return Home</Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <span className="eyebrow">Unexpected error</span>
        <h1 className="display-2 mt-5">This page didn't load</h1>
        <p className="mt-4 text-muted-foreground">Something went wrong. Try refreshing or head home.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => { router.invalidate(); reset(); }} className="btn-primary">Try again</button>
          <a href="/" className="btn-ghost">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "google-site-verification", content: "3W66KALsx55-F4K1Xjh6gy7VDu-r7dmBik4_t-aXUmI" },
      { title: "Veritas Global Advisory | Strategic Intelligence & Advisory" },
      {
        name: "description",
        content:
          "International consulting, research, and advisory firm delivering strategic intelligence, political risk analysis, and governance advisory across continents.",
      },
      { name: "author", content: "Veritas Global Advisory" },
      { property: "og:title", content: "Veritas Global Advisory | Strategic Intelligence & Advisory" },
      { property: "og:description", content: "Veritas Global Advisory is an international consulting and advisory firm providing strategic intelligence, research, and global solutions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Veritas Global Advisory | Strategic Intelligence & Advisory" },
      { name: "twitter:description", content: "Veritas Global Advisory is an international consulting and advisory firm providing strategic intelligence, research, and global solutions." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3dfd51f1-c7bc-4b9c-8c93-1b81834a9127/id-preview-bed15bdc--18aef884-42a4-462a-8a37-0da9db485681.lovable.app-1781689847790.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3dfd51f1-c7bc-4b9c-8c93-1b81834a9127/id-preview-bed15bdc--18aef884-42a4-462a-8a37-0da9db485681.lovable.app-1781689847790.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Veritas Global Advisory",
          url: "https://veritasglobaladvisory.org",
          logo: "https://veritasglobaladvisory.org/favicon.png",
          description: "International consulting and advisory firm providing strategic intelligence, research, and governance advisory.",
          sameAs: [],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Veritas Global Advisory",
          url: "https://veritasglobaladvisory.org",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </QueryClientProvider>
  );
}
