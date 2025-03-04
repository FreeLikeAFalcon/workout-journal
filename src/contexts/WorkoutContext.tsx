
import React, { createContext, useContext } from "react";
import { Exercise, Set, Workout } from "@/modules/database/workouts/types";
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
  const workoutManager = useWorkouts();
  
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
