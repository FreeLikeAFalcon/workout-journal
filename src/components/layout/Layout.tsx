
import React from "react";
import Navbar from "./Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import Impressum from "./Impressum";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 dark:text-white transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 pb-20">
        <Navbar />
        <main className="pb-12">{children}</main>
        <footer className="text-center text-sm text-muted-foreground mt-16 pb-8">
          <p className="mb-2">© {new Date().getFullYear()} WOD-Tracker • {t('journey')}</p>
          <div className="flex justify-center">
            <Impressum />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
