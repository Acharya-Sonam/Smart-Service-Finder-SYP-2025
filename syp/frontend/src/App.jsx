import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import LandingPage       from "./pages/LandingPage.jsx";
import AuthForm          from "./pages/AuthForm.jsx";
import ForgotPassword    from "./pages/ForgotPassword.jsx";
import ResetPassword     from "./pages/ResetPassword.jsx";
import CustomerDashboard from "./pages/CustomerDashboard.jsx";
import ProviderDashboard from "./pages/ProviderDashboard.jsx";
import AdminDashboard    from "./pages/AdminDashboard.jsx"; 

// Protected Route Component
function PrivateRoute({ children, role }) {
  const user  = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  // Not logged in
  if (!token || !user) return <Navigate to="/auth" />;

  // Role check
  if (role && user.role !== role) return <Navigate to="/auth" />;

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected: Customer */}
        <Route
          path="/customer-dashboard"
          element={
            <PrivateRoute role="Customer">
              <CustomerDashboard />
            </PrivateRoute>
          }
        />

        {/* Protected: Service Provider */}
        <Route
          path="/provider-dashboard"
          element={
            <PrivateRoute role="Service Provider">
              <ProviderDashboard />
            </PrivateRoute>
          }
        />

        {/* Protected: Admin */}
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute role="Admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Catch-all: Redirect unknown routes to landing */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}