import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./home.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import Level from "./levels/level.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/AI-Ethics-Suitcase" element={<App />} />
        <Route path="/AI-Ethics-Suitcase/level/:level" element={<Level />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
