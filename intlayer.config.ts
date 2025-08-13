import { Locales, type IntlayerConfig } from "intlayer";

const config: IntlayerConfig = {
  internationalization: {
    locales: [
      Locales.ENGLISH,
      Locales.DUTCH
    ],
    defaultLocale: Locales.ENGLISH,
  },
  middleware: {
    headerName: "x-intlayer-locale",
  },
};

export default config;
