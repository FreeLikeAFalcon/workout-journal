
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
import { formatDate, lbsToKg } from "@/utils/workoutUtils";
import { ChevronDown, LineChart, TrendingUp } from "lucide-react";

interface ProgressChartProps {
  chartData: ChartData;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ chartData }) => {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
        maxWeight: lbsToKg(item.maxWeight),
        volumeLoad: lbsToKg(item.volumeLoad),
      }))
    : [];

  const formatXAxis = (dateStr: string) => {
    // Extract just the day and month from the date string
    const parts = dateStr.split(',')[0].split('.');
    if (parts.length >= 2) {
      return `${parts[0]}.${parts[1]}.`;
    }
    return dateStr;
  };

  return (
    <div className="glass-card rounded-xl p-6 w-full h-[400px] animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp size={20} className="text-accent" />
          Fortschrittsverfolgung
        </h3>
        
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <span>{selectedExercise || "Übung auswählen"}</span>
            <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute z-30 top-full right-0 mt-1 bg-background border border-border rounded-lg shadow-lg w-64 max-h-64 overflow-y-auto">
              {exercises.map((exercise) => (
                <button
                  key={exercise}
                  onClick={() => {
                    setSelectedExercise(exercise);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-secondary/50 transition-colors ${
                    selectedExercise === exercise ? "bg-secondary" : ""
                  }`}
                >
                  {exercise}
                </button>
              ))}
            </div>
          )}
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
              tickFormatter={formatXAxis}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              domain={[0, 500]} // Set max to 500kg as requested
              tickFormatter={(value: number) => `${value} kg`}
            />
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              }}
              formatter={(value: number) => [`${value.toFixed(1)} kg`, "Max. Gewicht"]}
            />
            <Area
              type="monotone"
              dataKey="maxWeight"
              stroke="hsl(var(--accent))"
              fillOpacity={1}
              fill="url(#colorWeight)"
              strokeWidth={2}
              name="Max. Gewicht (kg)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[80%] flex items-center justify-center text-muted-foreground">
          {exercises.length > 0
            ? "Nicht genug Daten, um Fortschritte für diese Übung anzuzeigen."
            : "Füge Workouts hinzu, um deinen Fortschritt zu sehen."}
        </div>
      )}
    </div>
  );
};

export default ProgressChart;
