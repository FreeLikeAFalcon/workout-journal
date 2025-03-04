
import { useState, useEffect } from "react";
import { Workout, Exercise, Set, WorkoutStats, ChartData } from "@/types/workout";
import { useAuth } from "@/contexts/AuthContext";
import { fetchWorkouts } from "@/modules/database/workouts/queries";
import { calculateWorkoutStats, prepareChartData } from "@/utils/workoutUtils";
import { useWorkoutOperations } from "./workout/useWorkoutOperations";
import { useExerciseOperations } from "./workout/useExerciseOperations";
import { useSetOperations } from "./workout/useSetOperations";

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
  
  // Get operations from separate hooks
  const workoutOps = useWorkoutOperations(workouts, setWorkouts, user?.id);
  const exerciseOps = useExerciseOperations(workouts, setWorkouts);
  const setOps = useSetOperations(workouts, setWorkouts);
  
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

  return {
    workouts,
    isLoading: isLoading || workoutOps.isLoading,
    workoutStats,
    chartData,
    addWorkout: workoutOps.addWorkout,
    updateWorkout: workoutOps.updateWorkout,
    deleteWorkout: workoutOps.deleteWorkout,
    addExercise: exerciseOps.addExercise,
    updateExercise: exerciseOps.updateExercise,
    deleteExercise: exerciseOps.deleteExercise,
    addSet: setOps.addSet,
    updateSet: setOps.updateSet,
    deleteSet: setOps.deleteSet,
  };
};
