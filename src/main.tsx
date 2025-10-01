import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { IntlayerProvider } from "react-intlayer";
import "./index.css";
import LocaleInitializer from "./components/LocaleInitializer.tsx";
import { ConfigProvider } from "./context/ConfigContext";
import { ClassificationResultsProvider } from "./context/ClassificationResultsContext";
import Router from "./router.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IntlayerProvider>
      <ConfigProvider>
        <ClassificationResultsProvider>
          <LocaleInitializer />
          <Router />
        </ClassificationResultsProvider>
      </ConfigProvider>
    </IntlayerProvider>
  </StrictMode>
);
