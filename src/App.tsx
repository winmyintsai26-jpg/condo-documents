import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { OwnerAuthProvider } from "./auth/OwnerAuthContext";
import { OwnerProtectedRoute } from "./auth/OwnerProtectedRoute";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AdminLayout } from "./components/AdminLayout";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminDocumentsPage } from "./pages/AdminDocumentsPage";
import { AdminCategoriesPage } from "./pages/AdminCategoriesPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { OwnerLibraryPage } from "./pages/OwnerLibraryPage";
import { OwnerLoginPage } from "./pages/OwnerLoginPage";
export function App() {
  return <AuthProvider><OwnerAuthProvider><Routes>
    <Route path="/" element={<Navigate to="/owner" replace />} />
    <Route path="/admin/login" element={<AdminLoginPage />} />
    <Route path="/owner/login" element={<OwnerLoginPage />} />
    <Route element={<OwnerProtectedRoute />}><Route path="/owner" element={<OwnerLibraryPage />} /></Route>
    <Route element={<ProtectedRoute />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="documents" element={<AdminDocumentsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></OwnerAuthProvider></AuthProvider>;
}
