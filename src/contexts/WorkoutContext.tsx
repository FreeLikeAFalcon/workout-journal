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

  useEffect(() => {
    if (user) {
      fetchWorkouts();
    } else {
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
  }, [user]);

  useEffect(() => {
    if (!user && workouts.length > 0) {
      localStorage.setItem("workouts", JSON.stringify(workouts));
    }
  }, [workouts, user]);

  const fetchWorkouts = async () => {
    try {
      console.log("Fetching workouts for user:", user?.id);
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      if (workoutsError) {
        console.error("Error fetching workouts:", workoutsError);
        return;
      }

      console.log("Fetched workouts:", workoutsData);
      
      const fetchedWorkouts = workoutsData || [];
      
      if (fetchedWorkouts.length === 0) {
        console.log("No workouts found, creating sample workouts");
        if (user) {
          const sampleWorkouts = createSampleWorkouts().map(workout => ({
            ...workout,
            user_id: user.id
          }));
          await saveWorkoutsToDatabase(sampleWorkouts);
          return; // saveWorkoutsToDatabase will call fetchWorkouts again
        }
      }

      const fullWorkouts = await Promise.all(fetchedWorkouts.map(async (workout) => {
        try {
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

          const exercises = exercisesData || [];
          
          const exercisesWithSets = await Promise.all(exercises.map(async (exercise) => {
            try {
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

              const sets = setsData || [];
              
              return {
                id: exercise.id,
                name: exercise.name,
                sets: sets.map(set => ({
                  id: set.id,
                  reps: set.reps,
                  weight: parseFloat(set.weight as unknown as string)
                }))
              };
            } catch (exerciseError) {
              console.error("Error processing exercise:", exerciseError);
              return {
                id: exercise.id,
                name: exercise.name,
                sets: []
              };
            }
          }));

          return {
            id: workout.id,
            date: workout.date,
            program: workout.program,
            phase: workout.phase,
            exercises: exercisesWithSets
          };
        } catch (workoutError) {
          console.error("Error processing workout:", workoutError);
          return {
            id: workout.id,
            date: workout.date,
            program: workout.program,
            phase: workout.phase,
            exercises: []
          };
        }
      }));

      console.log("Setting full workouts:", fullWorkouts);
      setWorkouts(fullWorkouts);
    } catch (error) {
      console.error("Error in fetchWorkouts:", error);
      setWorkouts([]);
    }
  };

  const saveWorkoutsToDatabase = async (workoutsToSave: any[]) => {
    try {
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

      fetchWorkouts();
    } catch (error) {
      console.error("Error in saveWorkoutsToDatabase:", error);
    }
  };

  const addWorkout = async (workout: Omit<Workout, "id">) => {
    try {
      const newWorkoutId = generateId();
      const newWorkout = {
        ...workout,
        id: newWorkoutId,
      };
      
      setWorkouts((prev) => [...prev, newWorkout]);

      if (user) {
        try {
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
            fetchWorkouts();
            toast({
              title: "Workout not added",
              description: "There was an error saving your workout.",
              variant: "destructive",
            });
            return;
          }

          const workoutId = insertedWorkout.id;

          for (const exercise of workout.exercises) {
            try {
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
            } catch (exerciseError) {
              console.error("Error processing exercise:", exerciseError);
            }
          }

          fetchWorkouts();
          
          toast({
            title: "Workout added",
            description: `Your workout for ${new Date(workout.date).toLocaleDateString()} has been saved.`,
          });
        } catch (saveError) {
          console.error("Error in addWorkout:", saveError);
          fetchWorkouts();
          toast({
            title: "Error",
            description: "An unexpected error occurred while saving the workout.",
            variant: "destructive",
          });
        }
      } else {
        localStorage.setItem("workouts", JSON.stringify([...workouts, newWorkout]));
        toast({
          title: "Workout added",
          description: `Your workout for ${new Date(workout.date).toLocaleDateString()} has been saved.`,
        });
      }
    } catch (error) {
      console.error("Unexpected error in addWorkout:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const deleteWorkout = async (id: string) => {
    console.log("Deleting workout with ID:", id);
    setWorkouts((prev) => prev.filter((workout) => workout.id !== id));

    if (user) {
      try {
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('exercises')
          .select('id')
          .eq('workout_id', id);

        if (exercisesError) {
          console.error("Error fetching exercises for deletion:", exercisesError);
          toast({
            title: "Error",
            description: "Failed to delete workout: couldn't fetch exercises.",
            variant: "destructive",
          });
          fetchWorkouts();
          return;
        }

        if (exercisesData && exercisesData.length > 0) {
          const exerciseIds = exercisesData.map(e => e.id);
          
          const { error: setsError } = await supabase
            .from('sets')
            .delete()
            .in('exercise_id', exerciseIds);

          if (setsError) {
            console.error("Error deleting sets:", setsError);
            toast({
              title: "Error",
              description: "Failed to delete workout: couldn't delete sets.",
              variant: "destructive",
            });
            fetchWorkouts();
            return;
          }
          
          const { error: exError } = await supabase
            .from('exercises')
            .delete()
            .in('id', exerciseIds);

          if (exError) {
            console.error("Error deleting exercises:", exError);
            toast({
              title: "Error",
              description: "Failed to delete workout: couldn't delete exercises.",
              variant: "destructive",
            });
            fetchWorkouts();
            return;
          }
        }

        const { error } = await supabase
          .from('workouts')
          .delete()
          .eq('id', id);

        if (error) {
          console.error("Error deleting workout:", error);
          toast({
            title: "Error",
            description: "Failed to delete workout.",
            variant: "destructive",
          });
          fetchWorkouts();
          return;
        }
        
        console.log("Workout successfully deleted");
        toast({
          title: "Workout deleted",
          description: "Your workout has been removed.",
        });
      } catch (error) {
        console.error("Error in deleteWorkout:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while deleting workout.",
          variant: "destructive",
        });
        fetchWorkouts();
      }
    } else {
      const updatedWorkouts = workouts.filter(w => w.id !== id);
      localStorage.setItem("workouts", JSON.stringify(updatedWorkouts));
      toast({
        title: "Workout deleted",
        description: "Your workout has been removed.",
      });
    }
  };

  const updateWorkout = async (workout: Workout) => {
    setWorkouts((prev) =>
      prev.map((w) => (w.id === workout.id ? workout : w))
    );

    if (user) {
      try {
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
          fetchWorkouts();
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
  };

  const clearAllWorkouts = async () => {
    console.log("Clearing all workouts");
    setWorkouts([]);

    if (user) {
      try {
        const { data: workoutsData, error: workoutsError } = await supabase
          .from('workouts')
          .select('id')
          .eq('user_id', user.id);

        if (workoutsError) {
          console.error("Error fetching workouts for deletion:", workoutsError);
        } else if (workoutsData && workoutsData.length > 0) {
          const workoutIds = workoutsData.map(w => w.id);
          const { data: exercisesData, error: exercisesError } = await supabase
            .from('exercises')
            .select('id')
            .in('workout_id', workoutIds);

          if (exercisesError) {
            console.error("Error fetching exercises for deletion:", exercisesError);
          } else if (exercisesData && exercisesData.length > 0) {
            const exerciseIds = exercisesData.map(e => e.id);
            const { error: setsError } = await supabase
              .from('sets')
              .delete()
              .in('exercise_id', exerciseIds);

            if (setsError) {
              console.error("Error deleting sets:", setsError);
            }
            
            const { error: exError } = await supabase
              .from('exercises')
              .delete()
              .in('id', exerciseIds);

            if (exError) {
              console.error("Error deleting exercises:", exError);
            }
          }
          
          const { error: workoutsDeleteError } = await supabase
            .from('workouts')
            .delete()
            .in('id', workoutIds);

          if (workoutsDeleteError) {
            console.error("Error deleting workouts:", workoutsDeleteError);
            fetchWorkouts();
            toast({
              title: "Error",
              description: "Failed to clear workouts.",
              variant: "destructive",
            });
            return;
          }
        }
        
        console.log("All workouts successfully deleted");
      } catch (error) {
        console.error("Error in clearAllWorkouts:", error);
        fetchWorkouts();
        toast({
          title: "Error",
          description: "An unexpected error occurred while clearing workouts.",
          variant: "destructive",
        });
        return;
      }
    } else {
      localStorage.removeItem("workouts");
    }

    toast({
      title: "All workouts cleared",
      description: "Your workout history has been reset.",
    });
  };

  const addExerciseToWorkout = async (workoutId: string, exercise: Omit<Exercise, "id">) => {
    const newExerciseId = generateId();
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
          fetchWorkouts();
          return;
        }

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

        fetchWorkouts();
      } catch (error) {
        console.error("Error in addExerciseToWorkout:", error);
      }
    }
  };

  const removeExerciseFromWorkout = async (workoutId: string, exerciseId: string) => {
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

    if (user) {
      try {
        const { error } = await supabase
          .from('exercises')
          .delete()
          .eq('id', exerciseId);

        if (error) {
          console.error("Error removing exercise:", error);
          fetchWorkouts();
          return;
        }
      } catch (error) {
        console.error("Error in removeExerciseFromWorkout:", error);
      }
    }
  };

  const addSetToExercise = async (workoutId: string, exerciseId: string, set: Omit<Set, "id">) => {
    const newSetId = generateId();
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
          fetchWorkouts();
          return;
        }
      } catch (error) {
        console.error("Error in addSetToExercise:", error);
      }
    }
  };

  const removeSetFromExercise = async (workoutId: string, exerciseId: string, setId: string) => {
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

    if (user) {
      try {
        const { error } = await supabase
          .from('sets')
          .delete()
          .eq('id', setId);

        if (error) {
          console.error("Error removing set:", error);
          fetchWorkouts();
          return;
        }
      } catch (error) {
        console.error("Error in removeSetFromExercise:", error);
      }
    }
  };

  const updateSet = async (workoutId: string, exerciseId: string, set: Set) => {
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
          fetchWorkouts();
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
