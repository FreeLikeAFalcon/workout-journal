
import { supabase } from "@/integrations/supabase/client";
import { BodyGoal, BodyMetric, WidgetConfig, WidgetType } from "./types";
import { generateId } from "@/utils/workoutUtils";

/**
 * Fetches all metrics for a user
 */
export const fetchMetrics = async (userId: string | undefined) => {
  if (!userId) return null;

  try {
    const { data: metricsData, error: metricsError } = await supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', userId);

    if (metricsError) {
      console.error("Error fetching metrics:", metricsError);
      return null;
    }

    const { data: goalsData, error: goalsError } = await supabase
      .from('body_goals')
      .select('*')
      .eq('user_id', userId);

    if (goalsError) {
      console.error("Error fetching goals:", goalsError);
      return null;
    }

    return { metrics: metricsData, goals: goalsData };
  } catch (error) {
    console.error("Error in fetchMetrics:", error);
    return null;
  }
};

/**
 * Adds a new metric entry
 */
export const addMetric = async (
  userId: string,
  metricType: string,
  value: number,
  date: string
): Promise<{ success: boolean; metricId?: string; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('body_metrics')
      .insert({
        user_id: userId,
        metric_type: metricType,
        value: value,
        date: date,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, metricId: data.id };
  } catch (error: any) {
    console.error("Error adding metric:", error);
    return { 
      success: false, 
      error: error.message || "Failed to add metric" 
    };
  }
};

/**
 * Deletes a metric entry
 */
export const deleteMetric = async (
  metricId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('body_metrics')
      .delete()
      .eq('id', metricId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting metric:", error);
    return { 
      success: false, 
      error: error.message || "Failed to delete metric" 
    };
  }
};

/**
 * Sets a goal for a metric type
 */
export const setGoal = async (
  userId: string,
  metricType: string,
  target: number,
  deadline?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: existingGoal } = await supabase
      .from('body_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('metric_type', metricType)
      .single();

    let operation;
    
    if (existingGoal) {
      operation = supabase
        .from('body_goals')
        .update({
          target: target,
          deadline: deadline || null,
        })
        .eq('id', existingGoal.id);
    } else {
      operation = supabase
        .from('body_goals')
        .insert({
          user_id: userId,
          metric_type: metricType,
          target: target,
          deadline: deadline || null,
        });
    }

    const { error } = await operation;

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error setting goal:", error);
    return { 
      success: false, 
      error: error.message || "Failed to set goal" 
    };
  }
};

/**
 * Fetches widgets for a user
 */
export const fetchWidgets = async (userId: string | undefined) => {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('widget_configs')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error("Error fetching widgets:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in fetchWidgets:", error);
    return null;
  }
};

/**
 * Updates widget configurations
 */
export const updateWidgets = async (
  userId: string,
  widgets: WidgetConfig[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error: deleteError } = await supabase
      .from('widget_configs')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      throw deleteError;
    }

    const widgetsToInsert = widgets.map(widget => ({
      user_id: userId,
      type: widget.type,
      position: widget.position,
      visible: widget.visible,
    }));

    const { error: insertError } = await supabase
      .from('widget_configs')
      .insert(widgetsToInsert);

    if (insertError) {
      throw insertError;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in updateWidgets:", error);
    return { 
      success: false, 
      error: error.message || "Failed to update widgets" 
    };
  }
};

/**
 * Saves default widgets for a new user
 */
export const saveDefaultWidgetsToDatabase = async (
  userId: string,
  defaultWidgets: WidgetConfig[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    const widgetsToInsert = defaultWidgets.map(widget => ({
      user_id: userId,
      type: widget.type,
      position: widget.position,
      visible: widget.visible,
    }));

    const { error } = await supabase
      .from('widget_configs')
      .insert(widgetsToInsert);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in saveDefaultWidgetsToDatabase:", error);
    return { 
      success: false, 
      error: error.message || "Failed to save default widgets" 
    };
  }
};
