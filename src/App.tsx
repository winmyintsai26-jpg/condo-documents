import { Route, Routes } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { AdminPage } from "./pages/AdminPage";
import { HomePage } from "./pages/HomePage";
export function App() { return <div className="site-frame"><Header /><Routes><Route path="/" element={<HomePage />} /><Route path="/admin" element={<AdminPage />} /></Routes><Footer /></div>; }
