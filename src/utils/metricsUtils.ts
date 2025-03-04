
import { BodyMetrics, WidgetConfig, WidgetType } from "@/types/metrics";

/**
 * Transforms raw metrics API data into the application's BodyMetrics format
 */
export const transformMetricsData = (metricsData: any, goalsData: any): BodyMetrics => {
  return {
    weight: {
      entries: metricsData
        .filter((m: any) => m.metric_type === 'weight')
        .map((m: any) => ({ id: m.id, date: m.date, value: m.value })),
      goal: goalsData.find((g: any) => g.metric_type === 'weight') 
        ? { 
            target: goalsData.find((g: any) => g.metric_type === 'weight').target,
            deadline: goalsData.find((g: any) => g.metric_type === 'weight').deadline || undefined
          }
        : undefined,
      unit: "kg",
    },
    bodyFat: {
      entries: metricsData
        .filter((m: any) => m.metric_type === 'bodyFat')
        .map((m: any) => ({ id: m.id, date: m.date, value: m.value })),
      goal: goalsData.find((g: any) => g.metric_type === 'bodyFat')
        ? { 
            target: goalsData.find((g: any) => g.metric_type === 'bodyFat').target,
            deadline: goalsData.find((g: any) => g.metric_type === 'bodyFat').deadline || undefined
          }
        : undefined,
      unit: "%",
    },
    muscleMass: {
      entries: metricsData
        .filter((m: any) => m.metric_type === 'muscleMass')
        .map((m: any) => ({ id: m.id, date: m.date, value: m.value })),
      goal: goalsData.find((g: any) => g.metric_type === 'muscleMass')
        ? { 
            target: goalsData.find((g: any) => g.metric_type === 'muscleMass').target,
            deadline: goalsData.find((g: any) => g.metric_type === 'muscleMass').deadline || undefined
          }
        : undefined,
      unit: "%",
    },
  };
};

/**
 * Transforms raw widget API data into the application's WidgetConfig format
 */
export const transformWidgetsData = (widgetsData: any): WidgetConfig[] => {
  if (!widgetsData || widgetsData.length === 0) {
    return [
      { id: "1", type: WidgetType.TOTAL_WORKOUTS, position: 0, visible: true },
      { id: "2", type: WidgetType.TOTAL_EXERCISES, position: 1, visible: true },
      { id: "3", type: WidgetType.TOTAL_SETS, position: 2, visible: true },
      { id: "4", type: WidgetType.MOST_FREQUENT_EXERCISE, position: 3, visible: true },
    ];
  }
  
  return widgetsData.map((w: any) => ({
    id: w.id,
    type: w.type as WidgetType,
    position: w.position,
    visible: w.visible
  }));
};

/**
 * Gets the latest value for a specific metric type
 */
export const getLatestMetricValue = (
  metrics: BodyMetrics, 
  type: keyof BodyMetrics
): number | undefined => {
  const entries = metrics[type].entries;
  if (!entries || entries.length === 0) return undefined;
  
  return entries[0].value;
};
