import { useIntlayer, useLocale } from "react-intlayer";
import { Locales } from "intlayer";
import { cn } from "~/utils/cn";

export function LanguageSwitch() {
  const { nav: content } = useIntlayer("app");
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center">
      <button
        className={cn("flex items-center cursor-pointer p-2 rounded transition-colors",
          locale === Locales.ENGLISH ? 
            "bg-emerald-200 dark:bg-emerald-900" :
            "hover:bg-stone-200 dark:hover:bg-stone-800"
        )}
        onClick={() => setLocale(Locales.ENGLISH)}
      >
        <span className="ml-1">{content.english}</span>
      </button>
      <hr className="inline-block h-6 w-px bg-black dark:bg-stone-100 m-2" />
      <button
        className={cn("flex items-center cursor-pointer p-2 rounded transition-colors",
          locale === Locales.DUTCH ? 
            "bg-emerald-200 dark:bg-emerald-900" :
            "hover:bg-stone-200 dark:hover:bg-stone-800"
        )}
        onClick={() => setLocale(Locales.DUTCH)}
      >
        <span className="ml-1">{content.nederlands}</span>
      </button>
    </div>
  );
}
