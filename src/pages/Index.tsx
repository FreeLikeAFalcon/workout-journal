
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import WorkoutForm from "@/components/workouts/WorkoutForm";
import WorkoutList from "@/components/workouts/WorkoutList";
import ProgressChart from "@/components/ui/ProgressChart";
import StatCard from "@/components/ui/StatCard";
import { useWorkout } from "@/contexts/WorkoutContext";
import { useMetrics } from "@/contexts/MetricsContext";
import { calculateWorkoutStats, prepareChartData } from "@/utils/workoutUtils";
import { Activity, Calendar, Dumbbell, Target, Settings, AlertTriangle } from "lucide-react";
import MetricsForm from "@/components/metrics/MetricsForm";
import MetricsChart from "@/components/metrics/MetricsChart";
import MetricStatCards from "@/components/metrics/MetricStatCards";
import WidgetCustomizer from "@/components/ui/WidgetCustomizer";
import { WidgetType } from "@/types/metrics";
import { useLanguage } from "@/contexts/LanguageContext";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ChartData } from "@/types/workout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Index: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { workouts, isLoading: workoutsLoading, error: workoutsError } = useWorkout();
  const { widgets, isLoading: metricsLoading, error: metricsError } = useMetrics();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const { t } = useLanguage();
  
  const isLoading = workoutsLoading || metricsLoading || authLoading;
  const hasError = workoutsError || metricsError;
  
  // Check if user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/welcome");
    }
  }, [user, authLoading, navigate]);
  
  // Only calculate stats if workouts are loaded and no errors
  const stats = !workoutsLoading && !workoutsError ? calculateWorkoutStats(workouts) : {
    totalWorkouts: 0,
    totalExercises: 0,
    totalSets: 0,
    mostFrequentExercise: { name: '-', count: 0 }
  };
  
  // Ensure chartData is properly typed
  const chartData: ChartData = !workoutsLoading && !workoutsError ? prepareChartData(workouts) : {};
  
  // Only process widgets if they're loaded and no errors
  const visibleWidgets = !metricsLoading && !metricsError && widgets
    ? widgets
        .filter(widget => widget.visible === true)
        .sort((a, b) => a.position - b.position)
    : [];
  
  // Render a specific widget based on its type
  const renderWidget = (type: WidgetType) => {
    try {
      switch (type) {
        case WidgetType.TOTAL_WORKOUTS:
          return (
            <StatCard
              title={t('workouts.total')}
              value={stats.totalWorkouts}
              icon={<Calendar size={20} />}
            />
          );
        case WidgetType.TOTAL_EXERCISES:
          return (
            <StatCard
              title={t('exercises.total')}
              value={stats.totalExercises}
              icon={<Dumbbell size={20} />}
            />
          );
        case WidgetType.TOTAL_SETS:
          return (
            <StatCard
              title={t('sets.total')}
              value={stats.totalSets}
              icon={<Activity size={20} />}
            />
          );
        case WidgetType.MOST_FREQUENT_EXERCISE:
          return (
            <StatCard
              title={t('exercise.mostFrequent')}
              value={stats.mostFrequentExercise.name}
              icon={<Target size={20} />}
            />
          );
        case WidgetType.CURRENT_WEIGHT:
        case WidgetType.WEIGHT_GOAL:
        case WidgetType.BODY_FAT:
        case WidgetType.MUSCLE_MASS:
          return <MetricStatCards widgetType={type} />;
        default:
          return null;
      }
    } catch (err) {
      console.error(`Error rendering widget type ${type}:`, err);
      return (
        <StatCard
          title={`Error in widget`}
          value="Failed to render"
          icon={<AlertTriangle size={20} className="text-destructive" />}
        />
      );
    }
  };
  
  // If we're still loading, show a loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-8 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-secondary rounded-lg"></div>
            ))}
          </div>
          <div className="h-[320px] bg-secondary rounded-lg"></div>
          <div className="h-[200px] bg-secondary rounded-lg"></div>
          <div className="h-[200px] bg-secondary rounded-lg"></div>
          <div className="h-[400px] bg-secondary rounded-lg"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-8">
        {/* Error messages if any */}
        {hasError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error loading dashboard</AlertTitle>
            <AlertDescription>
              {workoutsError ? `Workouts error: ${workoutsError.message}` : ''}
              {metricsError ? `Metrics error: ${metricsError.message}` : ''}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Stats Section with Customization Button */}
        <div className="relative">
          <button 
            onClick={() => setIsCustomizing(true)}
            className="absolute -top-2 -right-2 bg-secondary hover:bg-secondary/80 p-2 rounded-full transition-all z-10"
            title={t('widgets.customize')}
          >
            <Settings size={16} />
          </button>
          
          {visibleWidgets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {visibleWidgets.map(widget => (
                <div key={widget.id}>
                  {renderWidget(widget.type)}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-muted-foreground">{t('widgets.none')}</p>
            </div>
          )}
        </div>
        
        {/* Body Metrics Chart */}
        <MetricsChart />
        
        {/* Body Metrics Form */}
        <MetricsForm />
        
        {/* Progress Chart */}
        <ProgressChart chartData={chartData} />
        
        {/* Add New Workout Form */}
        <WorkoutForm />
        
        {/* Workout History */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">{t('workoutHistory')}</h2>
          <WorkoutList />
        </div>
        
        {/* Widget Customizer Modal */}
        {isCustomizing && (
          <WidgetCustomizer onClose={() => setIsCustomizing(false)} />
        )}
      </div>
    </Layout>
  );
};

export default Index;
