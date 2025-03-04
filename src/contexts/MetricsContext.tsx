
import React, { createContext, useContext, useState, useEffect } from "react";
import { BodyMetrics, WidgetConfig, WidgetType } from "@/types/metrics";
import { 
  fetchMetrics, 
  updateMetricGoal, 
  addMetricEntry, 
  fetchWidgets, 
  updateWidgets 
} from "@/modules/database/metrics/queries";
import { useAuth } from "./AuthContext";
import { toast } from "@/hooks/use-toast";
import { transformMetricsData, transformWidgetsData, getLatestMetricValue as getLatestValue } from "@/utils/metricsUtils";

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
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const fetchedMetricsData = await fetchMetrics();
        
        // Convert API response to our expected format
        const convertedMetrics = transformMetricsData(
          fetchedMetricsData.metrics || [], 
          fetchedMetricsData.goals || []
        );
        setMetrics(convertedMetrics);
        
        const fetchedWidgets = await fetchWidgets();
        const convertedWidgets = transformWidgetsData(fetchedWidgets);
        setWidgets(convertedWidgets);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch metrics data",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    if (user) {
      fetchInitialData();
    } else {
      setMetrics(initialMetricsState);
      setWidgets([]);
      setIsLoading(false);
    }
  }, [user]);

  const addMetric = async (data: { type: keyof BodyMetrics; value: number; date: string }) => {
    try {
      await addMetricEntry({
        type: data.type,
        value: data.value,
        date: data.date
      });
      
      const fetchedMetricsData = await fetchMetrics();
      const convertedMetrics = transformMetricsData(
        fetchedMetricsData.metrics || [], 
        fetchedMetricsData.goals || []
      );
      
      setMetrics(convertedMetrics);
      
      toast({
        title: "Metric added",
        description: `Your ${data.type} measurement has been added.`,
      });
    } catch (error) {
      console.error("Error adding metric:", error);
      toast({
        title: "Error",
        description: "Failed to add metric",
        variant: "destructive",
      });
    }
  };

  const setGoal = async (type: keyof BodyMetrics, goal: { target: number; deadline?: string }) => {
    try {
      await updateMetricGoal(type, goal);
      
      const fetchedMetricsData = await fetchMetrics();
      const convertedMetrics = transformMetricsData(
        fetchedMetricsData.metrics || [], 
        fetchedMetricsData.goals || []
      );
      
      setMetrics(convertedMetrics);
      
      toast({
        title: "Goal updated",
        description: `Your ${type} goal has been updated.`,
      });
    } catch (error) {
      console.error("Error setting goal:", error);
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
    }
  };

  const getLatestMetricValue = (type: keyof BodyMetrics) => {
    return getLatestValue(metrics, type);
  };

  const updateWidgetSettings = async (widgetSettings: WidgetConfig[]) => {
    try {
      await updateWidgets(widgetSettings);
      
      const fetchedWidgets = await fetchWidgets();
      const convertedWidgets = transformWidgetsData(fetchedWidgets);
      
      setWidgets(convertedWidgets);
      
      toast({
        title: "Widgets updated",
        description: "Your dashboard layout has been updated.",
      });
    } catch (error) {
      console.error("Error updating widget settings:", error);
      toast({
        title: "Error",
        description: "Failed to update widgets",
        variant: "destructive",
      });
    }
  };

  return (
    <MetricsContext.Provider value={{ 
      metrics, 
      widgets, 
      isLoading, 
      addMetric, 
      setGoal, 
      getLatestMetricValue, 
      updateWidgetSettings 
    }}>
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
