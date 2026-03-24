import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import AuthForm from "./pages/AuthForm";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import LocationTracking from "./pages/LocationTracking";

// Protected Route Component (to keep people out of the dashboard if not logged in)
function PrivateRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  // If no token or no user, go to login
  if (!token || !user) return <Navigate to="/auth" />;

  // If a specific role is required (like 'admin') and user doesn't have it
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
}

function App() {
  return (
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

        {/* You can add more specific routes here if needed */}
        <Route path="/users" element={<UserManagement />} />
        <Route path="/location" element={<LocationTracking />} />

        {/* Redirect any unknown path to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;