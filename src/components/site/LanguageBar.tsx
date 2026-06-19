import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

const LANGS = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
  { code: "zh-CN", label: "中文" },
  { code: "ru", label: "Русский" },
  { code: "pt", label: "Português" },
  { code: "de", label: "Deutsch" },
  { code: "ja", label: "日本語" },
  { code: "hi", label: "हिन्दी" },
  { code: "sw", label: "Kiswahili" },
  { code: "tr", label: "Türkçe" },
];

function readCurrent() {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
  return m?.[1] ?? "en";
}

function setCookie(value: string) {
  document.cookie = `googtrans=${value};path=/`;
  const host = location.hostname;
  document.cookie = `googtrans=${value};path=/;domain=.${host}`;
  // also clear root-domain variant for previews
  const root = host.split(".").slice(-2).join(".");
  if (root && root !== host) {
    document.cookie = `googtrans=${value};path=/;domain=.${root}`;
  }
}

export function LanguageBar({ compact = false }: { compact?: boolean }) {
  const [current, setCurrent] = useState("en");

  useEffect(() => {
    setCurrent(readCurrent());
    if (document.getElementById("google-translate-script")) return;
    window.googleTranslateElementInit = () => {
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: LANGS.map((l) => l.code).join(","),
            autoDisplay: false,
          },
          "google_translate_element"
        );
      } catch {}
    };
    const s = document.createElement("script");
    s.id = "google-translate-script";
    s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  const change = (code: string) => {
    setCurrent(code);
    setCookie(`/en/${code}`);
    setTimeout(() => location.reload(), 60);
  };

  return (
    <div
      className={
        compact
          ? "flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-muted-foreground"
          : "flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-muted-foreground"
      }
    >
      <Globe className="h-3.5 w-3.5 text-[var(--gold)]" aria-hidden />
      <label className="sr-only" htmlFor="lang-select">Translate</label>
      <select
        id="lang-select"
        aria-label="Translate site"
        value={current}
        onChange={(e) => change(e.target.value)}
        className="bg-transparent border border-border/60 rounded-sm px-2 py-1 focus:outline-none focus:border-[var(--navy-deep)] text-[11px] uppercase tracking-[0.14em] cursor-pointer text-foreground"
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
      <div id="google_translate_element" className="hidden" />
    </div>
  );
}
