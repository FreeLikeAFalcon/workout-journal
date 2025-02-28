
import React, { createContext, useContext, useState, useEffect } from "react";
import { Exercise, Set, Workout } from "@/types/workout";
import { createSampleWorkouts, generateId } from "@/utils/workoutUtils";
import { toast } from "@/hooks/use-toast";

interface WorkoutContextType {
  workouts: Workout[];
  addWorkout: (workout: Omit<Workout, "id">) => void;
  deleteWorkout: (id: string) => void;
  updateWorkout: (workout: Workout) => void;
  clearAllWorkouts: () => void;
  addExerciseToWorkout: (workoutId: string, exercise: Omit<Exercise, "id">) => void;
  removeExerciseFromWorkout: (workoutId: string, exerciseId: string) => void;
  addSetToExercise: (workoutId: string, exerciseId: string, set: Omit<Set, "id">) => void;
  removeSetFromExercise: (workoutId: string, exerciseId: string, setId: string) => void;
  updateSet: (workoutId: string, exerciseId: string, set: Set) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  // Load workouts from localStorage on initial load
  useEffect(() => {
    const savedWorkouts = localStorage.getItem("workouts");
    if (savedWorkouts) {
      try {
        setWorkouts(JSON.parse(savedWorkouts));
      } catch (error) {
        console.error("Failed to parse workouts from localStorage:", error);
        // If parsing fails, use sample data
        setWorkouts(createSampleWorkouts());
      }
    } else {
      // Use sample data for first-time users
      setWorkouts(createSampleWorkouts());
    }
  }, []);

  // Save workouts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("workouts", JSON.stringify(workouts));
  }, [workouts]);

  const addWorkout = (workout: Omit<Workout, "id">) => {
    const newWorkout = {
      ...workout,
      id: generateId(),
    };
    setWorkouts((prev) => [...prev, newWorkout]);
    toast({
      title: "Workout added",
      description: `Your workout for ${new Date(workout.date).toLocaleDateString()} has been saved.`,
    });
  };

  const deleteWorkout = (id: string) => {
    setWorkouts((prev) => prev.filter((workout) => workout.id !== id));
    toast({
      title: "Workout deleted",
      description: "Your workout has been removed.",
    });
  };

  const updateWorkout = (workout: Workout) => {
    setWorkouts((prev) =>
      prev.map((w) => (w.id === workout.id ? workout : w))
    );
    toast({
      title: "Workout updated",
      description: "Your changes have been saved.",
    });
  };

  const clearAllWorkouts = () => {
    setWorkouts([]);
    toast({
      title: "All workouts cleared",
      description: "Your workout history has been reset.",
    });
  };

  const addExerciseToWorkout = (workoutId: string, exercise: Omit<Exercise, "id">) => {
    const newExercise = {
      ...exercise,
      id: generateId(),
    };
    setWorkouts((prev) =>
      prev.map((workout) => {
        if (workout.id === workoutId) {
          return {
            ...workout,
            exercises: [...workout.exercises, newExercise],
          };
        }
        return workout;
      })
    );
  };

  const removeExerciseFromWorkout = (workoutId: string, exerciseId: string) => {
    setWorkouts((prev) =>
      prev.map((workout) => {
        if (workout.id === workoutId) {
          return {
            ...workout,
            exercises: workout.exercises.filter((ex) => ex.id !== exerciseId),
          };
        }
        return workout;
      })
    );
  };

  const addSetToExercise = (workoutId: string, exerciseId: string, set: Omit<Set, "id">) => {
    const newSet = {
      ...set,
      id: generateId(),
    };
    setWorkouts((prev) =>
      prev.map((workout) => {
        if (workout.id === workoutId) {
          return {
            ...workout,
            exercises: workout.exercises.map((exercise) => {
              if (exercise.id === exerciseId) {
                return {
                  ...exercise,
                  sets: [...exercise.sets, newSet],
                };
              }
              return exercise;
            }),
          };
        }
        return workout;
      })
    );
  };

  const removeSetFromExercise = (workoutId: string, exerciseId: string, setId: string) => {
    setWorkouts((prev) =>
      prev.map((workout) => {
        if (workout.id === workoutId) {
          return {
            ...workout,
            exercises: workout.exercises.map((exercise) => {
              if (exercise.id === exerciseId) {
                return {
                  ...exercise,
                  sets: exercise.sets.filter((s) => s.id !== setId),
                };
              }
              return exercise;
            }),
          };
        }
        return workout;
      })
    );
  };

  const updateSet = (workoutId: string, exerciseId: string, set: Set) => {
    setWorkouts((prev) =>
      prev.map((workout) => {
        if (workout.id === workoutId) {
          return {
            ...workout,
            exercises: workout.exercises.map((exercise) => {
              if (exercise.id === exerciseId) {
                return {
                  ...exercise,
                  sets: exercise.sets.map((s) => (s.id === set.id ? set : s)),
                };
              }
              return exercise;
            }),
          };
        }
        return workout;
      })
    );
  };

  return (
    <WorkoutContext.Provider
      value={{
        workouts,
        addWorkout,
        deleteWorkout,
        updateWorkout,
        clearAllWorkouts,
        addExerciseToWorkout,
        removeExerciseFromWorkout,
        addSetToExercise,
        removeSetFromExercise,
        updateSet,
      }}
    >
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
