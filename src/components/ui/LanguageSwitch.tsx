import { useLocale } from "react-intlayer";
import { Locales } from "intlayer";
import { cn } from "~/utils/cn";

export function LanguageSwitch() {
  const { locale, setLocale } = useLocale();

  return (
    <div 
      className="flex items-center cursor-pointer hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xl border border-stone-600 dark:border-stone-400" 
      onClick={() => {
        if (locale === Locales.ENGLISH) {
          setLocale(Locales.DUTCH);
        } else {
          setLocale(Locales.ENGLISH);
        }
      }}
    >
      <button
        className={cn("flex items-center px-3 py-2 rounded-xl transition-colors",
          locale === Locales.ENGLISH ? 
            "bg-emerald-200 dark:bg-emerald-800" : ""
        )}
      >
        <span>EN</span>
      </button>
      <hr className="inline-block h-6 w-px bg-black dark:bg-stone-100 m-2" />
      <button
        className={cn("flex items-center px-3 py-2 rounded-xl transition-colors",
          locale === Locales.DUTCH ? "bg-emerald-200 dark:bg-emerald-800" : ""
        )}
      >
        <span>NL</span>
      </button>
    </div>
  );
}
