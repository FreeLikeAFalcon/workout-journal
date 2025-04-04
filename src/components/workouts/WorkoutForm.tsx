
import React, { useState } from "react";
import { Exercise, Workout, Set as WorkoutSet } from "@/types/workout";
import { generateId } from "@/utils/workoutUtils";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Plus, Save, X } from "lucide-react";
import ExerciseItem from "./ExerciseItem";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const WorkoutForm: React.FC = () => {
  const { addWorkout } = useWorkout();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split("T")[0]);
  const [program, setProgram] = useState("MAPS Anabolic");
  const [phase, setPhase] = useState("Phase 1");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddExercise = () => {
    if (newExerciseName.trim()) {
      // Create new exercise with an initial empty set to make it valid
      const newExercise: Exercise = {
        id: generateId(),
        name: newExerciseName.trim(),
        sets: [
          { id: generateId(), reps: 0, weight: 0 }
        ],
      };
      setExercises([...exercises, newExercise]);
      setNewExerciseName("");
    }
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter((exercise) => exercise.id !== id));
  };

  const handleAddSet = (exerciseId: string, set: Omit<WorkoutSet, "id">) => {
    setExercises(
      exercises.map((exercise) => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: [
              ...exercise.sets,
              { id: generateId(), ...set },
            ],
          };
        }
        return exercise;
      })
    );
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    setExercises(
      exercises.map((exercise) => {
        if (exercise.id === exerciseId) {
          if (exercise.sets.length <= 1) {
            return exercise;
          }
          return {
            ...exercise,
            sets: exercise.sets.filter((set) => set.id !== setId),
          };
        }
        return exercise;
      })
    );
  };

  const handleUpdateSet = (exerciseId: string, setId: string, field: string, value: number) => {
    setExercises(
      exercises.map((exercise) => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: exercise.sets.map((set) => {
              if (set.id === setId) {
                return { ...set, [field]: value };
              }
              return set;
            }),
          };
        }
        return exercise;
      })
    );
  };

  // Check if form is valid and the save button should be enabled
  const isFormValid = () => {
    // Check if there are exercises
    if (exercises.length === 0) return false;
    
    // Check if at least one exercise has valid sets (reps > 0)
    return exercises.some(exercise => 
      exercise.sets.some(set => set.reps > 0)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isFormValid()) {
      setIsSubmitting(true);
      
      try {
        // Filter out any empty sets (reps = 0) before saving
        const validExercises = exercises.map(exercise => ({
          ...exercise,
          sets: exercise.sets.filter(set => set.reps > 0)
        })).filter(exercise => exercise.sets.length > 0);
        
        const newWorkout: Omit<Workout, "id"> = {
          date: new Date(workoutDate).toISOString(),
          program,
          phase,
          exercises: validExercises,
        };
        
        await addWorkout(newWorkout);
        
        setWorkoutDate(new Date().toISOString().split("T")[0]);
        setProgram("MAPS Anabolic");
        setPhase("Phase 1");
        setExercises([]);
        setIsFormVisible(false);
        
        toast({
          title: "Workout gespeichert",
          description: `Dein Workout für ${new Date(workoutDate).toLocaleDateString('de-DE')} wurde erfolgreich gespeichert.`,
        });
      } catch (error) {
        console.error("Fehler beim Speichern des Workouts:", error);
        toast({
          title: "Fehler",
          description: "Beim Speichern des Workouts ist ein Fehler aufgetreten.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast({
        title: "Ungültiges Workout",
        description: "Bitte füge mindestens eine Übung mit einem Satz hinzu.",
        variant: "destructive",
      });
    }
  };

  const toggleForm = () => {
    setIsFormVisible(!isFormVisible);
  };

  return (
    <div className="mb-8 animate-slide-up">
      {!isFormVisible ? (
        <Button
          onClick={toggleForm}
          className="glass-card flex items-center justify-center w-full p-4 gap-2 rounded-xl text-primary font-medium hover:shadow-md transition-all"
        >
          <Plus size={18} />
          Neues Workout erfassen
        </Button>
      ) : (
        <div className="glass-card rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Neues Workout erfassen</h2>
            <button
              onClick={toggleForm}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Datum</label>
                <input
                  type="date"
                  value={workoutDate}
                  onChange={(e) => setWorkoutDate(e.target.value)}
                  className="w-full p-2 border border-input rounded-lg bg-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Programm</label>
                <input
                  type="text"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full p-2 border border-input rounded-lg bg-transparent"
                  placeholder="Name des Programms"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Phase</label>
                <input
                  type="text"
                  value={phase}
                  onChange={(e) => setPhase(e.target.value)}
                  className="w-full p-2 border border-input rounded-lg bg-transparent"
                  placeholder="Programmphase"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm text-muted-foreground mb-1">Übungen</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  className="flex-1 p-2 border border-input rounded-lg bg-transparent"
                  placeholder="Name der Übung"
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
            
            {exercises.length > 0 ? (
              <div className="mb-6">
                {exercises.map((exercise) => (
                  <ExerciseItem
                    key={exercise.id}
                    exercise={exercise}
                    workoutId="temp"
                    onRemoveExercise={handleRemoveExercise}
                    onAddSet={handleAddSet}
                    onRemoveSet={handleRemoveSet}
                    onUpdateSet={handleUpdateSet}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground my-10">
                Füge Übungen zu deinem Workout hinzu
              </div>
            )}
            
            <div className="flex justify-end">
              <Button
                type="submit"
                className="flex items-center gap-2 px-4 py-2"
                disabled={!isFormValid() || isSubmitting}
              >
                <Save size={16} />
                {isSubmitting ? "Wird gespeichert..." : "Workout speichern"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default WorkoutForm;
