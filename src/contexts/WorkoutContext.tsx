
import React, { createContext, useContext } from "react";
import { Exercise, Set, Workout } from "@/types/workout";
import { useWorkouts } from "@/hooks/useWorkouts";

interface WorkoutContextType {
  workouts: Workout[];
  addWorkout: (workout: Omit<Workout, "id">) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  updateWorkout: (workout: Workout) => Promise<void>;
  clearAllWorkouts: () => Promise<void>;
  addExerciseToWorkout: (workoutId: string, exercise: Omit<Exercise, "id">) => Promise<void>;
  removeExerciseFromWorkout: (workoutId: string, exerciseId: string) => Promise<void>;
  addSetToExercise: (workoutId: string, exerciseId: string, set: Omit<Set, "id">) => Promise<void>;
  removeSetFromExercise: (workoutId: string, exerciseId: string, setId: string) => Promise<void>;
  updateSet: (workoutId: string, exerciseId: string, set: Set) => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    workouts,
    addWorkout: addWorkoutHook,
    deleteWorkout: deleteWorkoutHook,
    updateWorkout: updateWorkoutHook,
    addExercise,
    deleteExercise,
    addSet,
    deleteSet,
    updateSet: updateSetHook,
  } = useWorkouts();
  
  // Create adapter functions to match the expected interface
  const addExerciseToWorkout = async (workoutId: string, exercise: Omit<Exercise, "id">) => {
    return addExercise(workoutId, exercise);
  };
  
  const removeExerciseFromWorkout = async (workoutId: string, exerciseId: string) => {
    return deleteExercise(workoutId, exerciseId);
  };
  
  const addSetToExercise = async (workoutId: string, exerciseId: string, set: Omit<Set, "id">) => {
    return addSet(workoutId, exerciseId, set);
  };
  
  const removeSetFromExercise = async (workoutId: string, exerciseId: string, setId: string) => {
    return deleteSet(workoutId, exerciseId, setId);
  };
  
  const updateSet = async (workoutId: string, exerciseId: string, set: Set) => {
    return updateSetHook(workoutId, exerciseId, set.id, set);
  };
  
  const updateWorkout = async (workout: Workout) => {
    return updateWorkoutHook(workout.id, workout);
  };
  
  const clearAllWorkouts = async () => {
    // Implement clear all functionality - for now just log
    console.log("Clear all workouts - Not implemented yet");
    return Promise.resolve();
  };
  
  const workoutManager: WorkoutContextType = {
    workouts,
    addWorkout: addWorkoutHook,
    deleteWorkout: deleteWorkoutHook,
    updateWorkout,
    clearAllWorkouts,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    addSetToExercise,
    removeSetFromExercise,
    updateSet,
  };
  
  return (
    <WorkoutContext.Provider value={workoutManager}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
};
