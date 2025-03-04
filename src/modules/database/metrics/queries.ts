
import { supabaseClient } from '@/integrations/supabase/client';
import { BodyMetrics, MetricEntry, MetricGoal, WidgetConfig } from '@/types/metrics';

export const fetchMetrics = async () => {
  const { data: metricsData, error: metricsError } = await supabaseClient
    .from('metrics')
    .select('*')
    .order('date', { ascending: false });

  const { data: goalsData, error: goalsError } = await supabaseClient
    .from('metric_goals')
    .select('*');

  if (metricsError) {
    console.error('Error fetching metrics:', metricsError);
    return { metrics: [], goals: [] };
  }

  if (goalsError) {
    console.error('Error fetching goals:', goalsError);
    return { metrics: metricsData || [], goals: [] };
  }

  return {
    metrics: metricsData || [],
    goals: goalsData || []
  };
};

export const addMetricEntry = async (data: { type: string; value: number; date: string }) => {
  const { data: insertedData, error } = await supabaseClient
    .from('metrics')
    .insert({
      metric_type: data.type,
      value: data.value,
      date: data.date,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding metric:', error);
    throw new Error('Failed to add metric entry');
  }

  return insertedData;
};

export const updateMetricGoal = async (type: string, goal: { target: number; deadline?: string }) => {
  // First check if the goal exists
  const { data: existingGoal } = await supabaseClient
    .from('metric_goals')
    .select('id')
    .eq('metric_type', type)
    .maybeSingle();

  if (existingGoal) {
    // Update existing goal
    const { error } = await supabaseClient
      .from('metric_goals')
      .update({
        target: goal.target,
        deadline: goal.deadline,
      })
      .eq('id', existingGoal.id);

    if (error) {
      console.error('Error updating goal:', error);
      throw new Error('Failed to update metric goal');
    }
  } else {
    // Create new goal
    const { error } = await supabaseClient
      .from('metric_goals')
      .insert({
        metric_type: type,
        target: goal.target,
        deadline: goal.deadline,
      });

    if (error) {
      console.error('Error creating goal:', error);
      throw new Error('Failed to create metric goal');
    }
  }

  return true;
};

export const fetchWidgets = async () => {
  const { data, error } = await supabaseClient
    .from('widgets')
    .select('*')
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching widgets:', error);
    return [];
  }

  return data;
};

export const updateWidgets = async (widgets: WidgetConfig[]) => {
  // First delete all widgets
  const { error: deleteError } = await supabaseClient
    .from('widgets')
    .delete()
    .neq('id', '0'); // Dummy condition to delete all

  if (deleteError) {
    console.error('Error deleting widgets:', deleteError);
    throw new Error('Failed to update widgets');
  }

  // Then insert the new widgets
  const { error: insertError } = await supabaseClient
    .from('widgets')
    .insert(widgets.map(w => ({
      id: w.id,
      type: w.type,
      position: w.position,
      visible: w.visible
    })));

  if (insertError) {
    console.error('Error inserting widgets:', insertError);
    throw new Error('Failed to update widgets');
  }

  return widgets;
};
