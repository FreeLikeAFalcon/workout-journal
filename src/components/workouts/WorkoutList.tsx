import React, { useState, useMemo } from "react";
import { Workout } from "@/types/workout";
import { calculateWorkoutVolume, formatDate, findPreviousExercise, isPersonalRecord, lbsToKg } from "@/utils/workoutUtils";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Calendar, ChevronDown, ChevronUp, Dumbbell, Trash, Filter, FolderOpen, FolderClosed } from "lucide-react";
import ExerciseItem from "./ExerciseItem";
import { useLanguage } from "@/contexts/LanguageContext";

const WorkoutList: React.FC = () => {
  const { workouts, deleteWorkout } = useWorkout();
  const [expandedWorkouts, setExpandedWorkouts] = useState<Record<string, boolean>>({});
  const [expandedPrograms, setExpandedPrograms] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState({
    program: "",
    phase: "",
    startDate: "",
    endDate: "",
  });
  const [groupBy, setGroupBy] = useState<"date" | "program">("date");
  const { t } = useLanguage();

  // Extract all unique programs and phases for filter dropdowns
  const { programs, phases } = useMemo(() => {
    const programsSet = new Set<string>();
    const phasesSet = new Set<string>();
    
    workouts.forEach(workout => {
      programsSet.add(workout.program);
      phasesSet.add(workout.phase);
    });
    
    return {
      programs: Array.from(programsSet),
      phases: Array.from(phasesSet)
    };
  }, [workouts]);

  // Sort workouts by date (newest first)
  const sortedWorkouts = [...workouts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Apply filters
  const filteredWorkouts = sortedWorkouts.filter(workout => {
    const matchesProgram = !filters.program || workout.program === filters.program;
    const matchesPhase = !filters.phase || workout.phase === filters.phase;
    
    let matchesDate = true;
    if (filters.startDate) {
      const workoutDate = new Date(workout.date);
      const startDate = new Date(filters.startDate);
      matchesDate = workoutDate >= startDate;
    }
    
    if (filters.endDate && matchesDate) {
      const workoutDate = new Date(workout.date);
      const endDate = new Date(filters.endDate);
      // Set the end date to the end of the day
      endDate.setHours(23, 59, 59, 999);
      matchesDate = workoutDate <= endDate;
    }
    
    return matchesProgram && matchesPhase && matchesDate;
  });

  const toggleWorkout = (workoutId: string) => {
    setExpandedWorkouts((prev) => ({
      ...prev,
      [workoutId]: !prev[workoutId],
    }));
  };

  const toggleProgram = (program: string) => {
    setExpandedPrograms((prev) => ({
      ...prev,
      [program]: !prev[program],
    }));
  };

  const resetFilters = () => {
    setFilters({
      program: "",
      phase: "",
      startDate: "",
      endDate: "",
    });
  };

  // Group workouts by month (for date grouping)
  const workoutsByMonth: Record<string, Workout[]> = {};
  filteredWorkouts.forEach(workout => {
    const date = new Date(workout.date);
    const monthYear = date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
    
    if (!workoutsByMonth[monthYear]) {
      workoutsByMonth[monthYear] = [];
    }
    
    workoutsByMonth[monthYear].push(workout);
  });

  // Group workouts by program
  const workoutsByProgram: Record<string, Workout[]> = {};
  filteredWorkouts.forEach(workout => {
    if (!workoutsByProgram[workout.program]) {
      workoutsByProgram[workout.program] = [];
    }
    
    workoutsByProgram[workout.program].push(workout);
  });

  if (workouts.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8 text-center animate-fade-in">
        <Dumbbell size={40} className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">{t('workouts.none')}</h3>
        <p className="text-muted-foreground">
          {t('workouts.startTracking')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filters */}
      <div className="glass-card rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} />
          <h3 className="font-medium">{t('filter')}</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">{t('program')}</label>
            <select
              value={filters.program}
              onChange={(e) => setFilters({ ...filters, program: e.target.value })}
              className="w-full p-2 border border-input rounded-lg bg-transparent"
            >
              <option value="">{t('allPrograms')}</option>
              {programs.map(program => (
                <option key={program} value={program}>{program}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-muted-foreground mb-1">{t('phase')}</label>
            <select
              value={filters.phase}
              onChange={(e) => setFilters({ ...filters, phase: e.target.value })}
              className="w-full p-2 border border-input rounded-lg bg-transparent"
            >
              <option value="">{t('allPhases')}</option>
              {phases.map(phase => (
                <option key={phase} value={phase}>{phase}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-muted-foreground mb-1">{t('fromDate')}</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full p-2 border border-input rounded-lg bg-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm text-muted-foreground mb-1">{t('toDate')}</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full p-2 border border-input rounded-lg bg-transparent"
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">{t('groupBy')}:</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as "date" | "program")}
              className="p-1 border border-input rounded-lg bg-transparent"
            >
              <option value="date">{t('date')}</option>
              <option value="program">{t('program')}</option>
            </select>
          </div>
          
          <button
            onClick={resetFilters}
            className="text-sm text-accent hover:text-accent/80 transition-colors"
          >
            {t('resetFilters')}
          </button>
        </div>
      </div>
      
      {/* No filtered workouts message */}
      {filteredWorkouts.length === 0 && (
        <div className="glass-card rounded-xl p-8 text-center animate-fade-in">
          <Filter size={40} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">{t('workouts.noMatchingWorkouts')}</h3>
          <p className="text-muted-foreground">
            {t('workouts.tryDifferentFilters')}
          </p>
        </div>
      )}
      
      {/* Workouts grouped by date */}
      {filteredWorkouts.length > 0 && groupBy === "date" && Object.entries(workoutsByMonth).map(([monthYear, monthWorkouts]) => (
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
                      {workout.exercises.length} Übungen • {workout.exercises.reduce((total, ex) => total + ex.sets.length, 0)} Sätze • {lbsToKg(calculateWorkoutVolume(workout)).toFixed(1)} kg Gesamtvolumen
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
      
      {/* Workouts grouped by program */}
      {filteredWorkouts.length > 0 && groupBy === "program" && Object.entries(workoutsByProgram).map(([programName, programWorkouts]) => (
        <div key={programName} className="glass-card rounded-xl overflow-hidden mb-4">
          <div
            className="p-4 flex justify-between items-center cursor-pointer bg-secondary/30"
            onClick={() => toggleProgram(programName)}
          >
            <div className="flex items-center gap-2">
              {expandedPrograms[programName] ? <FolderOpen size={18} /> : <FolderClosed size={18} />}
              <h3 className="font-medium">{programName}</h3>
              <span className="text-sm text-muted-foreground">
                ({programWorkouts.length} Workouts)
              </span>
            </div>
            
            {expandedPrograms[programName] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          
          {expandedPrograms[programName] && (
            <div className="p-4">
              <div className="space-y-4">
                {programWorkouts.map((workout) => (
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
                          <span className="text-sm text-accent font-medium">
                            {workout.phase}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {workout.exercises.length} Übungen • {workout.exercises.reduce((total, ex) => total + ex.sets.length, 0)} Sätze • {lbsToKg(calculateWorkoutVolume(workout)).toFixed(1)} kg Gesamtvolumen
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
          )}
        </div>
      ))}
    </div>
  );
};

export default WorkoutList;
