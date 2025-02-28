
import React, { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartData } from "@/types/workout";
import { formatDate } from "@/utils/workoutUtils";

interface ProgressChartProps {
  chartData: ChartData;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ chartData }) => {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  // Get list of available exercises
  const exercises = Object.keys(chartData);

  // If no exercise is selected yet and we have exercises, select the first one
  React.useEffect(() => {
    if (!selectedExercise && exercises.length > 0) {
      setSelectedExercise(exercises[0]);
    }
  }, [chartData, exercises, selectedExercise]);

  // Prepare data for the selected exercise
  const data = selectedExercise
    ? chartData[selectedExercise]?.map((item) => ({
        date: formatDate(item.date),
        maxWeight: item.maxWeight,
        volumeLoad: Math.round(item.volumeLoad),
      }))
    : [];

  return (
    <div className="glass-card rounded-xl p-6 w-full h-[400px] animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold">Progress Tracker</h3>
        
        <div className="flex gap-2 flex-wrap">
          {exercises.map((exercise) => (
            <button
              key={exercise}
              onClick={() => setSelectedExercise(exercise)}
              className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                selectedExercise === exercise
                  ? "bg-primary text-white"
                  : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              {exercise}
            </button>
          ))}
        </div>
      </div>

      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.split(',')[0]}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              domain={[(dataMin: number) => Math.max(0, dataMin * 0.8), (dataMax: number) => dataMax * 1.2]}
            />
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              }}
            />
            <Area
              type="monotone"
              dataKey="maxWeight"
              stroke="hsl(var(--accent))"
              fillOpacity={1}
              fill="url(#colorWeight)"
              strokeWidth={2}
              name="Max Weight (lbs)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[80%] flex items-center justify-center text-muted-foreground">
          {exercises.length > 0
            ? "Not enough data to show progress for this exercise."
            : "Add workouts to see your progress."}
        </div>
      )}
    </div>
  );
};

export default ProgressChart;
