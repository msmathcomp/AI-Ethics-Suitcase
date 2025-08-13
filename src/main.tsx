import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./pages/home.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import { IntlayerProvider } from "react-intlayer";
import "./index.css";
import Level from "~/pages/level.tsx";
import Finish from "./pages/finish.tsx";
import LocaleInitializer from "./components/LocaleInitializer.tsx";
import { ConfigProvider } from "./context/ConfigContext";
import { ClassificationResultsProvider } from "./context/ClassificationResultsContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IntlayerProvider>
      <ConfigProvider>
        <ClassificationResultsProvider>
          <LocaleInitializer />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/level/:level" element={<Level />} />
              <Route path="/finish" element={<Finish />} />
            </Routes>
          </BrowserRouter>
        </ClassificationResultsProvider>
      </ConfigProvider>
    </IntlayerProvider>
  </StrictMode>
);
