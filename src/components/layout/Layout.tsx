
import React from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 pb-20">
        <Navbar />
        <main className="pb-12">{children}</main>
        <footer className="text-center text-sm text-muted-foreground mt-16 pb-8">
          <p>© {new Date().getFullYear()} WOD-Tracker • Here begins your journey</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
