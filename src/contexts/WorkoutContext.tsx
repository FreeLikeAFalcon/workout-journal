
import React, { createContext, useContext, useState, useEffect } from "react";
import { Exercise, Set, Workout } from "@/types/workout";
import { createSampleWorkouts, generateId } from "@/utils/workoutUtils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();

  // Load workouts when user logs in
  useEffect(() => {
    if (user) {
      fetchWorkouts();
    } else {
      // If no user is logged in, use localStorage as fallback
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
    }
  }, [user]);

  // Save workouts to localStorage when not logged in
  useEffect(() => {
    if (!user && workouts.length > 0) {
      localStorage.setItem("workouts", JSON.stringify(workouts));
    }
  }, [workouts, user]);

  const fetchWorkouts = async () => {
    try {
      // Fetch workouts
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      if (workoutsError) {
        console.error("Error fetching workouts:", workoutsError);
        return;
      }

      if (!workoutsData || workoutsData.length === 0) {
        // If no workouts found, create sample workouts in database
        if (user) {
          const sampleWorkouts = createSampleWorkouts().map(workout => ({
            ...workout,
            user_id: user.id
          }));
          await saveWorkoutsToDatabase(sampleWorkouts);
        }
        return;
      }

      // For each workout, fetch exercises
      const fullWorkouts = await Promise.all(workoutsData.map(async (workout) => {
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('exercises')
          .select('*')
          .eq('workout_id', workout.id);

        if (exercisesError) {
          console.error("Error fetching exercises:", exercisesError);
          return {
            id: workout.id,
            date: workout.date,
            program: workout.program,
            phase: workout.phase,
            exercises: []
          };
        }

        // For each exercise, fetch sets
        const exercisesWithSets = await Promise.all(exercisesData.map(async (exercise) => {
          const { data: setsData, error: setsError } = await supabase
            .from('sets')
            .select('*')
            .eq('exercise_id', exercise.id);

          if (setsError) {
            console.error("Error fetching sets:", setsError);
            return {
              id: exercise.id,
              name: exercise.name,
              sets: []
            };
          }

          return {
            id: exercise.id,
            name: exercise.name,
            sets: setsData.map(set => ({
              id: set.id,
              reps: set.reps,
              weight: parseFloat(set.weight)
            }))
          };
        }));

        return {
          id: workout.id,
          date: workout.date,
          program: workout.program,
          phase: workout.phase,
          exercises: exercisesWithSets
        };
      }));

      setWorkouts(fullWorkouts);
    } catch (error) {
      console.error("Error in fetchWorkouts:", error);
    }
  };

  const saveWorkoutsToDatabase = async (workoutsToSave: any[]) => {
    try {
      // Insert workouts
      const { data: insertedWorkouts, error: workoutsError } = await supabase
        .from('workouts')
        .insert(workoutsToSave.map(w => ({
          user_id: user?.id,
          date: w.date,
          program: w.program,
          phase: w.phase
        })))
        .select();

      if (workoutsError) {
        console.error("Error inserting workouts:", workoutsError);
        return;
      }

      // Insert exercises for each workout
      for (let i = 0; i < insertedWorkouts.length; i++) {
        const workoutId = insertedWorkouts[i].id;
        const exercises = workoutsToSave[i].exercises;

        if (exercises && exercises.length > 0) {
          const { data: insertedExercises, error: exercisesError } = await supabase
            .from('exercises')
            .insert(exercises.map((e: any) => ({
              workout_id: workoutId,
              name: e.name
            })))
            .select();

          if (exercisesError) {
            console.error("Error inserting exercises:", exercisesError);
            continue;
          }

          // Insert sets for each exercise
          for (let j = 0; j < insertedExercises.length; j++) {
            const exerciseId = insertedExercises[j].id;
            const sets = exercises[j].sets;

            if (sets && sets.length > 0) {
              const { error: setsError } = await supabase
                .from('sets')
                .insert(sets.map((s: any) => ({
                  exercise_id: exerciseId,
                  reps: s.reps,
                  weight: s.weight
                })));

              if (setsError) {
                console.error("Error inserting sets:", setsError);
              }
            }
          }
        }
      }

      // Refresh workouts after saving
      fetchWorkouts();
    } catch (error) {
      console.error("Error in saveWorkoutsToDatabase:", error);
    }
  };

  const addWorkout = async (workout: Omit<Workout, "id">) => {
    const newWorkoutId = generateId(); // Temporary ID for immediate UI update
    
    // Update local state for immediate UI feedback
    const newWorkout = {
      ...workout,
      id: newWorkoutId,
    };
    setWorkouts((prev) => [...prev, newWorkout]);
    
    // If user is logged in, save to database
    if (user) {
      try {
        // Insert workout
        const { data: insertedWorkout, error: workoutError } = await supabase
          .from('workouts')
          .insert({
            user_id: user.id,
            date: workout.date,
            program: workout.program,
            phase: workout.phase
          })
          .select()
          .single();

        if (workoutError) {
          console.error("Error adding workout:", workoutError);
          fetchWorkouts(); // Revert to database state
          toast({
            title: "Workout not added",
            description: "There was an error saving your workout.",
            variant: "destructive",
          });
          return;
        }

        const workoutId = insertedWorkout.id;

        // Insert exercises
        for (const exercise of workout.exercises) {
          const { data: insertedExercise, error: exerciseError } = await supabase
            .from('exercises')
            .insert({
              workout_id: workoutId,
              name: exercise.name
            })
            .select()
            .single();

          if (exerciseError) {
            console.error("Error adding exercise:", exerciseError);
            continue;
          }

          // Insert sets
          if (exercise.sets.length > 0) {
            const { error: setsError } = await supabase
              .from('sets')
              .insert(exercise.sets.map(set => ({
                exercise_id: insertedExercise.id,
                reps: set.reps,
                weight: set.weight
              })));

            if (setsError) {
              console.error("Error adding sets:", setsError);
            }
          }
        }

        // Refresh workouts to get the correct database IDs
        fetchWorkouts();
      } catch (error) {
        console.error("Error in addWorkout:", error);
      }
    }
    
    toast({
      title: "Workout added",
      description: `Your workout for ${new Date(workout.date).toLocaleDateString()} has been saved.`,
    });
  };

  const deleteWorkout = async (id: string) => {
    // Update local state first
    setWorkouts((prev) => prev.filter((workout) => workout.id !== id));
    
    // If user is logged in, delete from database
    if (user) {
      try {
        const { error } = await supabase
          .from('workouts')
          .delete()
          .eq('id', id);

        if (error) {
          console.error("Error deleting workout:", error);
          fetchWorkouts(); // Revert to database state
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
  };

  const updateWorkout = async (workout: Workout) => {
    // Update local state first
    setWorkouts((prev) =>
      prev.map((w) => (w.id === workout.id ? workout : w))
    );
    
    // If user is logged in, update in database
    if (user) {
      try {
        // Update workout
        const { error: workoutError } = await supabase
          .from('workouts')
          .update({
            date: workout.date,
            program: workout.program,
            phase: workout.phase
          })
          .eq('id', workout.id);

        if (workoutError) {
          console.error("Error updating workout:", workoutError);
          fetchWorkouts(); // Revert to database state
          return;
        }

        // This is a simplified approach. For a complete solution,
        // you would need to handle adding/updating/removing exercises and sets
        // by comparing with the current state in the database.
      } catch (error) {
        console.error("Error in updateWorkout:", error);
      }
    }
    
    toast({
      title: "Workout updated",
      description: "Your changes have been saved.",
    });
  };

  const clearAllWorkouts = async () => {
    setWorkouts([]);
    
    // If user is logged in, delete all from database
    if (user) {
      try {
        const { error } = await supabase
          .from('workouts')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.error("Error clearing workouts:", error);
          fetchWorkouts(); // Revert to database state
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
  };

  const addExerciseToWorkout = async (workoutId: string, exercise: Omit<Exercise, "id">) => {
    const newExerciseId = generateId(); // Temporary ID
    
    // Update local state first
    const newExercise = {
      ...exercise,
      id: newExerciseId,
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
    
    // If user is logged in, save to database
    if (user) {
      try {
        const { data, error } = await supabase
          .from('exercises')
          .insert({
            workout_id: workoutId,
            name: exercise.name
          })
          .select()
          .single();

        if (error) {
          console.error("Error adding exercise:", error);
          fetchWorkouts(); // Revert to database state
          return;
        }

        // If there are sets, add them too
        if (exercise.sets.length > 0) {
          const { error: setsError } = await supabase
            .from('sets')
            .insert(exercise.sets.map(set => ({
              exercise_id: data.id,
              reps: set.reps,
              weight: set.weight
            })));

          if (setsError) {
            console.error("Error adding sets:", setsError);
          }
        }

        // Refresh to get correct database IDs
        fetchWorkouts();
      } catch (error) {
        console.error("Error in addExerciseToWorkout:", error);
      }
    }
  };

  const removeExerciseFromWorkout = async (workoutId: string, exerciseId: string) => {
    // Update local state first
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
    
    // If user is logged in, delete from database
    if (user) {
      try {
        const { error } = await supabase
          .from('exercises')
          .delete()
          .eq('id', exerciseId);

        if (error) {
          console.error("Error removing exercise:", error);
          fetchWorkouts(); // Revert to database state
          return;
        }
      } catch (error) {
        console.error("Error in removeExerciseFromWorkout:", error);
      }
    }
  };

  const addSetToExercise = async (workoutId: string, exerciseId: string, set: Omit<Set, "id">) => {
    const newSetId = generateId(); // Temporary ID
    
    // Update local state first
    const newSet = {
      ...set,
      id: newSetId,
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
    
    // If user is logged in, save to database
    if (user) {
      try {
        const { error } = await supabase
          .from('sets')
          .insert({
            exercise_id: exerciseId,
            reps: set.reps,
            weight: set.weight
          });

        if (error) {
          console.error("Error adding set:", error);
          fetchWorkouts(); // Revert to database state
          return;
        }
      } catch (error) {
        console.error("Error in addSetToExercise:", error);
      }
    }
  };

  const removeSetFromExercise = async (workoutId: string, exerciseId: string, setId: string) => {
    // Update local state first
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
    
    // If user is logged in, delete from database
    if (user) {
      try {
        const { error } = await supabase
          .from('sets')
          .delete()
          .eq('id', setId);

        if (error) {
          console.error("Error removing set:", error);
          fetchWorkouts(); // Revert to database state
          return;
        }
      } catch (error) {
        console.error("Error in removeSetFromExercise:", error);
      }
    }
  };

  const updateSet = async (workoutId: string, exerciseId: string, set: Set) => {
    // Update local state first
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
    
    // If user is logged in, update in database
    if (user) {
      try {
        const { error } = await supabase
          .from('sets')
          .update({
            reps: set.reps,
            weight: set.weight
          })
          .eq('id', set.id);

        if (error) {
          console.error("Error updating set:", error);
          fetchWorkouts(); // Revert to database state
          return;
        }
      } catch (error) {
        console.error("Error in updateSet:", error);
      }
    }
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
