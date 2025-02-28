
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { FolderX } from "lucide-react";
import Layout from "@/components/layout/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="glass-card p-10 rounded-xl text-center max-w-md">
          <FolderX size={50} className="mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Oops! This page doesn't exist.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
