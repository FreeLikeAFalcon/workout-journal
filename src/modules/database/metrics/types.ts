
export interface BodyMetric {
  id: string;
  date: string;
  value: number;
}

export interface BodyGoal {
  target: number;
  deadline?: string; // Optional deadline
}

export interface BodyMetrics {
  weight: {
    entries: BodyMetric[];
    goal?: BodyGoal;
    unit: "kg";
  };
  bodyFat: {
    entries: BodyMetric[];
    goal?: BodyGoal;
    unit: "%";
  };
  muscleMass: {
    entries: BodyMetric[];
    goal?: BodyGoal;
    unit: "%";
  };
}

export enum WidgetType {
  TOTAL_WORKOUTS = "totalWorkouts",
  TOTAL_EXERCISES = "totalExercises",
  TOTAL_SETS = "totalSets",
  MOST_FREQUENT_EXERCISE = "mostFrequentExercise",
  CURRENT_WEIGHT = "currentWeight",
  WEIGHT_GOAL = "weightGoal",
  BODY_FAT = "bodyFat",
  MUSCLE_MASS = "muscleMass",
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  position: number;
  visible: boolean;
}
