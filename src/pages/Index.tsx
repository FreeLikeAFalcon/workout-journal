
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import WorkoutForm from "@/components/workouts/WorkoutForm";
import WorkoutList from "@/components/workouts/WorkoutList";
import ProgressChart from "@/components/ui/ProgressChart";
import StatCard from "@/components/ui/StatCard";
import { useWorkout } from "@/contexts/WorkoutContext";
import { useMetrics } from "@/contexts/MetricsContext";
import { calculateWorkoutStats, prepareChartData } from "@/utils/workoutUtils";
import { Activity, Calendar, Dumbbell, Target, Settings } from "lucide-react";
import MetricsForm from "@/components/metrics/MetricsForm";
import MetricsChart from "@/components/metrics/MetricsChart";
import MetricStatCards from "@/components/metrics/MetricStatCards";
import WidgetCustomizer from "@/components/ui/WidgetCustomizer";
import { WidgetType } from "@/types/metrics";
import { useLanguage } from "@/contexts/LanguageContext";

const Index: React.FC = () => {
  const { workouts } = useWorkout();
  const { widgets } = useMetrics();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const { t } = useLanguage();
  
  const stats = calculateWorkoutStats(workouts);
  const chartData = prepareChartData(workouts);
  
  // Get visible widgets sorted by position - ensure we ONLY show widgets that are marked as visible
  const visibleWidgets = widgets
    .filter(widget => widget.visible === true)
    .sort((a, b) => a.position - b.position);
  
  // Render a specific widget based on its type
  const renderWidget = (type: WidgetType) => {
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
  };
  
  return (
    <Layout>
      <div className="space-y-8">
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
        {workouts.length > 0 ? (
          <ProgressChart chartData={chartData} />
        ) : (
          <div className="glass-card rounded-xl p-8 text-center">
            <Activity size={40} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">{t('charts.noWorkouts')}</h3>
            <p className="text-muted-foreground">{t('charts.addWorkoutsToSeeProgress')}</p>
          </div>
        )}
        
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
