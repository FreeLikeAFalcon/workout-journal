import React, { createContext, useContext, useState, useEffect } from "react";
import { BodyMetrics, WidgetConfig, WidgetType } from "@/types/metrics";
import { fetchMetrics, addMetricEntry, updateMetricGoal, fetchWidgets, updateWidgets } from "@/modules/database/metrics/queries";
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

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const fetchedMetrics = await fetchMetrics();
        setMetrics(fetchedMetrics);
        const fetchedWidgets = await fetchWidgets();
        setWidgets(fetchedWidgets);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const addMetric = async (data: { type: keyof BodyMetrics; value: number; date: string }) => {
    try {
      await addMetricEntry(data);
      const updatedMetrics = await fetchMetrics();
      setMetrics(updatedMetrics);
    } catch (error) {
      console.error("Error adding metric:", error);
    }
  };

  const setGoal = async (type: keyof BodyMetrics, goal: { target: number; deadline?: string }) => {
    try {
      await updateMetricGoal(type, goal);
      const updatedMetrics = await fetchMetrics();
      setMetrics(updatedMetrics);
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
      const updatedWidgets = await fetchWidgets();
      setWidgets(updatedWidgets);
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
