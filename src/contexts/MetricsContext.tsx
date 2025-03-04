
import React, { createContext, useContext, useState, useEffect } from "react";
import { BodyMetrics, WidgetConfig, WidgetType } from "@/types/metrics";
import { fetchMetrics, updateMetricGoal, addMetricEntry, fetchWidgets, updateWidgets } from "@/modules/database/metrics/queries";
import { useAuth } from "./AuthContext";
import { toast } from "@/hooks/use-toast";

const initialMetricsState: BodyMetrics = {
  weight: {
    entries: [],
    unit: "kg",
  },
  bodyFat: {
    entries: [],
    unit: "%",
  },
  muscleMass: {
    entries: [],
    unit: "%",
  },
};

const defaultWidgets: WidgetConfig[] = [
  { id: "1", type: WidgetType.TOTAL_WORKOUTS, position: 0, visible: true },
  { id: "2", type: WidgetType.TOTAL_EXERCISES, position: 1, visible: true },
  { id: "3", type: WidgetType.TOTAL_SETS, position: 2, visible: true },
  { id: "4", type: WidgetType.MOST_FREQUENT_EXERCISE, position: 3, visible: true },
];

interface MetricsContextType {
  metrics: BodyMetrics;
  widgets: WidgetConfig[];
  isLoading: boolean;
  addMetric: (data: { type: keyof BodyMetrics; value: number; date: string }) => Promise<void>;
  setGoal: (type: keyof BodyMetrics, goal: { target: number; deadline?: string }) => Promise<void>;
  getLatestMetricValue: (type: keyof BodyMetrics) => number | undefined;
  updateWidgetSettings: (widgetSettings: WidgetConfig[]) => Promise<void>;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export const MetricsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<BodyMetrics>(initialMetricsState);
  const [widgets, setWidgets] = useState<WidgetConfig[]>(defaultWidgets);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const fetchedMetricsData = await fetchMetrics();
        // Convert API response to our expected format
        const convertedMetrics: BodyMetrics = {
          weight: {
            entries: fetchedMetricsData.metrics
              .filter(m => m.metric_type === 'weight')
              .map(m => ({ id: m.id, date: m.date, value: m.value })),
            goal: fetchedMetricsData.goals.find(g => g.metric_type === 'weight') 
              ? { 
                  target: fetchedMetricsData.goals.find(g => g.metric_type === 'weight')!.target,
                  deadline: fetchedMetricsData.goals.find(g => g.metric_type === 'weight')!.deadline || undefined
                }
              : undefined,
            unit: "kg",
          },
          bodyFat: {
            entries: fetchedMetricsData.metrics
              .filter(m => m.metric_type === 'bodyFat')
              .map(m => ({ id: m.id, date: m.date, value: m.value })),
            goal: fetchedMetricsData.goals.find(g => g.metric_type === 'bodyFat')
              ? { 
                  target: fetchedMetricsData.goals.find(g => g.metric_type === 'bodyFat')!.target,
                  deadline: fetchedMetricsData.goals.find(g => g.metric_type === 'bodyFat')!.deadline || undefined
                }
              : undefined,
            unit: "%",
          },
          muscleMass: {
            entries: fetchedMetricsData.metrics
              .filter(m => m.metric_type === 'muscleMass')
              .map(m => ({ id: m.id, date: m.date, value: m.value })),
            goal: fetchedMetricsData.goals.find(g => g.metric_type === 'muscleMass')
              ? { 
                  target: fetchedMetricsData.goals.find(g => g.metric_type === 'muscleMass')!.target,
                  deadline: fetchedMetricsData.goals.find(g => g.metric_type === 'muscleMass')!.deadline || undefined
                }
              : undefined,
            unit: "%",
          },
        };
        setMetrics(convertedMetrics);
        
        const fetchedWidgets = await fetchWidgets();
        // Convert API response to our expected format
        const convertedWidgets: WidgetConfig[] = fetchedWidgets.map(w => ({
          id: w.id,
          type: w.type as WidgetType, // Cast to WidgetType
          position: w.position,
          visible: w.visible
        }));
        setWidgets(convertedWidgets.length > 0 ? convertedWidgets : defaultWidgets);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setIsLoading(false);
      }
    };

    if (user) {
      fetchInitialData();
    }
  }, [user]);

  const addMetric = async (data: { type: keyof BodyMetrics; value: number; date: string }) => {
    try {
      await addMetricEntry(data);
      const fetchedMetricsData = await fetchMetrics();
      // Convert and update state
      const convertedMetrics: BodyMetrics = {
        weight: {
          entries: fetchedMetricsData.metrics
            .filter(m => m.metric_type === 'weight')
            .map(m => ({ id: m.id, date: m.date, value: m.value })),
          goal: fetchedMetricsData.goals.find(g => g.metric_type === 'weight') 
            ? { 
                target: fetchedMetricsData.goals.find(g => g.metric_type === 'weight')!.target,
                deadline: fetchedMetricsData.goals.find(g => g.metric_type === 'weight')!.deadline || undefined
              }
            : undefined,
          unit: "kg",
        },
        bodyFat: {
          entries: fetchedMetricsData.metrics
            .filter(m => m.metric_type === 'bodyFat')
            .map(m => ({ id: m.id, date: m.date, value: m.value })),
          goal: fetchedMetricsData.goals.find(g => g.metric_type === 'bodyFat')
            ? { 
                target: fetchedMetricsData.goals.find(g => g.metric_type === 'bodyFat')!.target,
                deadline: fetchedMetricsData.goals.find(g => g.metric_type === 'bodyFat')!.deadline || undefined
              }
            : undefined,
          unit: "%",
        },
        muscleMass: {
          entries: fetchedMetricsData.metrics
            .filter(m => m.metric_type === 'muscleMass')
            .map(m => ({ id: m.id, date: m.date, value: m.value })),
          goal: fetchedMetricsData.goals.find(g => g.metric_type === 'muscleMass')
            ? { 
                target: fetchedMetricsData.goals.find(g => g.metric_type === 'muscleMass')!.target,
                deadline: fetchedMetricsData.goals.find(g => g.metric_type === 'muscleMass')!.deadline || undefined
              }
            : undefined,
          unit: "%",
        },
      };
      setMetrics(convertedMetrics);
    } catch (error) {
      console.error("Error adding metric:", error);
    }
  };

  const setGoal = async (type: keyof BodyMetrics, goal: { target: number; deadline?: string }) => {
    try {
      await updateMetricGoal(type, goal);
      const fetchedMetricsData = await fetchMetrics();
      // Convert and update state
      const convertedMetrics: BodyMetrics = {
        weight: {
          entries: fetchedMetricsData.metrics
            .filter(m => m.metric_type === 'weight')
            .map(m => ({ id: m.id, date: m.date, value: m.value })),
          goal: fetchedMetricsData.goals.find(g => g.metric_type === 'weight') 
            ? { 
                target: fetchedMetricsData.goals.find(g => g.metric_type === 'weight')!.target,
                deadline: fetchedMetricsData.goals.find(g => g.metric_type === 'weight')!.deadline || undefined
              }
            : undefined,
          unit: "kg",
        },
        bodyFat: {
          entries: fetchedMetricsData.metrics
            .filter(m => m.metric_type === 'bodyFat')
            .map(m => ({ id: m.id, date: m.date, value: m.value })),
          goal: fetchedMetricsData.goals.find(g => g.metric_type === 'bodyFat')
            ? { 
                target: fetchedMetricsData.goals.find(g => g.metric_type === 'bodyFat')!.target,
                deadline: fetchedMetricsData.goals.find(g => g.metric_type === 'bodyFat')!.deadline || undefined
              }
            : undefined,
          unit: "%",
        },
        muscleMass: {
          entries: fetchedMetricsData.metrics
            .filter(m => m.metric_type === 'muscleMass')
            .map(m => ({ id: m.id, date: m.date, value: m.value })),
          goal: fetchedMetricsData.goals.find(g => g.metric_type === 'muscleMass')
            ? { 
                target: fetchedMetricsData.goals.find(g => g.metric_type === 'muscleMass')!.target,
                deadline: fetchedMetricsData.goals.find(g => g.metric_type === 'muscleMass')!.deadline || undefined
              }
            : undefined,
          unit: "%",
        },
      };
      setMetrics(convertedMetrics);
    } catch (error) {
      console.error("Error setting goal:", error);
    }
  };

  const getLatestMetricValue = (type: keyof BodyMetrics) => {
    const entry = metrics[type].entries[metrics[type].entries.length - 1];
    return entry ? entry.value : undefined;
  };

  const updateWidgetSettings = async (widgetSettings: WidgetConfig[]) => {
    try {
      await updateWidgets(widgetSettings);
      const fetchedWidgets = await fetchWidgets();
      // Convert API response to our expected format
      const convertedWidgets: WidgetConfig[] = fetchedWidgets.map(w => ({
        id: w.id,
        type: w.type as WidgetType, // Cast to WidgetType
        position: w.position,
        visible: w.visible
      }));
      setWidgets(convertedWidgets);
    } catch (error) {
      console.error("Error updating widget settings:", error);
    }
  };

  return (
    <MetricsContext.Provider value={{ metrics, widgets, isLoading, addMetric, setGoal, getLatestMetricValue, updateWidgetSettings }}>
      {children}
    </MetricsContext.Provider>
  );
};

export const useMetrics = (): MetricsContextType => {
  const context = useContext(MetricsContext);
  if (!context) {
    throw new Error("useMetrics must be used within a MetricsProvider");
  }
  return context;
};
