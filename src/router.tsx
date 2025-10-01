import Finish from "./pages/finish";
import Level from "./pages/level";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import Home from "./pages/home.tsx";
import { useConfig } from "./context/ConfigContext.tsx";
import { useIntlayer } from "react-intlayer";

export default function Router() {
  const { common: commonContent } = useIntlayer("app");
  const { config, loading } = useConfig();

  if (loading || !config) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        {commonContent.status.loading}
      </main>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={config.showHomePage ? "/home" : `/level/${config.startLevel}`}
              replace
            />
          }
        />
        <Route path="/home" element={<Home />} />
        <Route path="/level/:level" element={<Level />} />
        <Route path="/finish" element={<Finish />} />
      </Routes>
    </BrowserRouter>
  );
}
