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
        <Route path="/" element={<App />} />
        <Route path="/level/:level" element={<Level />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
