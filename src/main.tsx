import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { IntlayerProvider } from "react-intlayer";
import "./index.css";
import LocaleInitializer from "./components/LocaleInitializer.tsx";
import { ConfigProvider } from "./context/ConfigContext";
import { LevelDataProvider } from "./context/ClassificationResultsContext";
import Router from "./router.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IntlayerProvider>
      <ConfigProvider>
        <LevelDataProvider>
          <LocaleInitializer />
          <Router />
        </LevelDataProvider>
      </ConfigProvider>
    </IntlayerProvider>
  </StrictMode>
);
