import { useIntlayer, useLocale } from "react-intlayer";
import { Locales } from "intlayer";

export function LanguageSwitch() {
  const { nav: content } = useIntlayer("app");
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center">
      <button
        className={`flex items-center cursor-pointer p-2 rounded transition-colors ${
          locale === Locales.ENGLISH ? "bg-blue-100" : "hover:bg-gray-100"
        }`}
        onClick={() => setLocale(Locales.ENGLISH)}
      >
        <span className="ml-1">{content.english}</span>
      </button>
      <hr className="inline-block h-6 w-px bg-black m-2" />
      <button
        className={`flex items-center cursor-pointer p-2 rounded transition-colors ${
          locale === Locales.DUTCH ? "bg-blue-100" : "hover:bg-gray-100"
        }`}
        onClick={() => setLocale(Locales.DUTCH)}
      >
        <span className="ml-1">{content.nederlands}</span>
      </button>
    </div>
  );
}
