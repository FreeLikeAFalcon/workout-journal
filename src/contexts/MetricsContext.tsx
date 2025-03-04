
import React, { createContext, useContext } from "react";
import { useMetrics } from "@/hooks/useMetrics";
import { BodyGoal, BodyMetrics, WidgetConfig, WidgetType } from "@/modules/database/metrics/types";

interface MetricsContextType {
  metrics: BodyMetrics;
  widgets: WidgetConfig[];
  addMetric: (metric: { type: keyof BodyMetrics, value: number, date: string }) => Promise<void>;
  setGoal: (type: keyof BodyMetrics, goal: BodyGoal) => Promise<void>;
  deleteMetric: (type: keyof BodyMetrics, id: string) => Promise<void>;
  updateWidgets: (widgets: WidgetConfig[]) => Promise<void>;
  getLatestMetricValue: (type: keyof BodyMetrics) => number | undefined;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export const MetricsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const metricsManager = useMetrics();
  
  return (
    <MetricsContext.Provider value={metricsManager}>
      {children}
    </MetricsContext.Provider>
  );
};

export const useMetrics = () => {
  const context = useContext(MetricsContext);
  if (context === undefined) {
    throw new Error("useMetrics must be used within a MetricsProvider");
  }
  return context;
};
