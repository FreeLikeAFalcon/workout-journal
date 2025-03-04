
import { Exercise, Set, Workout } from "@/types/workout";
import { BodyMetrics, WidgetConfig } from "@/types/metrics";

/**
 * Transforms database workout data into the application's Workout type
 */
export const transformWorkoutData = (data: any[]): Workout[] => {
  return data.map((workout) => ({
    id: workout.id,
    date: workout.date,
    program: workout.program,
    phase: workout.phase,
    exercises: workout.exercises || [],
  }));
};

/**
 * Transforms database exercise data into the application's Exercise type
 */
export const transformExerciseData = (data: any[]): Exercise[] => {
  return data.map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    sets: exercise.sets || [],
  }));
};

/**
 * Transforms database set data into the application's Set type
 */
export const transformSetData = (data: any[]): Set[] => {
  return data.map((set) => ({
    id: set.id,
    reps: set.reps,
    weight: set.weight,
  }));
};

/**
 * Transforms metrics data from database to application format
 */
export const transformMetricsData = (metricsData: any): BodyMetrics => {
  const { metrics, goals } = metricsData;
  
  return {
    weight: {
      entries: metrics
        .filter((m: any) => m.metric_type === 'weight')
        .map((m: any) => ({ id: m.id, date: m.date, value: m.value })),
      goal: goals.find((g: any) => g.metric_type === 'weight') 
        ? { 
            target: goals.find((g: any) => g.metric_type === 'weight').target,
            deadline: goals.find((g: any) => g.metric_type === 'weight').deadline || undefined
          }
        : undefined,
      unit: "kg",
    },
    bodyFat: {
      entries: metrics
        .filter((m: any) => m.metric_type === 'bodyFat')
        .map((m: any) => ({ id: m.id, date: m.date, value: m.value })),
      goal: goals.find((g: any) => g.metric_type === 'bodyFat')
        ? { 
            target: goals.find((g: any) => g.metric_type === 'bodyFat').target,
            deadline: goals.find((g: any) => g.metric_type === 'bodyFat').deadline || undefined
          }
        : undefined,
      unit: "%",
    },
    muscleMass: {
      entries: metrics
        .filter((m: any) => m.metric_type === 'muscleMass')
        .map((m: any) => ({ id: m.id, date: m.date, value: m.value })),
      goal: goals.find((g: any) => g.metric_type === 'muscleMass')
        ? { 
            target: goals.find((g: any) => g.metric_type === 'muscleMass').target,
            deadline: goals.find((g: any) => g.metric_type === 'muscleMass').deadline || undefined
          }
        : undefined,
      unit: "%",
    },
  };
};

/**
 * Transforms widget data from database to application format
 */
export const transformWidgetData = (widgetData: any[]): WidgetConfig[] => {
  if (!widgetData || !widgetData.length) return [];
  
  return widgetData.map((widget) => ({
    id: widget.id,
    type: widget.type as any, // Will be cast to WidgetType by the consumer
    position: widget.position,
    visible: widget.visible,
  }));
};
