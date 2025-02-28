
import { Dumbbell } from "lucide-react";
import React from "react";

const Navbar: React.FC = () => {
  return (
    <nav className="glass-card sticky top-4 z-50 rounded-xl backdrop-blur-lg border border-white/20 flex items-center justify-between p-4 mb-8 animate-fade-in">
      <div className="flex items-center gap-2">
        <Dumbbell size={22} className="text-accent" />
        <span className="font-display text-xl font-semibold">GainsTracker</span>
      </div>
      <div className="text-sm text-muted-foreground">
        Your Fitness Journey, Visualized
      </div>
    </nav>
  );
};

export default Navbar;
