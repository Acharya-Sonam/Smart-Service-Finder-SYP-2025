import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import AuthProvider - THIS IS CRITICAL
import { AuthProvider } from "./context/AuthContext";

import LandingPage from "./pages/LandingPage";
import AuthForm from "./pages/AuthForm";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Protected Route Component
function PrivateRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  if (!token || !user) return <Navigate to="/auth" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
}

function App() {
  return (
    // Wrap EVERYTHING with AuthProvider
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthForm />} />

          {/* Protected Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <PrivateRoute role="admin">
                <AdminDashboard />
              </PrivateRoute>
            } 
          />

          {/* Redirect any unknown path to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;