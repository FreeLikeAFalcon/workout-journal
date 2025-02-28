
import { ChartData, Exercise, Set, Workout, WorkoutStats } from "@/types/workout";

/**
 * Generates a unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

/**
 * Calculates the total volume for a set (reps × weight)
 */
export const calculateSetVolume = (set: Set): number => {
  return set.reps * set.weight;
};

/**
 * Calculates the total volume for an exercise
 */
export const calculateExerciseVolume = (exercise: Exercise): number => {
  return exercise.sets.reduce((total, set) => total + calculateSetVolume(set), 0);
};

/**
 * Calculates the total volume for a workout
 */
export const calculateWorkoutVolume = (workout: Workout): number => {
  return workout.exercises.reduce((total, exercise) => total + calculateExerciseVolume(exercise), 0);
};

/**
 * Gets the highest weight used for an exercise
 */
export const getMaxWeight = (exercise: Exercise): number => {
  if (!exercise.sets.length) return 0;
  return Math.max(...exercise.sets.map(set => set.weight));
};

/**
 * Formats a date string to a more readable format (German)
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('de-DE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Convert lbs to kg
 */
export const lbsToKg = (weight: number): number => {
  // Conversion factor: 1 lb = 0.453592 kg
  return parseFloat((weight * 0.453592).toFixed(1));
};

/**
 * Convert kg to lbs (for data storage)
 */
export const kgToLbs = (weight: number): number => {
  // Conversion factor: 1 kg = 2.20462 lbs
  return parseFloat((weight * 2.20462).toFixed(1));
};

/**
 * Calculates overall workout statistics
 */
export const calculateWorkoutStats = (workouts: Workout[]): WorkoutStats => {
  if (!workouts.length) {
    return {
      totalWorkouts: 0,
      totalExercises: 0,
      totalSets: 0,
      mostFrequentExercise: {
        name: 'Keine',
        count: 0
      }
    };
  }

  const totalExercises = workouts.reduce((total, workout) => total + workout.exercises.length, 0);
  const totalSets = workouts.reduce((total, workout) => {
    return total + workout.exercises.reduce((exerciseTotal, exercise) => {
      return exerciseTotal + exercise.sets.length;
    }, 0);
  }, 0);

  // Find most frequent exercise
  const exerciseCounts: Record<string, number> = {};
  
  workouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      if (!exerciseCounts[exercise.name]) {
        exerciseCounts[exercise.name] = 0;
      }
      exerciseCounts[exercise.name]++;
    });
  });

  let mostFrequentExercise = { name: 'Keine', count: 0 };
  
  Object.entries(exerciseCounts).forEach(([name, count]) => {
    if (count > mostFrequentExercise.count) {
      mostFrequentExercise = { name, count };
    }
  });

  return {
    totalWorkouts: workouts.length,
    totalExercises,
    totalSets,
    mostFrequentExercise
  };
};

/**
 * Prepares exercise data for charting
 */
export const prepareChartData = (workouts: Workout[]): ChartData => {
  const chartData: ChartData = {};

  workouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      if (!chartData[exercise.name]) {
        chartData[exercise.name] = [];
      }

      chartData[exercise.name].push({
        date: workout.date,
        maxWeight: getMaxWeight(exercise),
        volumeLoad: calculateExerciseVolume(exercise)
      });
    });
  });

  // Sort each exercise's data points by date
  Object.keys(chartData).forEach(exerciseName => {
    chartData[exerciseName].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  return chartData;
};

/**
 * Creates sample workout data (for demo purposes)
 */
export const createSampleWorkouts = (): Workout[] => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  return [
    {
      id: generateId(),
      date: lastWeek.toISOString(),
      program: "MAPS Anabolic",
      phase: "Phase 1",
      exercises: [
        {
          id: generateId(),
          name: "Bankdrücken",
          sets: [
            { id: generateId(), reps: 8, weight: 135 },
            { id: generateId(), reps: 8, weight: 145 },
            { id: generateId(), reps: 6, weight: 155 }
          ]
        },
        {
          id: generateId(),
          name: "Kniebeuge",
          sets: [
            { id: generateId(), reps: 8, weight: 185 },
            { id: generateId(), reps: 8, weight: 205 },
            { id: generateId(), reps: 6, weight: 225 }
          ]
        }
      ]
    },
    {
      id: generateId(),
      date: yesterday.toISOString(),
      program: "MAPS Anabolic",
      phase: "Phase 1",
      exercises: [
        {
          id: generateId(),
          name: "Bankdrücken",
          sets: [
            { id: generateId(), reps: 8, weight: 145 },
            { id: generateId(), reps: 6, weight: 155 },
            { id: generateId(), reps: 5, weight: 165 }
          ]
        },
        {
          id: generateId(),
          name: "Klimmzug",
          sets: [
            { id: generateId(), reps: 8, weight: 0 },
            { id: generateId(), reps: 8, weight: 0 },
            { id: generateId(), reps: 7, weight: 0 }
          ]
        }
      ]
    },
    {
      id: generateId(),
      date: today.toISOString(),
      program: "MAPS Anabolic",
      phase: "Phase 1",
      exercises: [
        {
          id: generateId(),
          name: "Kniebeuge",
          sets: [
            { id: generateId(), reps: 8, weight: 205 },
            { id: generateId(), reps: 8, weight: 225 },
            { id: generateId(), reps: 6, weight: 245 }
          ]
        },
        {
          id: generateId(),
          name: "Kreuzheben",
          sets: [
            { id: generateId(), reps: 5, weight: 225 },
            { id: generateId(), reps: 5, weight: 245 },
            { id: generateId(), reps: 3, weight: 265 }
          ]
        }
      ]
    }
  ];
};

/**
 * Finds an exercise by name from the history for comparison
 */
export const findPreviousExercise = (exerciseName: string, workouts: Workout[]): Exercise | undefined => {
  // Sort workouts by date (descending)
  const sortedWorkouts = [...workouts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Skip the most recent workout (current one)
  const previousWorkouts = sortedWorkouts.slice(1);
  
  // Find the most recent workout that contains this exercise
  for (const workout of previousWorkouts) {
    const exercise = workout.exercises.find(ex => ex.name === exerciseName);
    if (exercise) return exercise;
  }
  
  return undefined;
};

/**
 * Checks if the current exercise performance is an improvement
 */
export const isPersonalRecord = (currentExercise: Exercise, previousExercise: Exercise | undefined): boolean => {
  if (!previousExercise) return false;
  
  const currentMax = getMaxWeight(currentExercise);
  const previousMax = getMaxWeight(previousExercise);
  
  return currentMax > previousMax;
};
