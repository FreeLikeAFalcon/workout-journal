
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

const Index: React.FC = () => {
  const { workouts } = useWorkout();
  const { widgets } = useMetrics();
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  const stats = calculateWorkoutStats(workouts);
  const chartData = prepareChartData(workouts);
  
  // Get visible widgets sorted by position
  const visibleWidgets = widgets
    .filter(widget => widget.visible)
    .sort((a, b) => a.position - b.position);
  
  // Render a specific widget based on its type
  const renderWidget = (type: WidgetType) => {
    switch (type) {
      case WidgetType.TOTAL_WORKOUTS:
        return (
          <StatCard
            title="Workouts Gesamt"
            value={stats.totalWorkouts}
            icon={<Calendar size={20} />}
          />
        );
      case WidgetType.TOTAL_EXERCISES:
        return (
          <StatCard
            title="Übungen Gesamt"
            value={stats.totalExercises}
            icon={<Dumbbell size={20} />}
          />
        );
      case WidgetType.TOTAL_SETS:
        return (
          <StatCard
            title="Sätze Gesamt"
            value={stats.totalSets}
            icon={<Activity size={20} />}
          />
        );
      case WidgetType.MOST_FREQUENT_EXERCISE:
        return (
          <StatCard
            title="Häufigste Übung"
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
            title="Widgets anpassen"
          >
            <Settings size={16} />
          </button>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleWidgets.map(widget => (
              <React.Fragment key={widget.id}>
                {renderWidget(widget.type)}
              </React.Fragment>
            ))}
          </div>
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
          <h2 className="text-2xl font-semibold mb-4">Workout-Verlauf</h2>
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
