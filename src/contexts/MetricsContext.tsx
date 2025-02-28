
import React, { createContext, useContext, useState, useEffect } from "react";
import { BodyMetric, BodyGoal, BodyMetrics, WidgetConfig, WidgetType } from "@/types/metrics";
import { generateId } from "@/utils/workoutUtils";
import { toast } from "@/hooks/use-toast";

interface MetricsContextType {
  metrics: BodyMetrics;
  widgets: WidgetConfig[];
  addMetric: (type: keyof BodyMetrics, value: number) => void;
  setGoal: (type: keyof BodyMetrics, goal: BodyGoal) => void;
  deleteMetric: (type: keyof BodyMetrics, id: string) => void;
  updateWidgets: (widgets: WidgetConfig[]) => void;
}

const defaultWidgets: WidgetConfig[] = [
  { id: generateId(), type: WidgetType.TOTAL_WORKOUTS, position: 0, visible: true },
  { id: generateId(), type: WidgetType.TOTAL_EXERCISES, position: 1, visible: true },
  { id: generateId(), type: WidgetType.TOTAL_SETS, position: 2, visible: true },
  { id: generateId(), type: WidgetType.MOST_FREQUENT_EXERCISE, position: 3, visible: true },
  { id: generateId(), type: WidgetType.CURRENT_WEIGHT, position: 4, visible: false },
  { id: generateId(), type: WidgetType.WEIGHT_GOAL, position: 5, visible: false },
  { id: generateId(), type: WidgetType.BODY_FAT, position: 6, visible: false },
  { id: generateId(), type: WidgetType.MUSCLE_MASS, position: 7, visible: false },
];

const defaultMetrics: BodyMetrics = {
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

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export const MetricsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<BodyMetrics>(defaultMetrics);
  const [widgets, setWidgets] = useState<WidgetConfig[]>(defaultWidgets);

  // Load metrics and widget config from localStorage on initial load
  useEffect(() => {
    const savedMetrics = localStorage.getItem("bodyMetrics");
    const savedWidgets = localStorage.getItem("widgets");
    
    if (savedMetrics) {
      try {
        setMetrics(JSON.parse(savedMetrics));
      } catch (error) {
        console.error("Failed to parse body metrics from localStorage:", error);
        setMetrics(defaultMetrics);
      }
    }
    
    if (savedWidgets) {
      try {
        setWidgets(JSON.parse(savedWidgets));
      } catch (error) {
        console.error("Failed to parse widgets from localStorage:", error);
        setWidgets(defaultWidgets);
      }
    }
  }, []);

  // Save metrics and widgets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("bodyMetrics", JSON.stringify(metrics));
  }, [metrics]);
  
  useEffect(() => {
    localStorage.setItem("widgets", JSON.stringify(widgets));
  }, [widgets]);

  const addMetric = (type: keyof BodyMetrics, value: number) => {
    const newMetric: BodyMetric = {
      id: generateId(),
      date: new Date().toISOString(),
      value,
    };
    
    setMetrics(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        entries: [...prev[type].entries, newMetric].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
      }
    }));
    
    toast({
      title: "Metrik gespeichert",
      description: `Neue ${type} Messung wurde gespeichert.`,
    });
  };

  const setGoal = (type: keyof BodyMetrics, goal: BodyGoal) => {
    setMetrics(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        goal,
      }
    }));
    
    toast({
      title: "Ziel gesetzt",
      description: `Neues ${type} Ziel wurde gesetzt.`,
    });
  };

  const deleteMetric = (type: keyof BodyMetrics, id: string) => {
    setMetrics(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        entries: prev[type].entries.filter(entry => entry.id !== id),
      }
    }));
    
    toast({
      title: "Metrik gelöscht",
      description: `${type} Messung wurde gelöscht.`,
    });
  };

  const updateWidgets = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
    
    toast({
      title: "Widgets aktualisiert",
      description: "Deine Widget-Einstellungen wurden gespeichert.",
    });
  };

  return (
    <MetricsContext.Provider
      value={{
        metrics,
        widgets,
        addMetric,
        setGoal,
        deleteMetric,
        updateWidgets,
      }}
    >
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
