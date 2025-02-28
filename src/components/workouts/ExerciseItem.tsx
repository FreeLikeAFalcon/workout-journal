import React, { useState } from "react";
import { Exercise, Set } from "@/types/workout";
import { calculateExerciseVolume, generateId, lbsToKg } from "@/utils/workoutUtils";
import { Trash, Plus, ChevronDown, ChevronUp, Activity } from "lucide-react";
import { useWorkout } from "@/contexts/WorkoutContext";

interface ExerciseItemProps {
  exercise: Exercise;
  workoutId: string;
  isPersonalRecord?: boolean;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ exercise, workoutId, isPersonalRecord = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newSet, setNewSet] = useState<Omit<Set, "id">>({ reps: 0, weight: 0 });
  const { removeExerciseFromWorkout, addSetToExercise, removeSetFromExercise, updateSet } = useWorkout();

  const maxWeightSet = isPersonalRecord ? 
    [...exercise.sets].sort((a, b) => b.weight - a.weight)[0] : null;

  const handleAddSet = () => {
    if (newSet.reps > 0) {
      addSetToExercise(workoutId, exercise.id, newSet);
      setNewSet({ reps: 0, weight: 0 });
    }
  };

  const handleUpdateSet = (setId: string, field: keyof Set, value: number) => {
    const setToUpdate = exercise.sets.find(s => s.id === setId);
    if (setToUpdate) {
      updateSet(workoutId, exercise.id, {
        ...setToUpdate,
        [field]: value
      });
    }
  };

  const totalVolume = calculateExerciseVolume(exercise);

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
              PR
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground hidden sm:block">
            Gesamtvolumen: <span className="font-medium">{lbsToKg(totalVolume).toFixed(1)} kg</span>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              removeExerciseFromWorkout(workoutId, exercise.id);
            }}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash size={16} />
          </button>
          
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="pb-2 font-medium">Satz</th>
                  <th className="pb-2 font-medium">Wdh</th>
                  <th className="pb-2 font-medium">Gewicht (kg)</th>
                  <th className="pb-2 font-medium">Volumen</th>
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
                          onChange={(e) => handleUpdateSet(set.id, "reps", parseInt(e.target.value) || 0)}
                          className={`w-16 p-1 border border-input rounded bg-transparent ${isPRSet ? "font-bold text-accent" : ""}`}
                          min="0"
                        />
                      </td>
                      <td className="py-2">
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => handleUpdateSet(set.id, "weight", parseInt(e.target.value) || 0)}
                          className={`w-20 p-1 border border-input rounded bg-transparent ${isPRSet ? "font-bold text-accent" : ""}`}
                          min="0"
                        />
                      </td>
                      <td className={`py-2 text-sm ${isPRSet ? "font-bold text-accent" : ""}`}>
                        {lbsToKg(set.reps * set.weight).toFixed(1)} kg
                      </td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => removeSetFromExercise(workoutId, exercise.id, set.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
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
                      placeholder="Wdh"
                      min="0"
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      value={newSet.weight || ''}
                      onChange={(e) => setNewSet({ ...newSet, weight: parseInt(e.target.value) || 0 })}
                      className="w-20 p-1 border border-input rounded bg-transparent"
                      placeholder="Gewicht"
                      min="0"
                    />
                  </td>
                  <td className="py-2 text-sm">{lbsToKg((newSet.reps || 0) * (newSet.weight || 0)).toFixed(1)} kg</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={handleAddSet}
                      className="text-accent hover:text-accent/80 disabled:text-muted-foreground transition-colors"
                      disabled={!newSet.reps}
                    >
                      <Plus size={16} />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseItem;
