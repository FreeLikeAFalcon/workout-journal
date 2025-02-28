
import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, className }) => {
  return (
    <div className={cn(
      "glass-card p-5 rounded-xl flex items-center gap-4 transition-all duration-300",
      "hover:shadow-md animate-scale-in",
      className
    )}>
      <div className="p-3 bg-primary/5 rounded-lg text-primary/80">
        {icon}
      </div>
      <div>
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
