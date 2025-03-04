
import { useState, useEffect } from "react";
import { BodyMetrics, WidgetConfig } from "@/types/metrics";
import { 
  fetchMetrics, 
  updateMetricGoal, 
  addMetricEntry, 
  fetchWidgets, 
  updateWidgets 
} from "@/modules/database/metrics/queries";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { transformMetricsData, transformWidgetsData, getLatestMetricValue } from "@/utils/metricsUtils";

export const useMetrics = () => {
  const [metrics, setMetrics] = useState<BodyMetrics | null>(null);
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Fetch metrics and widgets data
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setMetrics(null);
        setWidgets([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch metrics data
        const metricsData = await fetchMetrics();
        const transformedMetrics = transformMetricsData(metricsData.metrics, metricsData.goals);
        setMetrics(transformedMetrics);

        // Fetch widgets data
        const widgetsData = await fetchWidgets();
        const transformedWidgets = transformWidgetsData(widgetsData);
        setWidgets(transformedWidgets);
      } catch (error) {
        console.error("Error loading metrics data:", error);
        toast({
          title: "Error",
          description: "Failed to load metrics data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Add a new metric entry
  const addMetric = async (data: { type: keyof BodyMetrics; value: number; date: string }) => {
    if (!metrics) return;

    try {
      // Optimistic update
      const newMetricEntry = {
        id: `temp-${Date.now()}`,
        date: data.date,
        value: data.value,
      };

      const updatedMetrics = { ...metrics };
      updatedMetrics[data.type].entries = [
        newMetricEntry,
        ...updatedMetrics[data.type].entries,
      ];
      setMetrics(updatedMetrics);

      // Send to server
      await addMetricEntry({
        type: data.type,
        value: data.value,
        date: data.date,
      });

      // Refresh data to get server-generated ID
      const metricsData = await fetchMetrics();
      const transformedMetrics = transformMetricsData(metricsData.metrics, metricsData.goals);
      setMetrics(transformedMetrics);

      toast({
        title: "Metric Added",
        description: `Your ${data.type} has been updated.`,
      });
    } catch (error: any) {
      console.error("Error adding metric:", error);
      
      // Revert optimistic update on error
      const metricsData = await fetchMetrics();
      const transformedMetrics = transformMetricsData(metricsData.metrics, metricsData.goals);
      setMetrics(transformedMetrics);
      
      toast({
        title: "Error",
        description: error.message || "Failed to add metric",
        variant: "destructive",
      });
    }
  };

  // Update a metric goal
  const setGoal = async (type: keyof BodyMetrics, goal: { target: number; deadline?: string }) => {
    if (!metrics) return;

    try {
      // Optimistic update
      const updatedMetrics = { ...metrics };
      updatedMetrics[type].goal = goal;
      setMetrics(updatedMetrics);

      // Send to server
      await updateMetricGoal(type, goal);

      toast({
        title: "Goal Updated",
        description: `Your ${type} goal has been updated.`,
      });
    } catch (error: any) {
      console.error("Error updating goal:", error);
      
      // Revert optimistic update on error
      const metricsData = await fetchMetrics();
      const transformedMetrics = transformMetricsData(metricsData.metrics, metricsData.goals);
      setMetrics(transformedMetrics);
      
      toast({
        title: "Error",
        description: error.message || "Failed to update goal",
        variant: "destructive",
      });
    }
  };

  // Delete a metric entry
  const deleteMetric = async (type: keyof BodyMetrics, id: string) => {
    if (!metrics) return;

    try {
      // Optimistic update
      const updatedMetrics = { ...metrics };
      updatedMetrics[type].entries = updatedMetrics[type].entries.filter(
        (entry) => entry.id !== id
      );
      setMetrics(updatedMetrics);

      // TODO: Implement server-side delete
      // For now, we'll just fetch the latest data to revert if needed
      
      toast({
        title: "Metric Deleted",
        description: `Your ${type} entry has been removed.`,
      });
    } catch (error: any) {
      console.error("Error deleting metric:", error);
      
      // Revert optimistic update on error
      const metricsData = await fetchMetrics();
      const transformedMetrics = transformMetricsData(metricsData.metrics, metricsData.goals);
      setMetrics(transformedMetrics);
      
      toast({
        title: "Error",
        description: error.message || "Failed to delete metric",
        variant: "destructive",
      });
    }
  };

  // Update widget settings (order, visibility)
  const updateWidgetSettings = async (widgetSettings: WidgetConfig[]) => {
    try {
      // Optimistic update
      setWidgets(widgetSettings);

      // Send to server
      const result = await updateWidgets(widgetSettings);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Dashboard Updated",
        description: "Your dashboard layout has been saved.",
      });
    } catch (error: any) {
      console.error("Error updating widgets:", error);
      
      // Revert optimistic update on error
      const widgetsData = await fetchWidgets();
      const transformedWidgets = transformWidgetsData(widgetsData);
      setWidgets(transformedWidgets);
      
      toast({
        title: "Error",
        description: error.message || "Failed to update dashboard",
        variant: "destructive",
      });
    }
  };

  return {
    metrics,
    widgets,
    isLoading,
    addMetric,
    deleteMetric,
    setGoal,
    getLatestMetricValue,
    updateWidgetSettings,
  };
};
