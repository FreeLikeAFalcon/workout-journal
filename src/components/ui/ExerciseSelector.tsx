
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ExerciseSelectorProps {
  exercises: string[];
  selectedExercise: string | null;
  onSelectExercise: (exercise: string) => void;
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  exercises,
  selectedExercise,
  onSelectExercise
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { t } = useLanguage();
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
      >
        <span>{selectedExercise || t('selectExercise')}</span>
        <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isDropdownOpen && (
        <div className="absolute z-30 top-full right-0 mt-1 bg-background border border-border rounded-lg shadow-lg w-64 max-h-64 overflow-y-auto">
          {exercises.map((exercise) => (
            <button
              key={exercise}
              onClick={() => {
                onSelectExercise(exercise);
                setIsDropdownOpen(false);
              }}
              className={`w-full text-left px-4 py-2 hover:bg-secondary/50 transition-colors ${
                selectedExercise === exercise ? "bg-secondary" : ""
              }`}
            >
              {exercise}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExerciseSelector;
