import { useEffect, useRef } from "react";
import { useLocale } from "react-intlayer";
import { Locales } from "intlayer";
import { useConfig } from "~/context/ConfigContext";

// Map config language to Intlayer locale
const getLocale = (lang: string) => {
  switch (lang) {
    case "en":
      return Locales.ENGLISH;
    case "nl":
      return Locales.DUTCH;
    default:
      return Locales.ENGLISH; // fallback
  }
};
export default function LocaleInitializer() {
  const { setLocale } = useLocale();
  const { config } = useConfig();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!config || isInitialized.current) {
      return;
    }
    const initialLocale = getLocale(config.defaultLanguage);
    setLocale(initialLocale);
    isInitialized.current = true;
  }, [config, setLocale]);

  return null; // This component doesn't render anything
}
