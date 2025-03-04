
import React, { useState } from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Exercise } from "@/types/workout";
import WorkoutHeader from "./WorkoutHeader";
import WorkoutFormFields from "./WorkoutFormFields";
import ExerciseForm from "./ExerciseForm";
import { useLanguage } from "@/contexts/LanguageContext";

const WorkoutForm: React.FC = () => {
  const { addWorkout } = useWorkout();
  const { t } = useLanguage();
  const [isCreating, setIsCreating] = useState(false);
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [program, setProgram] = useState("");
  const [phase, setPhase] = useState("");
  const [exercises, setExercises] = useState<Omit<Exercise, "id">[]>([]);

  const resetForm = () => {
    setWorkoutDate(new Date().toISOString().split('T')[0]);
    setProgram("");
    setPhase("");
    setExercises([]);
  };

  const handleClose = () => {
    setIsCreating(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addWorkout({
        date: workoutDate,
        program,
        phase,
        exercises: exercises.map(ex => ({ ...ex, id: "" })),
      });
      
      setIsCreating(false);
      resetForm();
    } catch (error) {
      console.error("Error saving workout:", error);
    }
  };

  const handleAddExercise = (exercise: Omit<Exercise, "id">) => {
    setExercises([...exercises, exercise]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  if (!isCreating) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">{t('addWorkout')}</h2>
        <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed" onClick={() => setIsCreating(true)}>
          <CardContent className="flex justify-center items-center p-10">
            <Button variant="ghost" className="flex items-center gap-2 text-lg">
              <Plus size={24} />
              {t('newWorkout')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">{t('addWorkout')}</h2>
      <Card>
        <CardHeader className="pb-3">
          <WorkoutHeader 
            title={t('newWorkout')} 
            onClose={handleClose} 
          />
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <WorkoutFormFields
              workoutDate={workoutDate}
              setWorkoutDate={setWorkoutDate}
              program={program}
              setProgram={setProgram}
              phase={phase}
              setPhase={setPhase}
            />
            
            <ExerciseForm onAddExercise={handleAddExercise} />
            
            {exercises.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">{t('addedExercises')}</h3>
                <div className="space-y-2">
                  {exercises.map((exercise, index) => (
                    <div 
                      key={index} 
                      className="flex justify-between items-center p-3 bg-accent/10 rounded-md"
                    >
                      <span>{exercise.name}</span>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleRemoveExercise(index)}
                      >
                        {t('remove')}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button type="submit" disabled={!program || !phase || exercises.length === 0}>
                {t('saveWorkout')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutForm;
