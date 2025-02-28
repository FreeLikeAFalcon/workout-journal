
export interface Set {
  id: string;
  reps: number;
  weight: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

export interface Workout {
  id: string;
  date: string;
  program: string;
  phase: string;
  exercises: Exercise[];
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalExercises: number;
  totalSets: number;
  mostFrequentExercise: {
    name: string;
    count: number;
  };
}

export interface ExerciseProgress {
  date: string;
  maxWeight: number;
  volumeLoad: number;
}

export type ChartData = {
  [exerciseName: string]: ExerciseProgress[];
};
