
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isEmailConfirmed } = useAuth();

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect to welcome page if not logged in
  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  // Redirect to login if email not confirmed
  if (!isEmailConfirmed) {
    return <Navigate to="/auth?tab=login" replace />;
  }

  // Everything is good, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
