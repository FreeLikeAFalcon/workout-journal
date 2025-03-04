
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Exercise } from "@/modules/database/workouts/types";
import { generateId } from "@/utils/workoutUtils";
import { useLanguage } from "@/contexts/LanguageContext";

interface ExerciseFormProps {
  onAddExercise: (exercise: Omit<Exercise, "id">) => void;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({ onAddExercise }) => {
  const [newExerciseName, setNewExerciseName] = useState("");
  const { t } = useLanguage();

  const handleAddExercise = () => {
    if (newExerciseName.trim()) {
      const newExercise: Omit<Exercise, "id"> = {
        name: newExerciseName.trim(),
        sets: [],
      };
      onAddExercise(newExercise);
      setNewExerciseName("");
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm text-muted-foreground mb-1">{t('exercises')}</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newExerciseName}
          onChange={(e) => setNewExerciseName(e.target.value)}
          className="flex-1 p-2 border border-input rounded-lg bg-transparent"
          placeholder={t('enterExerciseName')}
        />
        <button
          type="button"
          onClick={handleAddExercise}
          className="p-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          disabled={!newExerciseName.trim()}
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};

export default ExerciseForm;
