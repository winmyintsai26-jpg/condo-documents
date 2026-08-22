import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AdminLayout } from "./components/AdminLayout";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminDocumentsPage } from "./pages/AdminDocumentsPage";
import { AdminCategoriesPage } from "./pages/AdminCategoriesPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { HomePage } from "./pages/HomePage";
function PublicLayout() { return <div className="site-frame"><Header /><Outlet /><Footer /></div>; }
export function App() {
  return <AuthProvider><Routes>
    <Route element={<PublicLayout />}><Route path="/" element={<HomePage />} /></Route>
    <Route path="/admin/login" element={<AdminLoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="documents" element={<AdminDocumentsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></AuthProvider>;
}
