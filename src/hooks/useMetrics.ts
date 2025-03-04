
import { useState, useEffect, useCallback } from "react";
import { 
  fetchMetrics, 
  fetchWidgets, 
  addMetric as addMetricToDb,
  deleteMetric as deleteMetricFromDb,
  setGoal as setGoalInDb,
  updateWidgets as updateWidgetsInDb,
  saveDefaultWidgetsToDatabase
} from "@/modules/database/metrics/queries";
import { BodyMetric, BodyGoal, BodyMetrics, WidgetConfig, WidgetType } from "@/modules/database/metrics/types";
import { generateId } from "@/utils/workoutUtils";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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

export function useMetrics() {
  const [metrics, setMetrics] = useState<BodyMetrics>(defaultMetrics);
  const [widgets, setWidgets] = useState<WidgetConfig[]>(defaultWidgets);
  const { user } = useAuth();

  // Helper function to transform database metrics to application structure
  const transformMetricsFromDb = useCallback((metricsData: any[], goalsData: any[]) => {
    const newMetrics = { ...defaultMetrics };

    metricsData?.forEach(metric => {
      const metricType = metric.metric_type as keyof BodyMetrics;
      newMetrics[metricType].entries.push({
        id: metric.id,
        date: metric.date,
        value: parseFloat(metric.value as unknown as string),
      });
    });

    for (const key in newMetrics) {
      const metricType = key as keyof BodyMetrics;
      newMetrics[metricType].entries.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }

    goalsData?.forEach(goal => {
      const metricType = goal.metric_type as keyof BodyMetrics;
      newMetrics[metricType].goal = {
        target: parseFloat(goal.target as unknown as string),
        deadline: goal.deadline || undefined,
      };
    });

    return newMetrics;
  }, []);

  // Load metrics and widgets from database or localStorage
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        const metricsData = await fetchMetrics(user.id);
        if (metricsData) {
          const transformedMetrics = transformMetricsFromDb(
            metricsData.metrics || [], 
            metricsData.goals || []
          );
          setMetrics(transformedMetrics);
        }

        const widgetsData = await fetchWidgets(user.id);
        if (widgetsData && widgetsData.length > 0) {
          const widgetConfigs = widgetsData.map(widget => ({
            id: widget.id,
            type: widget.type as WidgetType,
            position: widget.position,
            visible: widget.visible,
          }));
          setWidgets(widgetConfigs);
        } else {
          // If no widgets found, save defaults
          await saveDefaultWidgetsToDatabase(user.id, defaultWidgets);
          setWidgets(defaultWidgets);
        }
      } else {
        // Use localStorage for non-authenticated users
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
      }
    };

    loadData();
  }, [user, transformMetricsFromDb]);

  // Save to localStorage for non-authenticated users
  useEffect(() => {
    if (!user) {
      localStorage.setItem("bodyMetrics", JSON.stringify(metrics));
      localStorage.setItem("widgets", JSON.stringify(widgets));
    }
  }, [metrics, widgets, user]);

  // Get the latest value of a specific metric type
  const getLatestMetricValue = useCallback((type: keyof BodyMetrics): number | undefined => {
    const entries = metrics[type].entries;
    if (entries.length === 0) return undefined;
    
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return sortedEntries[0].value;
  }, [metrics]);

  // Add a new metric
  const addMetric = useCallback(async (metric: { 
    type: keyof BodyMetrics, 
    value: number, 
    date: string 
  }) => {
    const newMetric: BodyMetric = {
      id: generateId(),
      date: metric.date,
      value: metric.value,
    };
    
    // Optimistically update UI
    setMetrics(prev => ({
      ...prev,
      [metric.type]: {
        ...prev[metric.type],
        entries: [...prev[metric.type].entries, newMetric].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
      }
    }));
    
    if (user) {
      try {
        const result = await addMetricToDb(user.id, metric.type, metric.value, metric.date);

        if (!result.success) {
          console.error("Error adding metric:", result.error);
          // Refresh metrics from database in case of error
          const metricsData = await fetchMetrics(user.id);
          if (metricsData) {
            const transformedMetrics = transformMetricsFromDb(
              metricsData.metrics || [], 
              metricsData.goals || []
            );
            setMetrics(transformedMetrics);
          }
          
          toast({
            title: "Fehler",
            description: "Metrik konnte nicht gespeichert werden.",
            variant: "destructive",
          });
          return;
        }

        if (result.metricId) {
          // Update the ID with the one from the database
          setMetrics(prev => ({
            ...prev,
            [metric.type]: {
              ...prev[metric.type],
              entries: prev[metric.type].entries.map(entry => 
                entry.date === newMetric.date ? { ...entry, id: result.metricId! } : entry
              ),
            }
          }));
        }
      } catch (error) {
        console.error("Error in addMetric:", error);
      }
    }
    
    toast({
      title: "Metrik gespeichert",
      description: `Neue ${metric.type} Messung wurde gespeichert.`,
    });
  }, [user, transformMetricsFromDb]);

  // Set a goal for a specific metric type
  const setGoal = useCallback(async (type: keyof BodyMetrics, goal: BodyGoal) => {
    // Optimistically update UI
    setMetrics(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        goal,
      }
    }));
    
    if (user) {
      try {
        const result = await setGoalInDb(user.id, type, goal.target, goal.deadline);

        if (!result.success) {
          console.error("Error setting goal:", result.error);
          // Refresh metrics from database in case of error
          const metricsData = await fetchMetrics(user.id);
          if (metricsData) {
            const transformedMetrics = transformMetricsFromDb(
              metricsData.metrics || [], 
              metricsData.goals || []
            );
            setMetrics(transformedMetrics);
          }
          
          toast({
            title: "Fehler",
            description: "Ziel konnte nicht gespeichert werden.",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        console.error("Error in setGoal:", error);
      }
    }
    
    toast({
      title: "Ziel gesetzt",
      description: `Neues ${type} Ziel wurde gesetzt.`,
    });
  }, [user, transformMetricsFromDb]);

  // Delete a metric
  const deleteMetric = useCallback(async (type: keyof BodyMetrics, id: string) => {
    // Optimistically update UI
    setMetrics(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        entries: prev[type].entries.filter(entry => entry.id !== id),
      }
    }));
    
    if (user) {
      try {
        const result = await deleteMetricFromDb(id);

        if (!result.success) {
          console.error("Error deleting metric:", result.error);
          // Refresh metrics from database in case of error
          const metricsData = await fetchMetrics(user.id);
          if (metricsData) {
            const transformedMetrics = transformMetricsFromDb(
              metricsData.metrics || [], 
              metricsData.goals || []
            );
            setMetrics(transformedMetrics);
          }
          
          toast({
            title: "Fehler",
            description: "Metrik konnte nicht gelöscht werden.",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        console.error("Error in deleteMetric:", error);
      }
    }
    
    toast({
      title: "Metrik gelöscht",
      description: `${type} Messung wurde gelöscht.`,
    });
  }, [user, transformMetricsFromDb]);

  // Update widgets configuration
  const updateWidgets = useCallback(async (newWidgets: WidgetConfig[]) => {
    // Optimistically update UI
    setWidgets(newWidgets);
    
    if (user) {
      try {
        const result = await updateWidgetsInDb(user.id, newWidgets);

        if (!result.success) {
          console.error("Error updating widgets:", result.error);
          // Refresh widgets from database in case of error
          const widgetsData = await fetchWidgets(user.id);
          if (widgetsData) {
            const widgetConfigs = widgetsData.map(widget => ({
              id: widget.id,
              type: widget.type as WidgetType,
              position: widget.position,
              visible: widget.visible,
            }));
            setWidgets(widgetConfigs);
          }
          
          toast({
            title: "Fehler",
            description: "Widget-Einstellungen konnten nicht gespeichert werden.",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        console.error("Error in updateWidgets:", error);
      }
    }
    
    toast({
      title: "Widgets aktualisiert",
      description: "Deine Widget-Einstellungen wurden gespeichert.",
    });
  }, [user]);

  return {
    metrics,
    widgets,
    addMetric,
    setGoal,
    deleteMetric,
    updateWidgets,
    getLatestMetricValue
  };
}
