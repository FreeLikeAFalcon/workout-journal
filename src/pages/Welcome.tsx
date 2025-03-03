
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Welcome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // If user is already logged in, redirect to home page
  React.useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative bg-gradient-to-b from-blue-600 to-blue-400 dark:from-blue-950 dark:to-blue-800 px-4 sm:px-6 transition-colors duration-300">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTZWMGg2djMwem0wIDBoMTh2NmgtMTh2LTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>

      <div className="max-w-3xl w-full flex flex-col items-center z-10 animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <Dumbbell size={48} className="text-white" />
          <h1 className="font-display text-5xl font-bold text-white">KraftTracker</h1>
        </div>
        
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            {t('welcome.title') || "Verfolge deinen Fortschritt, erreiche deine Ziele"}
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            {t('welcome.subtitle') || "Die einfachste Möglichkeit, deine Workouts zu protokollieren, deine Fortschritte zu verfolgen und deine Fitness zu steigern."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button 
            asChild 
            size="lg" 
            className="flex-1 bg-white text-blue-600 hover:bg-white/90 text-lg py-6"
          >
            <Link to="/auth?tab=login">{t('login') || "Anmelden"}</Link>
          </Button>
          <Button 
            asChild 
            size="lg" 
            variant="outline" 
            className="flex-1 border-white text-white hover:bg-white/10 text-lg py-6"
          >
            <Link to="/auth?tab=register">{t('register') || "Registrieren"}</Link>
          </Button>
        </div>
      </div>

      <footer className="absolute bottom-6 text-white/60 text-sm">
        © {new Date().getFullYear()} KraftTracker • {t('journey') || "Deine Fitness-Reise beginnt hier"}
      </footer>
    </div>
  );
};

export default Welcome;
