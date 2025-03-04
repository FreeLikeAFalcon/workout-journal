
import React from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface WorkoutHeaderProps {
  title: string;
  onClose: () => void;
}

const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({ title, onClose }) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <button
        onClick={onClose}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label={t('close')}
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default WorkoutHeader;
