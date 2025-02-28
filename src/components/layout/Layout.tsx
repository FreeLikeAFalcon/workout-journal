
import React from "react";
import Navbar from "./Navbar";
import { WorkoutProvider } from "@/contexts/WorkoutContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <WorkoutProvider>
      <div className="min-h-screen pb-16">
        <div className="container max-w-6xl px-4">
          <Navbar />
          <main>{children}</main>
        </div>
      </div>
    </WorkoutProvider>
  );
};

export default Layout;
