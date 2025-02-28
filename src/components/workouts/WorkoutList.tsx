
import React, { useState } from "react";
import { Workout } from "@/types/workout";
import { calculateWorkoutVolume, formatDate, findPreviousExercise, isPersonalRecord } from "@/utils/workoutUtils";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Calendar, ChevronDown, ChevronUp, Dumbbell, Trash } from "lucide-react";
import ExerciseItem from "./ExerciseItem";

const WorkoutList: React.FC = () => {
  const { workouts, deleteWorkout } = useWorkout();
  const [expandedWorkouts, setExpandedWorkouts] = useState<Record<string, boolean>>({});

  // Sort workouts by date (newest first)
  const sortedWorkouts = [...workouts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const toggleWorkout = (workoutId: string) => {
    setExpandedWorkouts((prev) => ({
      ...prev,
      [workoutId]: !prev[workoutId],
    }));
  };

  // Group workouts by month for better organization
  const groupedWorkouts: Record<string, Workout[]> = {};
  sortedWorkouts.forEach(workout => {
    const date = new Date(workout.date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (!groupedWorkouts[monthYear]) {
      groupedWorkouts[monthYear] = [];
    }
    
    groupedWorkouts[monthYear].push(workout);
  });

  if (workouts.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8 text-center animate-fade-in">
        <Dumbbell size={40} className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No Workouts Yet</h3>
        <p className="text-muted-foreground">
          Start logging your workouts to track your progress.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {Object.entries(groupedWorkouts).map(([monthYear, monthWorkouts]) => (
        <div key={monthYear}>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-muted-foreground" />
            {monthYear}
          </h3>
          
          <div className="space-y-4">
            {monthWorkouts.map((workout) => (
              <div key={workout.id} className="glass-card rounded-xl overflow-hidden">
                <div
                  className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 cursor-pointer"
                  onClick={() => toggleWorkout(workout.id)}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatDate(workout.date)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {workout.program} • {workout.phase}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {workout.exercises.length} exercises • {workout.exercises.reduce((total, ex) => total + ex.sets.length, 0)} sets • {calculateWorkoutVolume(workout).toLocaleString()} lbs total volume
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWorkout(workout.id);
                      }}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                      <Trash size={16} />
                    </button>
                    
                    {expandedWorkouts[workout.id] ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </div>
                </div>
                
                {expandedWorkouts[workout.id] && (
                  <div className="border-t border-border p-4">
                    {workout.exercises.map((exercise) => {
                      const prevExercise = findPreviousExercise(exercise.name, workouts);
                      const isPR = isPersonalRecord(exercise, prevExercise);
                      
                      return (
                        <ExerciseItem
                          key={exercise.id}
                          exercise={exercise}
                          workoutId={workout.id}
                          isPersonalRecord={isPR}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkoutList;
