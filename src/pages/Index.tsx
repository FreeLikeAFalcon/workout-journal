
import React from "react";
import Layout from "@/components/layout/Layout";
import WorkoutForm from "@/components/workouts/WorkoutForm";
import WorkoutList from "@/components/workouts/WorkoutList";
import ProgressChart from "@/components/ui/ProgressChart";
import StatCard from "@/components/ui/StatCard";
import { useWorkout } from "@/contexts/WorkoutContext";
import { calculateWorkoutStats, prepareChartData } from "@/utils/workoutUtils";
import { Activity, Calendar, Dumbbell, Target } from "lucide-react";

const Index: React.FC = () => {
  const { workouts } = useWorkout();
  const stats = calculateWorkoutStats(workouts);
  const chartData = prepareChartData(workouts);
  
  return (
    <Layout>
      <div className="space-y-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Workouts Gesamt"
            value={stats.totalWorkouts}
            icon={<Calendar size={20} />}
          />
          <StatCard
            title="Übungen Gesamt"
            value={stats.totalExercises}
            icon={<Dumbbell size={20} />}
          />
          <StatCard
            title="Sätze Gesamt"
            value={stats.totalSets}
            icon={<Activity size={20} />}
          />
          <StatCard
            title="Häufigste Übung"
            value={stats.mostFrequentExercise.name}
            icon={<Target size={20} />}
          />
        </div>
        
        {/* Progress Chart */}
        <ProgressChart chartData={chartData} />
        
        {/* Add New Workout Form */}
        <WorkoutForm />
        
        {/* Workout History */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Workout-Verlauf</h2>
          <WorkoutList />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
