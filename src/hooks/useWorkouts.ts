
import { useState, useEffect, useCallback } from "react";
import { Workout, Exercise, Set } from "@/modules/database/workouts/types";
import { 
  fetchWorkouts, 
  addWorkout as addWorkoutToDb,
  deleteWorkout as deleteWorkoutFromDb,
  updateWorkout as updateWorkoutInDb,
  clearAllWorkouts as clearAllWorkoutsFromDb,
  addExerciseToWorkout as addExerciseToWorkoutInDb,
  removeExerciseFromWorkout,
  addSetToExercise,
  removeSetFromExercise,
  updateSet as updateSetInDb
} from "@/modules/database/workouts/queries";
import { createSampleWorkouts, generateId } from "@/utils/workoutUtils";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const { user } = useAuth();

  // Load workouts from database or localStorage
  useEffect(() => {
    const loadWorkouts = async () => {
      if (user) {
        const userWorkouts = await fetchWorkouts(user.id);
        if (userWorkouts.length > 0) {
          setWorkouts(userWorkouts);
        } else {
          // If no workouts found, create sample workouts
          const sampleWorkouts = createSampleWorkouts();
          for (const workout of sampleWorkouts) {
            await addWorkoutToDb(workout, user.id);
          }
          const refreshedWorkouts = await fetchWorkouts(user.id);
          setWorkouts(refreshedWorkouts);
        }
      } else {
        // Use localStorage for non-authenticated users
        const savedWorkouts = localStorage.getItem("workouts");
        if (savedWorkouts) {
          try {
            setWorkouts(JSON.parse(savedWorkouts));
          } catch (error) {
            console.error("Failed to parse workouts from localStorage:", error);
            setWorkouts(createSampleWorkouts());
          }
        } else {
          setWorkouts(createSampleWorkouts());
        }
      }
    };

    loadWorkouts();
  }, [user]);

  // Save to localStorage for non-authenticated users
  useEffect(() => {
    if (!user && workouts.length > 0) {
      localStorage.setItem("workouts", JSON.stringify(workouts));
    }
  }, [workouts, user]);

  // Add a new workout
  const addWorkout = useCallback(async (workout: Omit<Workout, "id">) => {
    const newWorkoutId = generateId();
    const newWorkout = {
      ...workout,
      id: newWorkoutId,
    };

    // Optimistically update UI
    setWorkouts(prev => [...prev, newWorkout]);

    if (user) {
      try {
        const result = await addWorkoutToDb(workout, user.id);

        if (!result.success) {
          console.error("Error adding workout:", result.error);
          // Refresh workouts from database in case of error
          const userWorkouts = await fetchWorkouts(user.id);
          setWorkouts(userWorkouts);
          
          toast({
            title: "Workout not added",
            description: "There was an error saving your workout.",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        console.error("Error in addWorkout:", error);
      }
    }

    toast({
      title: "Workout added",
      description: `Your workout for ${new Date(workout.date).toLocaleDateString()} has been saved.`,
    });
  }, [user]);

  // Delete a workout
  const deleteWorkout = useCallback(async (id: string) => {
    // Optimistically update UI
    setWorkouts(prev => prev.filter(workout => workout.id !== id));

    if (user) {
      try {
        const result = await deleteWorkoutFromDb(id);

        if (!result.success) {
          console.error("Error deleting workout:", result.error);
          // Refresh workouts from database in case of error
          const userWorkouts = await fetchWorkouts(user.id);
          setWorkouts(userWorkouts);
          
          toast({
            title: "Error",
            description: "Failed to delete workout.",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        console.error("Error in deleteWorkout:", error);
      }
    }

    toast({
      title: "Workout deleted",
      description: "Your workout has been removed.",
    });
  }, [user]);

  // Update a workout
  const updateWorkout = useCallback(async (workout: Workout) => {
    // Optimistically update UI
    setWorkouts(prev =>
      prev.map(w => (w.id === workout.id ? workout : w))
    );

    if (user) {
      try {
        const result = await updateWorkoutInDb(workout);

        if (!result.success) {
          console.error("Error updating workout:", result.error);
          // Refresh workouts from database in case of error
          const userWorkouts = await fetchWorkouts(user.id);
          setWorkouts(userWorkouts);
          return;
        }
      } catch (error) {
        console.error("Error in updateWorkout:", error);
      }
    }

    toast({
      title: "Workout updated",
      description: "Your changes have been saved.",
    });
  }, [user]);

  // Clear all workouts
  const clearAllWorkouts = useCallback(async () => {
    // Optimistically update UI
    setWorkouts([]);

    if (user) {
      try {
        const result = await clearAllWorkoutsFromDb(user.id);

        if (!result.success) {
          console.error("Error clearing workouts:", result.error);
          // Refresh workouts from database in case of error
          const userWorkouts = await fetchWorkouts(user.id);
          setWorkouts(userWorkouts);
          
          toast({
            title: "Error",
            description: "Failed to clear workouts.",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        console.error("Error in clearAllWorkouts:", error);
      }
    }

    toast({
      title: "All workouts cleared",
      description: "Your workout history has been reset.",
    });
  }, [user]);

  // Add an exercise to a workout
  const addExerciseToWorkout = useCallback(async (workoutId: string, exercise: Omit<Exercise, "id">) => {
    const newExerciseId = generateId();
    const newExercise = {
      ...exercise,
      id: newExerciseId,
    };

    // Optimistically update UI
    setWorkouts(prev =>
      prev.map(workout => {
        if (workout.id === workoutId) {
          return {
            ...workout,
            exercises: [...workout.exercises, newExercise],
          };
        }
        return workout;
      })
    );

    if (user) {
      try {
        const result = await addExerciseToWorkoutInDb(workoutId, exercise);

        if (!result.success) {
          console.error("Error adding exercise:", result.error);
          // Refresh workouts from database in case of error
          const userWorkouts = await fetchWorkouts(user.id);
          setWorkouts(userWorkouts);
          return;
        }
      } catch (error) {
        console.error("Error in addExerciseToWorkout:", error);
      }
    }
  }, [user]);

  // Remove an exercise from a workout
  const removeExerciseFromWorkout = useCallback(async (workoutId: string, exerciseId: string) => {
    // Optimistically update UI
    setWorkouts(prev =>
      prev.map(workout => {
        if (workout.id === workoutId) {
          return {
            ...workout,
            exercises: workout.exercises.filter(ex => ex.id !== exerciseId),
          };
        }
        return workout;
      })
    );

    if (user) {
      try {
        const result = await removeExerciseFromWorkout(exerciseId);

        if (!result.success) {
          console.error("Error removing exercise:", result.error);
          // Refresh workouts from database in case of error
          const userWorkouts = await fetchWorkouts(user.id);
          setWorkouts(userWorkouts);
          return;
        }
      } catch (error) {
        console.error("Error in removeExerciseFromWorkout:", error);
      }
    }
  }, [user]);

  // Add a set to an exercise
  const addSetToExercise = useCallback(async (workoutId: string, exerciseId: string, set: Omit<Set, "id">) => {
    const newSetId = generateId();
    const newSet = {
      ...set,
      id: newSetId,
    };

    // Optimistically update UI
    setWorkouts(prev =>
      prev.map(workout => {
        if (workout.id === workoutId) {
          return {
            ...workout,
            exercises: workout.exercises.map(exercise => {
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

    if (user) {
      try {
        const result = await addSetToExercise(exerciseId, set);

        if (!result.success) {
          console.error("Error adding set:", result.error);
          // Refresh workouts from database in case of error
          const userWorkouts = await fetchWorkouts(user.id);
          setWorkouts(userWorkouts);
          return;
        }
      } catch (error) {
        console.error("Error in addSetToExercise:", error);
      }
    }
  }, [user]);

  // Remove a set from an exercise
  const removeSetFromExercise = useCallback(async (workoutId: string, exerciseId: string, setId: string) => {
    // Optimistically update UI
    setWorkouts(prev =>
      prev.map(workout => {
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
      })
    );

    if (user) {
      try {
        const result = await removeSetFromExercise(setId);

        if (!result.success) {
          console.error("Error removing set:", result.error);
          // Refresh workouts from database in case of error
          const userWorkouts = await fetchWorkouts(user.id);
          setWorkouts(userWorkouts);
          return;
        }
      } catch (error) {
        console.error("Error in removeSetFromExercise:", error);
      }
    }
  }, [user]);

  // Update a set
  const updateSet = useCallback(async (workoutId: string, exerciseId: string, set: Set) => {
    // Optimistically update UI
    setWorkouts(prev =>
      prev.map(workout => {
        if (workout.id === workoutId) {
          return {
            ...workout,
            exercises: workout.exercises.map(exercise => {
              if (exercise.id === exerciseId) {
                return {
                  ...exercise,
                  sets: exercise.sets.map(s => (s.id === set.id ? set : s)),
                };
              }
              return exercise;
            }),
          };
        }
        return workout;
      })
    );

    if (user) {
      try {
        const result = await updateSetInDb(set);

        if (!result.success) {
          console.error("Error updating set:", result.error);
          // Refresh workouts from database in case of error
          const userWorkouts = await fetchWorkouts(user.id);
          setWorkouts(userWorkouts);
          return;
        }
      } catch (error) {
        console.error("Error in updateSet:", error);
      }
    }
  }, [user]);

  return {
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
  };
}
