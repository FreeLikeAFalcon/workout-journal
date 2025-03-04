
import { Workout, Exercise } from "@/types/workout";
import { toast } from "@/hooks/use-toast";
import { 
  addExerciseToWorkout as addExerciseDb,
  removeExerciseFromWorkout as removeExerciseDb
} from "@/modules/database/workouts/queries";
import { generateId } from "@/utils/workoutUtils";

export const useExerciseOperations = (workouts: Workout[], setWorkouts: React.Dispatch<React.SetStateAction<Workout[]>>) => {
  /**
   * Add a new exercise to a workout
   */
  const addExercise = async (workoutId: string, exercise: Omit<Exercise, "id">): Promise<void> => {
    try {
      // Find the workout
      const workoutIndex = workouts.findIndex(w => w.id === workoutId);
      if (workoutIndex === -1) {
        throw new Error("Workout not found");
      }
      
      // Create a new exercise with a generated ID
      const newExercise: Exercise = { ...exercise, id: generateId() };
      
      // Optimistic update
      const updatedWorkouts = [...workouts];
      updatedWorkouts[workoutIndex] = {
        ...updatedWorkouts[workoutIndex],
        exercises: [...updatedWorkouts[workoutIndex].exercises, newExercise]
      };
      setWorkouts(updatedWorkouts);
      
      // Send to database
      const result = await addExerciseDb(workoutId, exercise);
      
      if (!result.success) {
        // Revert the optimistic update if the API call fails
        setWorkouts(workouts); // Revert to original state
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Error adding exercise:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add exercise",
        variant: "destructive",
      });
    }
  };

  /**
   * Update an existing exercise in a workout
   */
  const updateExercise = async (workoutId: string, exerciseId: string, exercise: Partial<Exercise>): Promise<void> => {
    try {
      // Find the workout and exercise
      const workoutIndex = workouts.findIndex(w => w.id === workoutId);
      if (workoutIndex === -1) {
        throw new Error("Workout not found");
      }
      
      const exerciseIndex = workouts[workoutIndex].exercises.findIndex(e => e.id === exerciseId);
      if (exerciseIndex === -1) {
        throw new Error("Exercise not found");
      }
      
      // Optimistic update
      const updatedWorkouts = [...workouts];
      updatedWorkouts[workoutIndex].exercises[exerciseIndex] = {
        ...updatedWorkouts[workoutIndex].exercises[exerciseIndex],
        ...exercise
      };
      setWorkouts(updatedWorkouts);
      
      // TODO: Implement exercise update in database
      // For now we'll just assume it succeeded
    } catch (error: any) {
      console.error("Error updating exercise:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update exercise",
        variant: "destructive",
      });
    }
  };

  /**
   * Delete an exercise from a workout
   */
  const deleteExercise = async (workoutId: string, exerciseId: string): Promise<void> => {
    try {
      // Find the workout
      const workoutIndex = workouts.findIndex(w => w.id === workoutId);
      if (workoutIndex === -1) {
        throw new Error("Workout not found");
      }
      
      // Optimistic update
      const updatedWorkouts = [...workouts];
      updatedWorkouts[workoutIndex] = {
        ...updatedWorkouts[workoutIndex],
        exercises: updatedWorkouts[workoutIndex].exercises.filter(e => e.id !== exerciseId)
      };
      setWorkouts(updatedWorkouts);
      
      // Send to database
      const result = await removeExerciseDb(exerciseId);
      
      if (!result.success) {
        // Revert the optimistic update if the API call fails
        setWorkouts(workouts); // Revert to original state
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Error deleting exercise:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete exercise",
        variant: "destructive",
      });
    }
  };

  return {
    addExercise,
    updateExercise,
    deleteExercise
  };
};
