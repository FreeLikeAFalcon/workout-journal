
import { useState, useEffect, useCallback } from "react";
import { Workout, Exercise, Set, WorkoutStats, ChartData } from "@/types/workout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { 
  fetchWorkouts, 
  addWorkout as addWorkoutDb, 
  updateWorkout as updateWorkoutDb,
  deleteWorkout as deleteWorkoutDb,
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
      const result = await addWorkoutDb(newWorkout);
      
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
      // Optimistic update
      const updatedWorkouts = workouts.map(w => w.id === id ? { ...w, ...workout } : w);
      setWorkouts(updatedWorkouts);
      
      // Send to database
      const result = await updateWorkoutDb(id, workout);
      
      if (!result.success) {
        // Revert the optimistic update if the API call fails
        const originalWorkout = workouts.find(w => w.id === id);
        if (originalWorkout) {
          setWorkouts(currentWorkouts => 
            currentWorkouts.map(w => w.id === id ? originalWorkout : w)
          );
        }
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
      const newExercise: Exercise = { ...exercise, id: generateId() };
      const updatedWorkouts = workouts.map(workout => {
        if (workout.id === workoutId) {
          return { ...workout, exercises: [...workout.exercises, newExercise] };
        }
        return workout;
      });

      // Optimistic update
      setWorkouts(updatedWorkouts);
      
      // Find the updated workout to pass to the API
      const workoutToUpdate = updatedWorkouts.find(w => w.id === workoutId);
      if (!workoutToUpdate) throw new Error("Workout not found");
      
      // Send to database
      const result = await updateWorkoutDb(workoutId, { 
        exercises: workoutToUpdate.exercises 
      });
      
      if (!result.success) {
        // Revert the optimistic update if the API call fails
        const originalWorkout = workouts.find(w => w.id === workoutId);
        if (originalWorkout) {
          setWorkouts(currentWorkouts => 
            currentWorkouts.map(w => w.id === workoutId ? originalWorkout : w)
          );
        }
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
      // Optimistic update
      const updatedWorkouts = workouts.map(workout => {
        if (workout.id === workoutId) {
          return {
            ...workout,
            exercises: workout.exercises.map(ex => {
              if (ex.id === exerciseId) {
                return { ...ex, ...exercise };
              }
              return ex;
            }),
          };
        }
        return workout;
      });

      setWorkouts(updatedWorkouts);
      
      // Find the updated workout to pass to the API
      const workoutToUpdate = updatedWorkouts.find(w => w.id === workoutId);
      if (!workoutToUpdate) throw new Error("Workout not found");
      
      // Send to database
      const result = await updateWorkoutDb(workoutId, { 
        exercises: workoutToUpdate.exercises 
      });
      
      if (!result.success) {
        // Revert the optimistic update if the API call fails
        const originalWorkout = workouts.find(w => w.id === workoutId);
        if (originalWorkout) {
          setWorkouts(currentWorkouts => 
            currentWorkouts.map(w => w.id === workoutId ? originalWorkout : w)
          );
        }
        throw new Error(result.error);
      }
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
      // Optimistic update
      const updatedWorkouts = workouts.map(workout => {
        if (workout.id === workoutId) {
          return {
            ...workout,
            exercises: workout.exercises.filter(ex => ex.id !== exerciseId),
          };
        }
        return workout;
      });

      setWorkouts(updatedWorkouts);
      
      // Find the updated workout to pass to the API
      const workoutToUpdate = updatedWorkouts.find(w => w.id === workoutId);
      if (!workoutToUpdate) throw new Error("Workout not found");
      
      // Send to database
      const result = await updateWorkoutDb(workoutId, { 
        exercises: workoutToUpdate.exercises 
      });
      
      if (!result.success) {
        // Revert the optimistic update if the API call fails
        const originalWorkout = workouts.find(w => w.id === workoutId);
        if (originalWorkout) {
          setWorkouts(currentWorkouts => 
            currentWorkouts.map(w => w.id === workoutId ? originalWorkout : w)
          );
        }
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
      const newSet: Set = { ...set, id: generateId() };
      // Optimistic update
      const updatedWorkouts = workouts.map(workout => {
        if (workout.id === workoutId) {
          return {
            ...workout,
            exercises: workout.exercises.map(exercise => {
              if (exercise.id === exerciseId) {
                return { 
                  ...exercise, 
                  sets: [...exercise.sets, newSet] 
                };
              }
              return exercise;
            }),
          };
        }
        return workout;
      });
      
      setWorkouts(updatedWorkouts);
      
      // Find the updated workout to pass to the API
      const workoutToUpdate = updatedWorkouts.find(w => w.id === workoutId);
      if (!workoutToUpdate) throw new Error("Workout not found");
      
      // Send to database
      const result = await updateWorkoutDb(workoutId, { 
        exercises: workoutToUpdate.exercises 
      });
      
      if (!result.success) {
        // Revert the optimistic update if the API call fails
        const originalWorkout = workouts.find(w => w.id === workoutId);
        if (originalWorkout) {
          setWorkouts(currentWorkouts => 
            currentWorkouts.map(w => w.id === workoutId ? originalWorkout : w)
          );
        }
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
  const updateSet = async (workoutId: string, exerciseId: string, setId: string, set: Partial<Set>): Promise<void> => {
    try {
      // Optimistic update
      const updatedWorkouts = workouts.map(workout => {
        if (workout.id === workoutId) {
          return {
            ...workout,
            exercises: workout.exercises.map(exercise => {
              if (exercise.id === exerciseId) {
                return {
                  ...exercise,
                  sets: exercise.sets.map(s => {
                    if (s.id === setId) {
                      return { ...s, ...set };
                    }
                    return s;
                  }),
                };
              }
              return exercise;
            }),
          };
        }
        return workout;
      });
      
      setWorkouts(updatedWorkouts);
      
      // Find the updated workout to pass to the API
      const workoutToUpdate = updatedWorkouts.find(w => w.id === workoutId);
      if (!workoutToUpdate) throw new Error("Workout not found");
      
      // Send to database
      const result = await updateWorkoutDb(workoutId, { 
        exercises: workoutToUpdate.exercises 
      });
      
      if (!result.success) {
        // Revert the optimistic update if the API call fails
        const originalWorkout = workouts.find(w => w.id === workoutId);
        if (originalWorkout) {
          setWorkouts(currentWorkouts => 
            currentWorkouts.map(w => w.id === workoutId ? originalWorkout : w)
          );
        }
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
      // Optimistic update
      const updatedWorkouts = workouts.map(workout => {
        if (workout.id === workoutId) {
          return {
            ...workout,
            exercises: workout.exercises.map(exercise => {
              if (exercise.id === exerciseId) {
                return {
                  ...exercise,
                  sets: exercise.sets.filter(s => s.id !== setId),
                };
              }
              return exercise;
            }),
          };
        }
        return workout;
      });
      
      setWorkouts(updatedWorkouts);
      
      // Find the updated workout to pass to the API
      const workoutToUpdate = updatedWorkouts.find(w => w.id === workoutId);
      if (!workoutToUpdate) throw new Error("Workout not found");
      
      // Send to database
      const result = await updateWorkoutDb(workoutId, { 
        exercises: workoutToUpdate.exercises 
      });
      
      if (!result.success) {
        // Revert the optimistic update if the API call fails
        const originalWorkout = workouts.find(w => w.id === workoutId);
        if (originalWorkout) {
          setWorkouts(currentWorkouts => 
            currentWorkouts.map(w => w.id === workoutId ? originalWorkout : w)
          );
        }
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
