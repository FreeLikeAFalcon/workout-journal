
import React, { useState } from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Exercise, Workout } from "@/types/workout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatDate, findPreviousExercise, isPersonalRecord } from "@/utils/workoutUtils";
import ExerciseItem from "./ExerciseItem";
import { useLanguage } from "@/contexts/LanguageContext";
import { Edit2, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

const WorkoutList: React.FC = () => {
  const { workouts, deleteWorkout, addSetToExercise, removeSetFromExercise, updateSet, removeExerciseFromWorkout } = useWorkout();
  const { t } = useLanguage();
  const [expandedWorkouts, setExpandedWorkouts] = useState<string[]>([]);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  // Sort workouts by date (newest first)
  const sortedWorkouts = [...workouts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const toggleEditMode = (workoutId: string) => {
    setEditMode(editMode === workoutId ? null : workoutId);
  };
  
  const handleDeleteWorkout = (workoutId: string) => {
    setDeleteDialog(workoutId);
  };
  
  const confirmDelete = async () => {
    if (deleteDialog) {
      await deleteWorkout(deleteDialog);
      setDeleteDialog(null);
    }
  };
  
  const handleDeleteExercise = async (workoutId: string, exerciseId: string) => {
    await removeExerciseFromWorkout(workoutId, exerciseId);
  };
  
  const handleAddSet = async (workoutId: string, exerciseId: string, set: { reps: number, weight: number }) => {
    await addSetToExercise(workoutId, exerciseId, set);
  };
  
  const handleRemoveSet = async (workoutId: string, exerciseId: string, setId: string) => {
    await removeSetFromExercise(workoutId, exerciseId, setId);
  };
  
  const handleUpdateSet = async (workoutId: string, exerciseId: string, setId: string, newSet: { reps: number, weight: number }) => {
    await updateSet(workoutId, exerciseId, { id: setId, ...newSet });
  };
  
  const toggleWorkoutExpansion = (workoutId: string) => {
    setExpandedWorkouts(prevExpanded => 
      prevExpanded.includes(workoutId) 
        ? prevExpanded.filter(id => id !== workoutId) 
        : [...prevExpanded, workoutId]
    );
  };

  return (
    <div className="space-y-6">
      {sortedWorkouts.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              <p>{t('workout.noWorkouts')}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" defaultValue={[]} value={expandedWorkouts} className="space-y-4">
          {sortedWorkouts.map((workout) => (
            <AccordionItem key={workout.id} value={workout.id} className="border border-border rounded-md overflow-hidden">
              <div className="flex justify-between items-center p-4">
                <div className="flex-1">
                  <AccordionTrigger 
                    onClick={() => toggleWorkoutExpansion(workout.id)} 
                    className="hover:no-underline py-0 [&[data-state=open]>svg]:rotate-180"
                  >
                    <div className="flex flex-col items-start">
                      <h3 className="text-lg font-semibold">{workout.program}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDate(workout.date)}</span>
                        <span>•</span>
                        <span>{workout.phase}</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleEditMode(workout.id);
                    }}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWorkout(workout.id);
                    }}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
              
              <AccordionContent className="pb-4 px-4">
                <div className="space-y-4 mt-2">
                  {workout.exercises.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      <p>{t('workout.noExercises')}</p>
                    </div>
                  ) : (
                    workout.exercises.map((exercise: Exercise) => {
                      // Find previous exercise for comparison (if any)
                      const previousExercise = findPreviousExercise(exercise.name, workouts);
                      const isPR = previousExercise ? isPersonalRecord(exercise, previousExercise) : false;
                      
                      return (
                        <ExerciseItem
                          key={exercise.id}
                          exercise={exercise}
                          workoutId={workout.id}
                          isPersonalRecord={isPR}
                          isEditMode={editMode === workout.id}
                          onRemoveExercise={() => handleDeleteExercise(workout.id, exercise.id)}
                          onAddSet={(set) => handleAddSet(workout.id, exercise.id, set)}
                          onRemoveSet={(setId) => handleRemoveSet(workout.id, exercise.id, setId)}
                          onUpdateSet={(setId, newSet) => handleUpdateSet(workout.id, exercise.id, setId, newSet)}
                        />
                      );
                    })
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
      
      {/* Confirm delete dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('workout.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('workout.deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkoutList;
