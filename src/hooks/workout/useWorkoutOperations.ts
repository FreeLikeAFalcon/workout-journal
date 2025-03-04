
import { useState } from "react";
import { Workout } from "@/types/workout";
import { toast } from "@/hooks/use-toast";
import { 
  addWorkout as addWorkoutDb, 
  updateWorkout as updateWorkoutDb,
  deleteWorkout as deleteWorkoutDb
} from "@/modules/database/workouts/queries";
import { generateId } from "@/utils/workoutUtils";

export const useWorkoutOperations = (workouts: Workout[], setWorkouts: React.Dispatch<React.SetStateAction<Workout[]>>, userId?: string) => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Add a new workout
   */
  const addWorkout = async (workout: Omit<Workout, "id">): Promise<void> => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      // Create a new workout with a generated ID
      const newWorkout: Workout = { 
        ...workout, 
        id: generateId()
      };
      
      // Optimistic update
      setWorkouts(currentWorkouts => [...currentWorkouts, newWorkout]);
      
      // Send to database
      const result = await addWorkoutDb(newWorkout, userId);
      
      if (!result.success) {
        // Revert the optimistic update if the API call fails
        setWorkouts(currentWorkouts => currentWorkouts.filter(w => w.id !== newWorkout.id));
        throw new Error(result.error);
      }
      
      toast({
        title: "Workout added",
        description: "Your new workout has been added successfully.",
      });
    } catch (error: any) {
      console.error("Error adding workout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add workout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update an existing workout
   */
  const updateWorkout = async (id: string, workout: Partial<Workout>): Promise<void> => {
    try {
      // Find the existing workout
      const existingWorkout = workouts.find(w => w.id === id);
      if (!existingWorkout) {
        throw new Error("Workout not found");
      }
      
      // Optimistic update
      const updatedWorkout = { ...existingWorkout, ...workout };
      setWorkouts(currentWorkouts => 
        currentWorkouts.map(w => w.id === id ? updatedWorkout : w)
      );
      
      // Send to database
      const result = await updateWorkoutDb(updatedWorkout);
      
      if (!result.success) {
        // Revert the optimistic update if the API call fails
        setWorkouts(currentWorkouts => 
          currentWorkouts.map(w => w.id === id ? existingWorkout : w)
        );
        throw new Error(result.error);
      }
      
      toast({
        title: "Workout updated",
        description: "Your workout has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating workout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update workout",
        variant: "destructive",
      });
    }
  };

  /**
   * Delete a workout
   */
  const deleteWorkout = async (id: string): Promise<void> => {
    try {
      // Optimistic delete
      const workoutToDelete = workouts.find(w => w.id === id);
      setWorkouts(currentWorkouts => currentWorkouts.filter(w => w.id !== id));
      
      // Send to database
      const result = await deleteWorkoutDb(id);
      
      if (!result.success) {
        // Revert the optimistic update if the API call fails
        if (workoutToDelete) {
          setWorkouts(currentWorkouts => [...currentWorkouts, workoutToDelete]);
        }
        throw new Error(result.error);
      }
      
      toast({
        title: "Workout deleted",
        description: "Your workout has been deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting workout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete workout",
        variant: "destructive",
      });
    }
  };

  return {
    isLoading,
    addWorkout,
    updateWorkout,
    deleteWorkout
  };
};
