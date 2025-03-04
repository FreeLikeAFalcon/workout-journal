
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
import { transformMetricsData, transformWidgetsData } from "@/utils/metricsUtils";

export const useMetrics = () => {
  const [metrics, setMetrics] = useState<BodyMetrics | null>(null);
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, loading: authLoading } = useAuth();

  // Fetch metrics and widgets data when auth state changes
  useEffect(() => {
    // Don't try to fetch data until we know auth state
    if (authLoading) {
      return;
    }

    const loadData = async () => {
      // Reset error state on each load attempt
      setError(null);
      setIsLoading(true);
      
      // Initialize with empty data if no user
      if (!user) {
        console.log("No authenticated user, initializing with empty metrics data");
        const emptyMetrics = transformMetricsData([], []);
        const defaultWidgets = transformWidgetsData([]);
        
        setMetrics(emptyMetrics);
        setWidgets(defaultWidgets);
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching metrics data for user:", user.id);
        
        // Fetch metrics data
        const metricsData = await fetchMetrics();
        const transformedMetrics = transformMetricsData(metricsData.metrics, metricsData.goals);
        setMetrics(transformedMetrics);

        // Fetch widgets data
        const widgetsData = await fetchWidgets();
        const transformedWidgets = transformWidgetsData(widgetsData);
        setWidgets(transformedWidgets);
        
        console.log("Successfully loaded metrics data");
      } catch (err: any) {
        console.error("Error loading metrics data:", err);
        setError(err instanceof Error ? err : new Error(err?.message || "Failed to load metrics data"));
        
        // Still initialize with empty data on error to prevent UI crashes
        const emptyMetrics = transformMetricsData([], []);
        const defaultWidgets = transformWidgetsData([]);
        
        setMetrics(emptyMetrics);
        setWidgets(defaultWidgets);
        
        toast({
          title: "Error",
          description: "Failed to load metrics data: " + (err?.message || "Unknown error"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, authLoading]);

  // Add a new metric entry
  const addMetric = async (data: { type: keyof BodyMetrics; value: number; date: string }) => {
    if (!metrics) return;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add metrics",
        variant: "destructive",
      });
      return;
    }

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
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to set goals",
        variant: "destructive",
      });
      return;
    }

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
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to delete metrics",
        variant: "destructive",
      });
      return;
    }

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
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update dashboard settings",
        variant: "destructive",
      });
      return;
    }
    
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

  // Get the latest value for a specific metric type
  const getLatestMetricValue = (type: keyof BodyMetrics): number | undefined => {
    if (!metrics) return undefined;
    
    const entries = metrics[type]?.entries;
    if (!entries || entries.length === 0) return undefined;
    
    return entries[0].value; // Assuming entries are already sorted by date (newest first)
  };

  return {
    metrics,
    widgets,
    isLoading,
    error,
    addMetric,
    deleteMetric,
    setGoal,
    getLatestMetricValue,
    updateWidgetSettings,
  };
};
