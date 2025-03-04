
import React, { useState } from "react";
import { Exercise, Set as WorkoutSet } from "@/modules/database/workouts/types";
import { Trash, Plus, ChevronDown, ChevronUp, Activity } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ExerciseItemProps {
  exercise: Exercise;
  workoutId: string;
  isPersonalRecord?: boolean;
  onRemoveExercise: (id: string) => void;
  onAddSet: (exerciseId: string, set: Omit<WorkoutSet, "id">) => void;
  onRemoveSet: (exerciseId: string, setId: string) => void;
  onUpdateSet: (exerciseId: string, setId: string, field: string, value: number) => void;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({
  exercise,
  workoutId,
  isPersonalRecord = false,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet
}) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);
  const [newSet, setNewSet] = useState<Omit<WorkoutSet, "id">>({ reps: 0, weight: 0 });

  const maxWeightSet = isPersonalRecord && exercise.sets.length > 0 ? 
    [...exercise.sets].sort((a, b) => b.weight - a.weight)[0] : null;

  const handleAddSet = () => {
    if (newSet.reps > 0) {
      onAddSet(exercise.id, newSet);
      setNewSet({ reps: 0, weight: 0 });
    }
  };

  const handleUpdateSet = (setId: string, field: keyof WorkoutSet, value: number) => {
    onUpdateSet(exercise.id, setId, field, value);
  };

  // Calculate total volume
  const totalVolume = exercise.sets.reduce((total, set) => total + (set.reps * set.weight), 0);

  return (
    <div className="glass-card rounded-xl mb-4 overflow-hidden animate-slide-up">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="text-lg font-medium">{exercise.name}</div>
          {isPersonalRecord && (
            <div className="bg-accent/10 text-accent px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
              <Activity size={12} />
              {t('personalRecord')}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground hidden sm:block">
            {t('totalVolume')}: <span className="font-medium">{totalVolume.toFixed(1)} kg</span>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemoveExercise(exercise.id);
            }}
            className="text-muted-foreground hover:text-destructive transition-colors"
            aria-label={t('removeExercise')}
          >
            <Trash size={16} />
          </button>
          
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>
      
      {isExpanded && (
        <ExerciseSets 
          exercise={exercise}
          maxWeightSet={maxWeightSet}
          newSet={newSet}
          setNewSet={setNewSet}
          onUpdateSet={handleUpdateSet}
          onRemoveSet={onRemoveSet}
          onAddSet={handleAddSet}
        />
      )}
    </div>
  );
};

// Separate the sets table into its own component
interface ExerciseSetsProps {
  exercise: Exercise;
  maxWeightSet: WorkoutSet | null;
  newSet: Omit<WorkoutSet, "id">;
  setNewSet: React.Dispatch<React.SetStateAction<Omit<WorkoutSet, "id">>>;
  onUpdateSet: (setId: string, field: keyof WorkoutSet, value: number) => void;
  onRemoveSet: (exerciseId: string, setId: string) => void;
  onAddSet: () => void;
}

const ExerciseSets: React.FC<ExerciseSetsProps> = ({
  exercise,
  maxWeightSet,
  newSet,
  setNewSet,
  onUpdateSet,
  onRemoveSet,
  onAddSet
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="p-4 pt-0 border-t border-border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-muted-foreground">
              <th className="pb-2 font-medium">{t('set')}</th>
              <th className="pb-2 font-medium">{t('reps')}</th>
              <th className="pb-2 font-medium">{t('weight')} (kg)</th>
              <th className="pb-2 font-medium">{t('volume')}</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {exercise.sets.map((set, index) => {
              const isPRSet = maxWeightSet && set.id === maxWeightSet.id;
              return (
                <tr key={set.id} className={`border-t border-border/30 ${isPRSet ? "bg-accent/5" : ""}`}>
                  <td className="py-2 text-sm">{index + 1}</td>
                  <td className="py-2">
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => onUpdateSet(set.id, "reps", parseInt(e.target.value) || 0)}
                      className={`w-16 p-1 border border-input rounded bg-transparent ${isPRSet ? "font-bold text-accent" : ""}`}
                      min="0"
                      aria-label={t('reps')}
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) => onUpdateSet(set.id, "weight", parseFloat(e.target.value) || 0)}
                      step="0.5"
                      className={`w-20 p-1 border border-input rounded bg-transparent ${isPRSet ? "font-bold text-accent" : ""}`}
                      min="0"
                      aria-label={t('weight')}
                    />
                  </td>
                  <td className={`py-2 text-sm ${isPRSet ? "font-bold text-accent" : ""}`}>
                    {(set.reps * set.weight).toFixed(1)} kg
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => onRemoveSet(exercise.id, set.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={t('removeSet')}
                    >
                      <Trash size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
            
            <tr className="border-t border-border/30">
              <td className="py-2 text-sm">{exercise.sets.length + 1}</td>
              <td className="py-2">
                <input
                  type="number"
                  value={newSet.reps || ''}
                  onChange={(e) => setNewSet({ ...newSet, reps: parseInt(e.target.value) || 0 })}
                  className="w-16 p-1 border border-input rounded bg-transparent"
                  placeholder={t('reps')}
                  min="0"
                  aria-label={t('newReps')}
                />
              </td>
              <td className="py-2">
                <input
                  type="number"
                  value={newSet.weight || ''}
                  onChange={(e) => setNewSet({ ...newSet, weight: parseFloat(e.target.value) || 0 })}
                  step="0.5"
                  className="w-20 p-1 border border-input rounded bg-transparent"
                  placeholder={t('weight')}
                  min="0"
                  aria-label={t('newWeight')}
                />
              </td>
              <td className="py-2 text-sm">{((newSet.reps || 0) * (newSet.weight || 0)).toFixed(1)} kg</td>
              <td className="py-2 text-right">
                <button
                  onClick={onAddSet}
                  className="text-accent hover:text-accent/80 disabled:text-muted-foreground transition-colors"
                  disabled={!newSet.reps}
                  aria-label={t('addSet')}
                >
                  <Plus size={16} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExerciseItem;
