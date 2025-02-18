import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import CalendarView from "./App.tsx";
import HomePage from "./pages/Home.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:id" element={<CalendarView />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  </StrictMode>
);
