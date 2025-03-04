
import { supabase } from '@/integrations/supabase/client';
import { BodyMetrics, WidgetConfig } from '@/types/metrics';

export const fetchMetrics = async () => {
  // Get the current user first
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error('Error getting user:', userError);
    return { metrics: [], goals: [] };
  }
  
  const userId = userData.user?.id;
  
  if (!userId) {
    console.log('No user ID available for metrics fetch');
    return { metrics: [], goals: [] };
  }

  const { data: metricsData, error: metricsError } = await supabase
    .from('body_metrics')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  const { data: goalsData, error: goalsError } = await supabase
    .from('body_goals')
    .select('*')
    .eq('user_id', userId);

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
  // Get the current user first
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error('Error getting user:', userError);
    throw new Error('Failed to authenticate user');
  }
  
  const userId = userData.user?.id;
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const { data: insertedData, error } = await supabase
    .from('body_metrics')
    .insert({
      metric_type: data.type,
      value: data.value,
      date: data.date,
      user_id: userId
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
  // Get the current user first
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error('Error getting user:', userError);
    throw new Error('Failed to authenticate user');
  }
  
  const userId = userData.user?.id;
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // First check if the goal exists
  const { data: existingGoal } = await supabase
    .from('body_goals')
    .select('id')
    .eq('metric_type', type)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingGoal) {
    // Update existing goal
    const { error } = await supabase
      .from('body_goals')
      .update({
        target: goal.target,
        deadline: goal.deadline,
      })
      .eq('id', existingGoal.id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating goal:', error);
      throw new Error('Failed to update metric goal');
    }
  } else {
    // Create new goal
    const { error } = await supabase
      .from('body_goals')
      .insert({
        metric_type: type,
        target: goal.target,
        deadline: goal.deadline,
        user_id: userId
      });

    if (error) {
      console.error('Error creating goal:', error);
      throw new Error('Failed to create metric goal');
    }
  }

  return true;
};

export const fetchWidgets = async () => {
  // Get the current user first
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error('Error getting user:', userError);
    return [];
  }
  
  const userId = userData.user?.id;
  
  if (!userId) {
    console.log('No user ID available for widgets fetch');
    return [];
  }

  const { data, error } = await supabase
    .from('widget_configs')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching widgets:', error);
    return [];
  }

  return data;
};

export const updateWidgets = async (widgets: WidgetConfig[]): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error('Failed to authenticate user');
    }
    
    const userId = userData.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // First delete all widgets for the user
    const { error: deleteError } = await supabase
      .from('widget_configs')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting widgets:', deleteError);
      throw new Error('Failed to update widgets');
    }

    // Then insert the new widgets
    const { error: insertError } = await supabase
      .from('widget_configs')
      .insert(widgets.map(w => ({
        id: w.id,
        type: w.type,
        position: w.position,
        visible: w.visible,
        user_id: userId
      })));

    if (insertError) {
      console.error('Error inserting widgets:', insertError);
      throw new Error('Failed to update widgets');
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
