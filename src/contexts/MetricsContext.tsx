import React, { createContext, useContext, useState, useEffect } from "react";
import { BodyMetric, BodyGoal, BodyMetrics, WidgetConfig, WidgetType } from "@/types/metrics";
import { generateId } from "@/utils/workoutUtils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MetricsContextType {
  metrics: BodyMetrics;
  widgets: WidgetConfig[];
  addMetric: (metric: { type: keyof BodyMetrics, value: number, date: string }) => Promise<void>;
  setGoal: (type: keyof BodyMetrics, goal: BodyGoal) => void;
  deleteMetric: (type: keyof BodyMetrics, id: string) => void;
  deleteAllMetrics: (type: keyof BodyMetrics) => Promise<void>;
  updateWidgets: (widgets: WidgetConfig[]) => void;
  getLatestMetricValue: (type: keyof BodyMetrics) => number | undefined;
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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMetrics();
      fetchWidgets();
    } else {
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
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem("bodyMetrics", JSON.stringify(metrics));
      localStorage.setItem("widgets", JSON.stringify(widgets));
    }
  }, [metrics, widgets, user]);

  const fetchMetrics = async () => {
    try {
      const { data: metricsData, error: metricsError } = await supabase
        .from('body_metrics')
        .select('*')
        .eq('user_id', user?.id);

      if (metricsError) {
        console.error("Error fetching metrics:", metricsError);
        return;
      }

      const { data: goalsData, error: goalsError } = await supabase
        .from('body_goals')
        .select('*')
        .eq('user_id', user?.id);

      if (goalsError) {
        console.error("Error fetching goals:", goalsError);
        return;
      }

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

      setMetrics(newMetrics);
    } catch (error) {
      console.error("Error in fetchMetrics:", error);
    }
  };

  const fetchWidgets = async () => {
    try {
      const { data, error } = await supabase
        .from('widget_configs')
        .select('*')
        .eq('user_id', user?.id);

      if (error) {
        console.error("Error fetching widgets:", error);
        return;
      }

      if (data && data.length > 0) {
        const widgetConfigs = data.map(widget => ({
          id: widget.id,
          type: widget.type as WidgetType,
          position: widget.position,
          visible: widget.visible,
        }));
        setWidgets(widgetConfigs);
      } else {
        saveDefaultWidgetsToDatabase();
      }
    } catch (error) {
      console.error("Error in fetchWidgets:", error);
    }
  };

  const saveDefaultWidgetsToDatabase = async () => {
    if (!user) return;

    try {
      const widgetsToInsert = defaultWidgets.map(widget => ({
        user_id: user.id,
        type: widget.type,
        position: widget.position,
        visible: widget.visible,
      }));

      const { error } = await supabase
        .from('widget_configs')
        .insert(widgetsToInsert);

      if (error) {
        console.error("Error saving default widgets:", error);
      } else {
        fetchWidgets();
      }
    } catch (error) {
      console.error("Error in saveDefaultWidgetsToDatabase:", error);
    }
  };

  const getLatestMetricValue = (type: keyof BodyMetrics): number | undefined => {
    const entries = metrics[type].entries;
    if (entries.length === 0) return undefined;
    
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return sortedEntries[0].value;
  };

  const addMetric = async (metric: { type: keyof BodyMetrics, value: number, date: string }) => {
    const newMetric: BodyMetric = {
      id: generateId(),
      date: metric.date,
      value: metric.value,
    };
    
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
        const { data, error } = await supabase
          .from('body_metrics')
          .insert({
            user_id: user.id,
            metric_type: metric.type,
            value: metric.value,
            date: metric.date,
          })
          .select()
          .single();

        if (error) {
          console.error("Error adding metric:", error);
          fetchMetrics();
          toast({
            title: "Fehler",
            description: "Metrik konnte nicht gespeichert werden.",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          setMetrics(prev => ({
            ...prev,
            [metric.type]: {
              ...prev[metric.type],
              entries: prev[metric.type].entries.map(entry => 
                entry.date === newMetric.date ? { ...entry, id: data.id } : entry
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
  };

  const setGoal = async (type: keyof BodyMetrics, goal: BodyGoal) => {
    setMetrics(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        goal,
      }
    }));
    
    if (user) {
      try {
        const { data: existingGoal } = await supabase
          .from('body_goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('metric_type', type)
          .single();

        let operation;
        
        if (existingGoal) {
          operation = supabase
            .from('body_goals')
            .update({
              target: goal.target,
              deadline: goal.deadline || null,
            })
            .eq('id', existingGoal.id);
        } else {
          operation = supabase
            .from('body_goals')
            .insert({
              user_id: user.id,
              metric_type: type,
              target: goal.target,
              deadline: goal.deadline || null,
            });
        }

        const { error } = await operation;

        if (error) {
          console.error("Error setting goal:", error);
          fetchMetrics();
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
  };

  const deleteMetric = async (type: keyof BodyMetrics, id: string) => {
    setMetrics(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        entries: prev[type].entries.filter(entry => entry.id !== id),
      }
    }));
    
    if (user) {
      try {
        const { error } = await supabase
          .from('body_metrics')
          .delete()
          .eq('id', id);

        if (error) {
          console.error("Error deleting metric:", error);
          fetchMetrics();
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
  };

  const deleteAllMetrics = async (type: keyof BodyMetrics) => {
    setMetrics(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        entries: []
      }
    }));
    
    if (user) {
      try {
        const { error } = await supabase
          .from('body_metrics')
          .delete()
          .eq('user_id', user.id)
          .eq('metric_type', type);

        if (error) {
          console.error("Error deleting all metrics:", error);
          fetchMetrics();
          toast({
            title: "Fehler",
            description: `${type}-Werte konnten nicht gelöscht werden.`,
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        console.error("Error in deleteAllMetrics:", error);
      }
    }
    
    toast({
      title: "Werte gelöscht",
      description: `Alle ${type}-Werte wurden gelöscht.`,
    });
  };

  const updateWidgets = async (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
    
    if (user) {
      try {
        const { error: deleteError } = await supabase
          .from('widget_configs')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) {
          console.error("Error deleting widgets:", deleteError);
          return;
        }

        const widgetsToInsert = newWidgets.map(widget => ({
          user_id: user.id,
          type: widget.type,
          position: widget.position,
          visible: widget.visible,
        }));

        const { error: insertError } = await supabase
          .from('widget_configs')
          .insert(widgetsToInsert);

        if (insertError) {
          console.error("Error updating widgets:", insertError);
          fetchWidgets();
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
  };

  return (
    <MetricsContext.Provider
      value={{
        metrics,
        widgets,
        addMetric,
        setGoal,
        deleteMetric,
        deleteAllMetrics,
        updateWidgets,
        getLatestMetricValue
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
