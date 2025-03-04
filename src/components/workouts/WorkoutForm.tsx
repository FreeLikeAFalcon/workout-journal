
import React, { useState } from "react";
import { Exercise, Workout, Set as WorkoutSet } from "@/modules/database/workouts/types";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Plus, Save } from "lucide-react";
import ExerciseItem from "./ExerciseItem";
import ExerciseForm from "./ExerciseForm";
import WorkoutHeader from "./WorkoutHeader";
import WorkoutFormFields from "./WorkoutFormFields";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { generateId } from "@/utils/workoutUtils";

const WorkoutForm: React.FC = () => {
  const { addWorkout } = useWorkout();
  const { t } = useLanguage();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split("T")[0]);
  const [program, setProgram] = useState("MAPS Anabolic");
  const [phase, setPhase] = useState("Phase 1");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleForm = () => {
    setIsFormVisible(!isFormVisible);
  };

  const handleAddExercise = (exercise: Omit<Exercise, "id">) => {
    const newExercise: Exercise = {
      id: generateId(),
      ...exercise,
    };
    setExercises([...exercises, newExercise]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only save if there are exercises with sets
    if (exercises.length > 0 && exercises.some(ex => ex.sets.length > 0)) {
      setIsSubmitting(true);
      
      try {
        const newWorkout: Omit<Workout, "id"> = {
          date: new Date(workoutDate).toISOString(),
          program,
          phase,
          exercises,
        };
        
        await addWorkout(newWorkout);
        
        // Reset form
        setWorkoutDate(new Date().toISOString().split("T")[0]);
        setProgram("MAPS Anabolic");
        setPhase("Phase 1");
        setExercises([]);
        setIsFormVisible(false);
        
        toast({
          title: t('workoutSaved'),
          description: t('workoutSavedDesc', { date: new Date(workoutDate).toLocaleDateString() }),
        });
      } catch (error) {
        console.error("Error saving workout:", error);
        toast({
          title: t('error'),
          description: t('errorSavingWorkout'),
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isFormVisible) {
    return (
      <Button
        onClick={toggleForm}
        className="glass-card flex items-center justify-center w-full p-4 gap-2 rounded-xl text-primary font-medium hover:shadow-md transition-all mb-8 animate-slide-up"
      >
        <Plus size={18} />
        {t('newWorkout')}
      </Button>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6 mb-8 animate-slide-up">
      <WorkoutHeader 
        title={t('newWorkout')} 
        onClose={toggleForm} 
      />
      
      <form onSubmit={handleSubmit}>
        {/* Workout Fields */}
        <WorkoutFormFields 
          workoutDate={workoutDate}
          setWorkoutDate={setWorkoutDate}
          program={program}
          setProgram={setProgram}
          phase={phase}
          setPhase={setPhase}
        />
        
        {/* Exercise Form */}
        <ExerciseForm onAddExercise={handleAddExercise} />
        
        {/* Exercise List */}
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
            {t('addExercisesToWorkout')}
          </div>
        )}
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="flex items-center gap-2 px-4 py-2"
            disabled={!exercises.length || !exercises.some(ex => ex.sets.length > 0) || isSubmitting}
          >
            <Save size={16} />
            {isSubmitting ? t('saving') : t('saveWorkout')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WorkoutForm;
