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

function setCookie(value: string) {
  document.cookie = `googtrans=${value};path=/`;
  document.cookie = `googtrans=${value};path=/;domain=.${location.hostname}`;
}

export function LanguageBar() {
  const [current, setCurrent] = useState("en");

  useEffect(() => {
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
    if (code === "en") {
      setCookie("/en/en");
    } else {
      setCookie(`/en/${code}`);
    }
    location.reload();
  };

  return (
    <div className="hidden md:flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-muted-foreground">
      <Globe className="h-3.5 w-3.5 text-[var(--gold)]" />
      <select
        aria-label="Translate site"
        value={current}
        onChange={(e) => change(e.target.value)}
        className="bg-transparent border-0 focus:outline-none text-[11px] uppercase tracking-[0.14em] cursor-pointer"
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
      <div id="google_translate_element" className="hidden" />
    </div>
  );
}
