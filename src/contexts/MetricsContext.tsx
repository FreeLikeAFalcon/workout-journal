
import React, { createContext, useContext } from "react";
import { BodyMetrics, WidgetConfig } from "@/types/metrics";
import { useMetrics as useMetricsHook } from "@/hooks/useMetrics";

interface MetricsContextType {
  metrics: BodyMetrics | null;
  widgets: WidgetConfig[];
  isLoading: boolean;
  addMetric: (data: { type: keyof BodyMetrics; value: number; date: string }) => Promise<void>;
  deleteMetric: (type: keyof BodyMetrics, id: string) => Promise<void>;
  setGoal: (type: keyof BodyMetrics, goal: { target: number; deadline?: string }) => Promise<void>;
  getLatestMetricValue: (type: keyof BodyMetrics) => number | undefined;
  updateWidgetSettings: (widgetSettings: WidgetConfig[]) => Promise<void>;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export const MetricsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    metrics,
    widgets,
    isLoading,
    addMetric,
    deleteMetric,
    setGoal,
    getLatestMetricValue,
    updateWidgetSettings,
  } = useMetricsHook();

  return (
    <MetricsContext.Provider
      value={{
        metrics,
        widgets,
        isLoading,
        addMetric,
        deleteMetric,
        setGoal,
        getLatestMetricValue,
        updateWidgetSettings,
      }}
    >
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
