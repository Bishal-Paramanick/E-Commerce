import { Route, Routes, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { Toaster } from "react-hot-toast";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { cartApi } from "./services/api";

import { CatalogPage } from "./Pages/Catalog/CatalogPage";
import { AuthPage } from "./Pages/Auth/AuthPage";
import { ProfilePage } from "./Pages/Profile/ProfilePage";
import { CheckoutPage } from "./Pages/Checkout/CheckoutPage";
import { OrdersPage } from "./Pages/orders/OrdersPage";
import { TrackingPage } from "./Pages/orders/TrackingPage";
import { NotFound } from "./Pages/NotFound";

import "./App.css";

// ── Protected Route Guard ─────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div className="btn-spinner" style={{ width: "32px", height: "32px" }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

// ── App Shell (has access to AuthContext) ─────────────────────────────────────
function AppShell() {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  // Smoothly redirect to root / whenever auth session resets or logs out
  useEffect(() => {
    const handleAuthReset = () => {
      navigate("/", { replace: true });
    };
    window.addEventListener("auth:logout", handleAuthReset);
    return () => window.removeEventListener("auth:logout", handleAuthReset);
  }, [navigate]);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart([]);
      return;
    }
    try {
      const response = await cartApi.get();
      setCart(response.data || []);
    } catch (error) {
      console.error("Error reloading cart data:", error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  return (
    <Routes>
      {/* Public */}
      <Route index element={<CatalogPage cart={cart} loadCart={loadCart} />} />
      <Route path="/" element={<CatalogPage cart={cart} loadCart={loadCart} />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />

      {/* Protected */}
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <CheckoutPage cart={cart} loadCart={loadCart} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage cart={cart} loadCart={loadCart} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrdersPage cart={cart} loadCart={loadCart} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tracking/:orderId/:productId"
        element={
          <ProtectedRoute>
            <TrackingPage cart={cart} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage cart={cart} />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="/*" element={<NotFound cart={cart} />} />
    </Routes>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: "10px",
            background: "#0f172a",
            color: "#f1f5f9",
            fontSize: "14px",
            fontWeight: "500",
            border: "1px solid #1e293b",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#f1f5f9" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#f1f5f9" },
          },
        }}
      />
      <AppShell />
    </AuthProvider>
  );
}

export default App;