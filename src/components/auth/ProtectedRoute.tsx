
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isEmailConfirmed } = useAuth();

  console.log("ProtectedRoute: loading:", loading, "user:", !!user, "isEmailConfirmed:", isEmailConfirmed);

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
    console.log("ProtectedRoute: No user found, redirecting to welcome page");
    return <Navigate to="/welcome" replace />;
  }

  // Redirect to login if email not confirmed
  if (!isEmailConfirmed) {
    console.log("ProtectedRoute: Email not confirmed, redirecting to login");
    return <Navigate to="/auth?tab=login" replace />;
  }

  // Everything is good, render the protected content
  console.log("ProtectedRoute: User authenticated, rendering protected content");
  return <>{children}</>;
};

export default ProtectedRoute;
