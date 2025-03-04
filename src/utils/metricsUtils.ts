
import { BodyMetrics, WidgetConfig, WidgetType } from "@/types/metrics";

/**
 * Transforms raw metrics API data into the application's BodyMetrics format
 */
export const transformMetricsData = (metricsData: any[] = [], goalsData: any[] = []): BodyMetrics => {
  // Ensure we have arrays even if null data is provided
  const metrics = Array.isArray(metricsData) ? metricsData : [];
  const goals = Array.isArray(goalsData) ? goalsData : [];

  return {
    weight: {
      entries: metrics
        .filter((m: any) => m && m.metric_type === 'weight')
        .map((m: any) => ({ id: m.id, date: m.date, value: m.value })),
      goal: goals.find((g: any) => g && g.metric_type === 'weight') 
        ? { 
            target: goals.find((g: any) => g && g.metric_type === 'weight').target,
            deadline: goals.find((g: any) => g && g.metric_type === 'weight').deadline || undefined
          }
        : undefined,
      unit: "kg",
    },
    bodyFat: {
      entries: metrics
        .filter((m: any) => m && m.metric_type === 'bodyFat')
        .map((m: any) => ({ id: m.id, date: m.date, value: m.value })),
      goal: goals.find((g: any) => g && g.metric_type === 'bodyFat')
        ? { 
            target: goals.find((g: any) => g && g.metric_type === 'bodyFat').target,
            deadline: goals.find((g: any) => g && g.metric_type === 'bodyFat').deadline || undefined
          }
        : undefined,
      unit: "%",
    },
    muscleMass: {
      entries: metrics
        .filter((m: any) => m && m.metric_type === 'muscleMass')
        .map((m: any) => ({ id: m.id, date: m.date, value: m.value })),
      goal: goals.find((g: any) => g && g.metric_type === 'muscleMass')
        ? { 
            target: goals.find((g: any) => g && g.metric_type === 'muscleMass').target,
            deadline: goals.find((g: any) => g && g.metric_type === 'muscleMass').deadline || undefined
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
  if (!widgetsData || !Array.isArray(widgetsData) || widgetsData.length === 0) {
    // Default widgets if no data is available
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
