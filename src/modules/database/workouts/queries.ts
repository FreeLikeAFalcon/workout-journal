
import { supabase } from "@/integrations/supabase/client";
import { Exercise, Set, Workout } from "./types";
import { generateId } from "@/utils/workoutUtils";

/**
 * Fetches all workouts for a user
 */
export const fetchWorkouts = async (userId: string | undefined): Promise<Workout[]> => {
  if (!userId) return [];
  
  try {
    const { data: workoutsData, error: workoutsError } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (workoutsError) {
      console.error("Error fetching workouts:", workoutsError);
      return [];
    }

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
            weight: parseFloat(set.weight as unknown as string)
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

    return fullWorkouts;
  } catch (error) {
    console.error("Error in fetchWorkouts:", error);
    return [];
  }
};

/**
 * Adds a new workout
 */
export const addWorkout = async (
  workout: Omit<Workout, "id">, 
  userId: string
): Promise<{ success: boolean; workoutId?: string; error?: string }> => {
  try {
    const { data: insertedWorkout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: userId,
        date: workout.date,
        program: workout.program,
        phase: workout.phase
      })
      .select()
      .single();

    if (workoutError) {
      throw workoutError;
    }

    const workoutId = insertedWorkout.id;

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

    return { success: true, workoutId };
  } catch (error: any) {
    console.error("Error in addWorkout:", error);
    return { 
      success: false, 
      error: error.message || "Failed to add workout" 
    };
  }
};

/**
 * Deletes a workout
 */
export const deleteWorkout = async (
  workoutId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteWorkout:", error);
    return { 
      success: false, 
      error: error.message || "Failed to delete workout" 
    };
  }
};

/**
 * Updates a workout
 */
export const updateWorkout = async (
  workout: Workout
): Promise<{ success: boolean; error?: string }> => {
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
      throw workoutError;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in updateWorkout:", error);
    return { 
      success: false, 
      error: error.message || "Failed to update workout" 
    };
  }
};

/**
 * Clears all workouts for a user
 */
export const clearAllWorkouts = async (
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in clearAllWorkouts:", error);
    return { 
      success: false, 
      error: error.message || "Failed to clear workouts" 
    };
  }
};

// Additional helper functions for exercise and set management
export const addExerciseToWorkout = async (
  workoutId: string,
  exercise: Omit<Exercise, "id">
): Promise<{ success: boolean; exerciseId?: string; error?: string }> => {
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
      throw error;
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

    return { success: true, exerciseId: data.id };
  } catch (error: any) {
    console.error("Error in addExerciseToWorkout:", error);
    return { 
      success: false, 
      error: error.message || "Failed to add exercise" 
    };
  }
};

export const removeExerciseFromWorkout = async (
  exerciseId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in removeExerciseFromWorkout:", error);
    return { 
      success: false, 
      error: error.message || "Failed to remove exercise" 
    };
  }
};

export const addSetToExercise = async (
  exerciseId: string,
  set: Omit<Set, "id">
): Promise<{ success: boolean; setId?: string; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('sets')
      .insert({
        exercise_id: exerciseId,
        reps: set.reps,
        weight: set.weight
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, setId: data.id };
  } catch (error: any) {
    console.error("Error in addSetToExercise:", error);
    return { 
      success: false, 
      error: error.message || "Failed to add set" 
    };
  }
};

export const removeSetFromExercise = async (
  setId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('sets')
      .delete()
      .eq('id', setId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in removeSetFromExercise:", error);
    return { 
      success: false, 
      error: error.message || "Failed to remove set" 
    };
  }
};

export const updateSet = async (
  set: Set
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('sets')
      .update({
        reps: set.reps,
        weight: set.weight
      })
      .eq('id', set.id);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in updateSet:", error);
    return { 
      success: false, 
      error: error.message || "Failed to update set" 
    };
  }
};
