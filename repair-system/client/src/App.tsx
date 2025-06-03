import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ui/theme-provider";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { CustomersPage } from "./pages/CustomersPage";
import { OrdersPage } from "./pages/OrdersPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { CatalogPage } from "./pages/CatalogPage";
import { UsersPage } from "./pages/UsersPage";
import { NewOrderPage } from "./pages/NewOrderPage";
import { AccountingPage } from "./pages/AccountingPage";
import { BarcodeScannerPage } from "./pages/BarcodeScannerPage";
import { SettingsPage } from "./pages/SettingsPage";
import { BranchesPage } from "./pages/BranchesPage";
import { LanguageProvider } from "./contexts/LanguageContext";
import ErrorPage from "./pages/ErrorPage";
import { lazy, Suspense } from "react";
import "./i18n"; // Import i18n configuration at the root level

// Use lazy loading for less critical routes
const LazySettings = lazy(() => import("./pages/SettingsPage").then(module => ({ default: module.SettingsPage })));
const LazyUsers = lazy(() => import("./pages/UsersPage").then(module => ({ default: module.UsersPage })));
const LazyBranches = lazy(() => import("./pages/BranchesPage").then(module => ({ default: module.BranchesPage })));

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider defaultTheme="light" storageKey="ui-theme">
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/error" element={<ErrorPage />} />
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:orderId" element={<OrderDetailPage />} />
                <Route path="orders/new" element={<NewOrderPage />} />
                <Route path="barcode-scanner" element={<BarcodeScannerPage />} />
                <Route path="catalog" element={<CatalogPage />} />
                <Route path="accounting" element={<AccountingPage />} />
                
                {/* Lazy loaded routes */}
                <Route path="branches" element={
                  <Suspense fallback={<div className="p-12 flex justify-center">Loading...</div>}>
                    <LazyBranches />
                  </Suspense>
                } />
                <Route path="users" element={
                  <Suspense fallback={<div className="p-12 flex justify-center">Loading...</div>}>
                    <LazyUsers />
                  </Suspense>
                } />
                <Route path="settings" element={
                  <Suspense fallback={<div className="p-12 flex justify-center">Loading...</div>}>
                    <LazySettings />
                  </Suspense>
                } />
                
                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/error" replace />} />
              </Route>
            </Routes>
          </Router>
          <Toaster />
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;