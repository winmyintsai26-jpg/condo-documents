"use client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { AdminPage } from "./pages/AdminPage";
import { HomePage } from "./pages/HomePage";
export default function CondoDocumentsApp({ initialPath }: { initialPath?: string }) {
  if (typeof window !== "undefined" && initialPath && window.location.pathname !== initialPath) window.history.replaceState(null, "", initialPath);
  return <BrowserRouter><div className="site-frame"><Header /><Routes><Route path="/" element={<HomePage />} /><Route path="/admin" element={<AdminPage />} /></Routes><Footer /></div></BrowserRouter>;
}
