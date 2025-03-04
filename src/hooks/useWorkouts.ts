
import { useState, useEffect } from "react";
import { Workout, Exercise, Set, WorkoutStats, ChartData } from "@/types/workout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { 
  fetchWorkouts, 
  addWorkout as addWorkoutDb, 
  updateWorkout as updateWorkoutDb,
  deleteWorkout as deleteWorkoutDb,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  addSetToExercise,
  removeSetFromExercise,
  updateSet as updateSetDb
} from "@/modules/database/workouts/queries";
import { generateId, calculateWorkoutStats, prepareChartData } from "@/utils/workoutUtils";

export interface UseWorkoutsReturn {
  workouts: Workout[];
  isLoading: boolean;
  workoutStats: WorkoutStats;
  chartData: ChartData;
  addWorkout: (workout: Omit<Workout, "id">) => Promise<void>;
  updateWorkout: (id: string, workout: Partial<Workout>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  addExercise: (workoutId: string, exercise: Omit<Exercise, "id">) => Promise<void>;
  updateExercise: (workoutId: string, exerciseId: string, exercise: Partial<Exercise>) => Promise<void>;
  deleteExercise: (workoutId: string, exerciseId: string) => Promise<void>;
  addSet: (workoutId: string, exerciseId: string, set: Omit<Set, "id">) => Promise<void>;
  updateSet: (workoutId: string, exerciseId: string, setId: string, set: Partial<Set>) => Promise<void>;
  deleteSet: (workoutId: string, exerciseId: string, setId: string) => Promise<void>;
}

export const useWorkouts = (): UseWorkoutsReturn => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate derived stats whenever workouts change
  const workoutStats = calculateWorkoutStats(workouts);
  const chartData = prepareChartData(workouts);

  // Fetch workouts from the database
  useEffect(() => {
    const loadWorkouts = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const fetchedWorkouts = await fetchWorkouts(user.id);
          setWorkouts(fetchedWorkouts);
        } catch (error) {
          console.error("Failed to fetch workouts:", error);
          toast({
            title: "Error",
            description: "Failed to fetch workouts",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setWorkouts([]);
        setIsLoading(false);
      }
    };

    loadWorkouts();
  }, [user]);

  /**
   * Add a new workout
   */
  const addWorkout = async (workout: Omit<Workout, "id">): Promise<void> => {
    if (!user) return;
    
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
      const result = await addWorkoutDb(newWorkout, user.id);
      
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
      const result = await addExerciseToWorkout(workoutId, exercise);
      
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
      
      // If it fails, we would revert:
      // setWorkouts(workouts);
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
      const result = await removeExerciseFromWorkout(exerciseId);
      
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
      const result = await addSetToExercise(exerciseId, set);
      
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
      const result = await removeSetFromExercise(setId);
      
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
    workouts,
    isLoading,
    workoutStats,
    chartData,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    addExercise,
    updateExercise,
    deleteExercise,
    addSet,
    updateSet,
    deleteSet,
  };
};
