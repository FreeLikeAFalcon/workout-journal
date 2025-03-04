
import { Workout, Set } from "@/types/workout";
import { toast } from "@/hooks/use-toast";
import { 
  addSetToExercise as addSetDb,
  removeSetFromExercise as removeSetDb,
  updateSet as updateSetDb
} from "@/modules/database/workouts/queries";
import { generateId } from "@/utils/workoutUtils";

export const useSetOperations = (workouts: Workout[], setWorkouts: React.Dispatch<React.SetStateAction<Workout[]>>) => {
  /**
   * Add a new set to an exercise
   */
  const addSet = async (workoutId: string, exerciseId: string, set: Omit<Set, "id">): Promise<void> => {
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
      
      // Create a new set with a generated ID
      const newSet: Set = { ...set, id: generateId() };
      
      // Optimistic update
      const updatedWorkouts = [...workouts];
      updatedWorkouts[workoutIndex].exercises[exerciseIndex].sets.push(newSet);
      setWorkouts(updatedWorkouts);
      
      // Send to database
      const result = await addSetDb(exerciseId, set);
      
      if (!result.success) {
        // Revert the optimistic update if the API call fails
        setWorkouts(workouts); // Revert to original state
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Error adding set:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add set",
        variant: "destructive",
      });
    }
  };

  /**
   * Update an existing set in an exercise
   */
  const updateSet = async (workoutId: string, exerciseId: string, setId: string, setUpdate: Partial<Set>): Promise<void> => {
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
      
      const setIndex = workouts[workoutIndex].exercises[exerciseIndex].sets.findIndex(s => s.id === setId);
      if (setIndex === -1) {
        throw new Error("Set not found");
      }
      
      // Get the complete set by combining the existing set with the updates
      const updatedSet: Set = {
        ...workouts[workoutIndex].exercises[exerciseIndex].sets[setIndex],
        ...setUpdate
      };
      
      // Optimistic update
      const updatedWorkouts = [...workouts];
      updatedWorkouts[workoutIndex].exercises[exerciseIndex].sets[setIndex] = updatedSet;
      setWorkouts(updatedWorkouts);
      
      // Send to database
      const result = await updateSetDb(updatedSet);
      
      if (!result.success) {
        // Revert the optimistic update if the API call fails
        setWorkouts(workouts); // Revert to original state
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Error updating set:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update set",
        variant: "destructive",
      });
    }
  };

  /**
   * Delete a set from an exercise
   */
  const deleteSet = async (workoutId: string, exerciseId: string, setId: string): Promise<void> => {
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
      updatedWorkouts[workoutIndex].exercises[exerciseIndex].sets = 
        updatedWorkouts[workoutIndex].exercises[exerciseIndex].sets.filter(s => s.id !== setId);
      setWorkouts(updatedWorkouts);
      
      // Send to database
      const result = await removeSetDb(setId);
      
      if (!result.success) {
        // Revert the optimistic update if the API call fails
        setWorkouts(workouts); // Revert to original state
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Error deleting set:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete set",
        variant: "destructive",
      });
    }
  };

  return {
    addSet,
    updateSet,
    deleteSet
  };
};
