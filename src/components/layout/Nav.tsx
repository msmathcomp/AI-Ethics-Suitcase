import nlFlag from "@/assets/nl.svg";
import ukFlag from "@/assets/uk.svg";
import { useIntlayer, useLocale } from "react-intlayer";
import { Locales } from "intlayer";

export default function Nav() {
  const { nav: content } = useIntlayer("app");
  const { locale, setLocale } = useLocale();
  
  const handleLanguageChange = (newLocale: Locales) => {
    setLocale(newLocale);
  };

  return (
    <nav className="w-full h-14 flex items-center justify-between border-b z-50">
      <h1 className="text-3xl">{content.title}</h1>
      <div className="flex items-center">
        <button
          className={`flex items-center cursor-pointer p-2 rounded transition-colors ${
            locale === Locales.ENGLISH ? "bg-blue-100" : "hover:bg-gray-100"
          }`}
          onClick={() => handleLanguageChange(Locales.ENGLISH)}
        >
          <img src={ukFlag} alt="English" className="h-6" />
          <span className="ml-1">{content.english}</span>
        </button>
        <hr className="inline-block h-6 w-px bg-black m-2" />
        <button
          className={`flex items-center cursor-pointer p-2 rounded transition-colors ${
            locale === Locales.DUTCH ? "bg-blue-100" : "hover:bg-gray-100"
          }`}
          onClick={() => handleLanguageChange(Locales.DUTCH)}
        >
          <img src={nlFlag} alt="Nederlands" className="h-6" />
          <span className="ml-1">{content.nederlands}</span>
        </button>
      </div>
    </nav>
  );
}
