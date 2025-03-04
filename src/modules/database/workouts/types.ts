
export interface Set {
  id: string;
  reps: number;
  weight: number;
  exercise_id?: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  workout_id?: string;
}

export interface Workout {
  id: string;
  date: string;
  program: string;
  phase: string;
  exercises: Exercise[];
  user_id?: string;
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
