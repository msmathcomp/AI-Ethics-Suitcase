import { Link } from "react-router";
import { useIntlayer } from "react-intlayer";
import { useConfig } from "~/context/ConfigContext";
import { LanguageSwitch } from "~/components/ui/LanguageSwitch";
import ThemeSwitch from "~/components/ui/ThemeSwitch";
import { useEffect } from "react";

export default function Home() {
  const { home: content, common: commonContent } = useIntlayer("app");
  const { config, loading } = useConfig();

  // Prevent touchmove scrolling on mobile device
  // This is to prevent the page from "spring scrolling"
  useEffect(() => {
    const el = document.querySelector("main");
    if (!el) return;

    const blockTouch = (e: TouchEvent) => e.preventDefault();

    el.addEventListener('touchmove', blockTouch, { passive: false });

    return () => {
      el.removeEventListener('touchmove', blockTouch);
    };
  }, []);

  if (loading || !config) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        {commonContent.status.loading}
      </main>
    );
  }


  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 dark:bg-stone-900 dark:text-white">
      <h1 className="text-4xl">{content.title}</h1>
      <h2 className="text-2xl text-stone-600 dark:text-stone-400">{content.subtitle}</h2>
      <p className="max-w-xl text-center">{content.description}</p>
      <Link to={`/level/${config.startLevel}`}>
        <button className="text-2xl cursor-pointer rounded border-1 px-4 py-2 mt-10 animate-pulse hover:animate-none hover:bg-stone-100 dark:hover:bg-emerald-800 dark:bg-emerald-900 dark:border-0">
          {content.getStarted}
        </button>
      </Link>
      <div className="fixed top-6 right-4">
        <LanguageSwitch />
      </div>
      <div className="fixed bottom-4">
        <ThemeSwitch />
      </div>
    </main>
  );
}
