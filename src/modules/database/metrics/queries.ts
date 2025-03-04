
import { supabase } from '@/integrations/supabase/client';
import { BodyMetrics, WidgetConfig } from '@/types/metrics';

export const fetchMetrics = async () => {
  try {
    // Get the current user first
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error(userError.message || 'Authentication error');
    }
    
    const userId = userData.user?.id;
    
    if (!userId) {
      console.log('No user ID available for metrics fetch');
      return { metrics: [], goals: [] };
    }

    // Fetch metrics
    const { data: metricsData, error: metricsError } = await supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (metricsError) {
      console.error('Error fetching metrics:', metricsError);
      throw new Error(metricsError.message || 'Failed to fetch metrics');
    }

    // Fetch goals
    const { data: goalsData, error: goalsError } = await supabase
      .from('body_goals')
      .select('*')
      .eq('user_id', userId);

    if (goalsError) {
      console.error('Error fetching goals:', goalsError);
      throw new Error(goalsError.message || 'Failed to fetch goals');
    }

    return {
      metrics: metricsData || [],
      goals: goalsData || []
    };
  } catch (error) {
    console.error('Error in fetchMetrics:', error);
    throw error;
  }
};

export const addMetricEntry = async (data: { type: string; value: number; date: string }) => {
  try {
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
  } catch (error) {
    console.error('Error in addMetricEntry:', error);
    throw error;
  }
};

export const updateMetricGoal = async (type: string, goal: { target: number; deadline?: string }) => {
  try {
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
    const { data: existingGoal, error: checkError } = await supabase
      .from('body_goals')
      .select('id')
      .eq('metric_type', type)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking for existing goal:', checkError);
      throw new Error('Failed to check for existing goal');
    }

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
  } catch (error) {
    console.error('Error in updateMetricGoal:', error);
    throw error;
  }
};

export const fetchWidgets = async () => {
  try {
    // Get the current user first
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error(userError.message || 'Authentication error');
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
      throw new Error(error.message || 'Failed to fetch widgets');
    }

    return data;
  } catch (error) {
    console.error('Error in fetchWidgets:', error);
    throw error;
  }
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
